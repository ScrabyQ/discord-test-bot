//TODO: доделать модуль hde и вывод кол-во тикетов
// тегирование Валеры в оповещении о балансе смс

const fs = require("fs");
const https = require("https")
const Discord = require("discord.js");
const client = new Discord.Client();
// let guild = new Discord.GuildChannel(client, {type: 'text'});
const express = require("express");
const cookie = require("cookie-parser");
const app = require("express")();
const path = require("path");
const bp = require("body-parser");
const cfg = require("./config.json");
const mysql = require("mysql2");
var cron = require("node-cron");
let SMSru = require("sms_ru");
let hde = require("./hdeconnect.js");
let config = require("./config.json");
let sms = new SMSru(config.SMSRU_TOKEN);

let jsonParser = bp.json();
let url_encode = bp.urlencoded({ extended: true });

let today = new Date().toISOString().split("T")[0];

let date1, date2;

let userData = {};
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "discordTasks",
  password: "password",
});
app.use(cookie());
app.use(bp.json());
app.use(url_encode);
//#region подгрузка страниц и компонентов
app.get(
  "/auth.html",
  express.static(path.join(__dirname, "/js")),
  (req, res) => {
    try {
      connection.query("select * from users", (err, data) => {
        if (!err) {
          console.log(data.length);
          if (req.cookies.l && req.cookies.p) {
            for (let key in data) {
              if (
                req.cookies.l == data[key].log &&
                req.cookies.p == data[key].pas
              ) {
                res.redirect("index.html");
              }
            }
          } else {
            res.sendFile("auth.html", { root: __dirname });
          }
        } else console.log(err);
      });
    } catch (err) {
      console.log(err);
      res.sendFile("auth.html", { root: __dirname });
    }
  }
);
app.post("/auth", url_encode, (req, res) => {
  try {
    connection.query("select * from users", (err, data) => {
      if (!err) {
        let i = 0;
        for (let key in data) {
          i++;
          if (req.body.log == data[key].log && req.body.pass == data[key].pas) {
            res.cookie("l", req.body.log, {
              expires: new Date(Date.now() + 18000000),
            });
            res.cookie("p", req.body.pass, {
              expires: new Date(Date.now() + 18000000),
            });
            res.redirect("index.html");
          } else if (i == data.length) {
            res.redirect("auth.html");
          }
        }
      } else console.log(err);
    });
  } catch (err) {
    console.log(err);
    res.sendFile("auth.html", { root: __dirname });
  }
});
app.get(
  "/index.html",
  express.static(path.join(__dirname, "/js")),
  (req, res) => {
    try {
      connection.query("select * from users", (err, data) => {
        if (!err) {
          if (req.cookies.l && req.cookies.p) {
            for (let key in data) {
              if (
                req.cookies.l == data[key].log &&
                req.cookies.p == data[key].pas
              ) {
                res.sendFile("index.html", { root: __dirname });
              }
            }
          } else {
            res.redirect("auth.html");
          }
        } else console.log(err);
      });
    } catch (err) {
      console.log(err);
      res.sendFile("auth.html", { root: __dirname });
    }
  }
);
app.get("/", express.static(path.join(__dirname, "/js")), (req, res) => {
  try {
    connection.query("select * from users", (err, data) => {
      if (!err) {
        if (req.cookies.l && req.cookies.p) {
          for (let key in data) {
            if (
              req.cookies.l == data[key].log &&
              req.cookies.p == data[key].pas
            ) {
              res.sendFile("index.html", { root: __dirname });
            }
          }
        } else {
          res.redirect("auth.html");
        }
      } else console.log(err);
    });
  } catch (err) {
    console.log(err);
    res.sendFile("auth.html", { root: __dirname });
  }
});
// app.get('/', express.static(path.join(__dirname, '/img')), (req, res) => {
//   res.sendFile('index.html', { root: __dirname });
// })
app.get(
  "/tasks.html",
  express.static(path.join(__dirname, "/js")),
  (req, res) => {
    res.sendFile("tasks.html", { root: __dirname });
  }
);
app.get(
  "/done.html",
  express.static(path.join(__dirname, "/js")),
  (req, res) => {
    res.sendFile("done.html", { root: __dirname });
  }
);
app.get(
  "/balances.html",
  express.static(path.join(__dirname, "/js")),
  (req, res) => {
    res.sendFile("balances.html", { root: __dirname });
  }
);
app.get(
  "/tickets.html",
  express.static(path.join(__dirname, "/js")),
  (req, res) => {
    res.sendFile("tickets.html", { root: __dirname });
  }
);
app.get(
  "/monitoring.html",
  express.static(path.join(__dirname, "/js")),
  (req, res) => {
    res.sendFile("monitoring.html", { root: __dirname });
  }
);
app.get("/js/script.js", (req, res) => {
  res.sendFile("js/script.js", { root: __dirname });
});
app.get("/js/done.js", (req, res) => {
  res.sendFile("js/done.js", { root: __dirname });
});
app.get("/js/toggle.js", (req, res) => {
  res.sendFile("js/toggle.js", { root: __dirname });
});
app.get(`/css/style.css`, (req, res) => {
  res.sendFile(`css/style.css`, { root: __dirname });
});
app.get(`/img/back.png`, (req, res) => {
  res.sendFile(`img/back.png`, { root: __dirname });
});
app.get(`/img/backdark.png`, (req, res) => {
  res.sendFile(`img/backdark.png`, { root: __dirname });
});
app.get(`/img/empty.gif`, (req, res) => {
  res.sendFile(`img/empty.gif`, { root: __dirname });
});
//#endregion
app.get("/get_tasks", (req, res) => {
  connection.query("SELECT * FROM inWorkTasks", (err, data) => {
    res.json(data);
  });
});
app.get("/get_done_tasks", (req, res) => {
  connection.query("SELECT * FROM doneTasks", (err, data) => {
    res.json(data);
  });
});
app.get("/iwt_filter", (err, data) => {
  let queryDate = `SELECT * 
  FROM inWorkTasks 
  WHERE DATE(created_at) 
  BETWEEN 
  STR_TO_DATE("${date1}", "%Y-%m-%d") 
  and
  STR_TO_DATE("${date2}", "%Y-%m-%d")`;
  connection.query(queryDate, (err, data) => {
    res.json(data);
  });
});
app.post("/iwt_filter", url_encode, (req, res) => {
  date1 = req.body.date1;
  date2 = req.body.date2;
  res.sendFile("iwt/data.html", { root: __dirname });
  res.status(200);
});
app.post("/delete_task", jsonParser, (req, res) => {
  if (req.body.type === "itw") {
    let queryData = `delete from inWorkTasks where id="${req.body.id}"`;
    connection.query(queryData, (err, data) => {
      err ? console.log(err) : console.log("data has been deleted");
    });
  } else if (req.body.type === "dt") {
    let queryData = `delete from doneTasks where id="${req.body.id}"`;
    connection.query(queryData, (err, data) => {
      err ? console.log(err) : console.log("data has been deleted");
    });
  }
});
app.post("/complete_task", jsonParser, (req, res) => {
  console.log("вы в голосе");
  if (req.body.type === "itw") {
    console.log("проверка на тип пройдена");
    let queryData = `select * from inWorkTasks where id="${req.body.id}"`;
    let dbData;
    connection.query(queryData, (err, res) => {
      if (!err) {
        let queryIntoDone = `insert into 
        doneTasks(head, description, deadline, responsible, created_at, done_at)
        values('${res[0].head}', 
        '${res[0].description}', 
        '${res[0].deadline}', 
        '${res[0].responsible}', 
        '${
          res[0].created_at.toISOString().split("T")[0].slice(0, 9) +
          `${Number(
            res[0].created_at.toISOString().split("T")[0].slice(9, 10)
          )}`
        }', 
        '${today}')`;
        connection.query(queryIntoDone, (err, doneData) => {
          if (!err) {
            let finishQuery = `delete from inWorkTasks where id="${req.body.id}"`;
            connection.query(finishQuery, (err, fdata) => {
              err ? console.log(err) : console.log("task has been completed");
            });
          } else console.log(err);
        });
      } else console.log(err);
    });
  }
});
app.post("/create_task", url_encode, (req, res) => {
  console.log(sitedateToISO(req.body.deadline));
  let queryData = `INSERT INTO inWorkTasks(head, description, deadline, responsible, created_at) VALUES('${req.body.head}', '${req.body.description}', '${req.body.deadline}', '${req.body.responsible}', '${today}')`;
  connection.query(queryData, (err, data) => {
    err ? console.log(err) : console.log("task has been created");
  });
  res.redirect("tasks.html");
  res.status(200).end();
});
app.post("/dishook/slacontrole", jsonParser, (req, res) => {
  client.channels.cache.get("844987698594054165").send({
    embed: {
      color: 15294560,
      author: {
        name: client.user.username,
        icon_url: "https://klike.net/uploads/posts/2019-03/1551511801_1.jpg",
      },
      title: "Не забыли про заявку?",
      url: `https://itgt.helpdeskeddy.com/ru/ticket/list/filter/id/1/ticket/${req.body.id}/#/`,
      description: "Время последней активности превысило полчаса!",
      fields: [
        {
          name: "Тема тикета",
          value: req.body.name,
        },
        {
          name: "Оставил заявку",
          value: req.body.author,
        },
        {
          name: "Время последнего ответа",
          value: req.body.message,
        },
      ],
    },
  });

  res.send("send to Discord channel");
  res.status(200).end();
});
// app.post('/dishook/one_day', jsonParser, (req, res)=> {
//   client.channels.cache.get('844987698594054165').send({
//     embed: {
//       color: 15105570, 
//       author: {
//         name: client.user.username,
//         icon_url: "https://klike.net/uploads/posts/2019-03/1551511801_1.jpg",
//       },
//       title: "Прошли сутки с последнего стука клиента",
//       url: `https://itgt.helpdeskeddy.com/ru/ticket/list/filter/id/1/ticket/${req.body.id}/#/`,
//       description: "Информация тикету",
//       fields: [
//         {
//           name: "Тема тикета",
//           value: req.body.name,
//         },
//         {
//           name: "Оставил заявку",
//           value: req.body.author,
//         },
//         {
//           name: "Последнее сообщение",
//           value: req.body.message,
//         },
//       ]
//     }
//   })
// })
app.post("/dishook/mess", jsonParser, (req, res) => {
  console.log(req.body.message)
  
    console.log(req.body.embed)

  client.channels.cache.get("844987698594054165").send({
    embed: {
      color: 15105570,
      author: {
        name: client.user.username,
        icon_url: "https://klike.net/uploads/posts/2019-03/1551511801_1.jpg",
      },
      title: "Новый ответ в тикете!",
      url: `https://itgt.helpdeskeddy.com/ru/ticket/list/filter/id/1/ticket/${req.body.id}/#/`,
      description: "Информация по новому ответу в тикете",
      fields: [
        {
          name: "Тема тикета",
          value: req.body.name,
        },
        {
          name: "Оставил заявку",
          value: req.body.author,
        },
        {
          name: "Новое сообщение",
          value: req.body.message,
        },
      ],
    },
  });
  res.send("send to Discord channel");
  res.status(200).end();
});
app.post("/dishook", jsonParser, (req, res) => {
  client.channels.cache.get("844987698594054165").send({
    embed: {
      color: 3447003,
      author: {
        name: client.user.username,
        icon_url: "https://klike.net/uploads/posts/2019-03/1551511801_1.jpg",
      },
      title: "Новая заявка в HDE!",
      url: `https://itgt.helpdeskeddy.com/ru/ticket/list/filter/id/1/ticket/${req.body.id}/#/`,
      description: "Информация по новому тикету",
      fields: [
        {
          name: "Тема тикета",
          value: req.body.name,
        },
        {
          name: "Оставил заявку",
          value: req.body.author,
        },
        {
          name: "Комментарий",
          value: req.body.message,
        },
      ],
    },
  });
  res.send("send to Discord channel");
  res.status(200).end();
});
//infobot
app.post("/info_monitor", jsonParser, (req, res) => {
  console.log('infobot')
  if (req.body.status === 'ok'){ 
    client.channels.cache
        .get("870318593412309042")
        .send(
          `Успешный звонок клиенту. 
          Ссылка на запись: ${req.body.link}
          Ответ клиента: ${req.body.answer}` 
        );
        res.status('200').end();
  }
  if (req.body.status === 'recall'){ 
    client.channels.cache
        .get("870318593412309042")
        .send(
          `Клиенту не удобно говорить. Ссылка на запись: ${req.body.link}` 
        );
        res.status('200').end();
  }
  if (req.body.status === 'd_want'){ 
    client.channels.cache
        .get("870318593412309042")
        .send(
          `Клиент не хочет говорить. Ссылка на запись: ${req.body.link}` 
        );
        res.status('200').end();
  }
  if (req.body.status === 'bad_call'){ 
    client.channels.cache
        .get("870318593412309042")
        .send(
          `Клиент не хочет говорить. Ссылка на запись: ${req.body.link}` 
        );
        res.status('200').end();
  }
  if (req.body.status === 'no_problem'){ 
    client.channels.cache
        .get("870318593412309042")
        .send(
          `У клиента нет проблем. Завидую ему. Однако ссылка на запись: ${req.body.link}` 
        );
        res.status('200').end();
  }
})
//амо монитор
app.post("/amo_monitor/sensei/source_not_included", url_encode, (req, res) => {
  //console.log(req.body.leads.sensei[0])
  client.channels.cache.get("861914368669122570").send({
    embed: {
      color: 15294560,
      author: {
        name: client.user.username,
        icon_url: "https://klike.net/uploads/posts/2019-03/1551511801_1.jpg",
      },
      title: "По коням! Не проставился источник",
      url: `https://yristmsk.amocrm.ru/leads/detail/${req.body.leads.sensei[0].id}`,
      description:
        'Процесс "Источники заявок улучшеные" завершился с нулевым результатом',
      fields: [
        {
          name: "Название сделки",
          value: req.body.leads.sensei[0].name,
        },
        {
          name: "Ссылка на сделку",
          value: `https://yristmsk.amocrm.ru/leads/detail/${req.body.leads.sensei[0].id}`,
        },
      ],
    },
  });
  res.send("send to Discord channel");
  res.status(200).end();
});
app.post("/amo_monitor/sensei/city_not_included", url_encode, (req, res) => {
  if (req.body.event === 'REG'){
    client.channels.cache.get("861914368669122570").send({
      embed: {
        color: 15294560,
        author: {
          name: client.user.username,
          icon_url: "https://klike.net/uploads/posts/2019-03/1551511801_1.jpg",
        },
        title: "Внимание! Пролюбился регион в сделке",
        url: `https://yristmsk.amocrm.ru/leads/detail/${req.body.leads.sensei[0].id}`,
        description: 'По новому процессу Власа мы вылетели в ошибку, надо бы проверить',
        fields: [
          {
            name: "Название сделки",
            value: req.body.leads.sensei[0].name,
          },
          {
            name: "Ссылка на сделку",
            value: `https://yristmsk.amocrm.ru/leads/detail/${req.body.leads.sensei[0].id}`,
          },
        ],
      },
    });
    res.send("send to Discord channel");
    res.status(200).end();
  }
  else {
    client.channels.cache.get("861914368669122570").send({
      embed: {
        color: 15294560,
        author: {
          name: client.user.username,
          icon_url: "https://klike.net/uploads/posts/2019-03/1551511801_1.jpg",
        },
        title: "По коням! Не проставился город",
        url: `https://yristmsk.amocrm.ru/leads/detail/${req.body.leads.sensei[0].id}`,
        description: 'Процесс "Город интернеты" завершился с нулевым результатом',
        fields: [
          {
            name: "Название сделки",
            value: req.body.leads.sensei[0].name,
          },
          {
            name: "Ссылка на сделку",
            value: `https://yristmsk.amocrm.ru/leads/detail/${req.body.leads.sensei[0].id}`,
          },
        ],
      },
    });
    res.send("send to Discord channel");
    res.status(200).end();
  }
});
app.post('/amo_monitor/online', jsonParser, (req, res) => {
  console.log(req.body); 
  let query = `insert into online(usercount, dt) values(${req.body.usercount}, NOW())`
  connection.query(query, (err) => {
    if (!err) {
      client.channels.cache.get("861914368669122570").send('Записал данные об онлайне амо в БД.')
      res.status(200).end();
    }
    else {
      client.channels.cache.get("861914368669122570").send('Пробовал-пробовал, но так и не получилось записать данные в БД по онлайн пользователям')
      res.status(200).end();
    }
    
  })
  
}); 
let TV = 'ТВ';
let TV_counter = 0;
let internet = 'Интернет';
let internet_counter = 0;
let recomend = 'Рекомендации';
let recomend_counter = 0;
let paper = 'Газеты';
let paper_counter = 0;
let adv_in_transport = 'Реклама в транспорте';
let adv_in_transport_counter = 0;
let adv_in_stand = 'Наружка';
let adv_in_stand_counter = 0;
let pos = 'POS-материалы';
let pos_counter = 0;
let lead_generators = 'Лидогенераторы';
let lead_generators_counter = 0;
let smm = 'СММ';
let smm_counter = 0;
let context = 'Контекст';
let context_counter = 0;
let target = 'Таргет';
let target_counter = 0;
let geo_service = 'Гео Сервис';
let geo_service_counter = 0;
let avito = 'Авито';
let avito_counter = 0;
let combo = 'Сайт/Вывеск/Офис';
let combo_counter = 0;
let others = 'Прочее'
let others_counter = 0;
let error1 = 'Обращение нуль'
let error1_counter = 0;
let error2 = 'Звонок нуль'
let error2_counter = 0;

app.post('/amo_monitor/table_check', jsonParser, (req, res) => {
  if (req.body.event === TV){
    TV_counter++;
  } else if (req.body.event === internet){
    internet_counter++
  } else if (req.body.event === recomend){
    recomend_counter++
  } else if (req.body.event === paper){
    paper_counter++
  } else if (req.body.event === adv_in_transport){
    adv_in_transport_counter++
  } else if (req.body.event === adv_in_stand){
    adv_in_stand_counter++
  } else if (req.body.event === pos){
    pos_counter++
  } else if (req.body.event === lead_generators){
    lead_generators_counter++
  } else if (req.body.event === smm){
    smm_counter++
  } else if (req.body.event === context){
    context_counter++
  } else if (req.body.event === target){
    target_counter++
  } else if (req.body.event === geo_service){
    geo_service_counter++
  } else if (req.body.event === avito){
    avito_counter++
  } else if (req.body.event === combo){
    combo_counter++
  } else if (req.body.event === others){
    others_counter++
  } else if (req.body.event === error1){
    error1_counter++;
    let query = `insert into statistic(lead_id, lead_name) values('${req.body.leads.sensei[0].id}', ${req.body.leads.sensei[0].name})`
    connection.query(query, (err, data) => {
      if (err){
        client.channels.cache.get('861914368669122570').send('Попытался записать информацию по новому процессу Власа в бд, но безуспешно')
      }
    })
  } else if (req.body.event === error2){
    error2_counter++
    let query = `insert into statistic2(lead_id, lead_name) values('${req.body.lesds.sensei[0].id}', ${req.body.leads.sensei[0].name})`
    connection.query(query, (err, data => {
      if (err){
        client.channels.cache.get('861914368669122570').send('Попытался записать информацию по новому процессу Власа в бд, но безуспешно')
      }
    }))
  } else {
    client.channels.cache.get('861914368669122570').send('Там это, новый эвент пришел, но я не смог его обработать. Детали: ' + req.body.event)
  }
})
app.post('/tests', jsonParser, (req, res) => {
  console.log(req.body); 
  res.status(200).end();
})
let privateKey = fs.readFileSync( 'privatekey.pem' );
let certificate = fs.readFileSync( 'certificate.pem' );

https.createServer({
    key: privateKey,
    cert: certificate
}, app).listen(443);


client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("message", (msg) => {
  if (msg.content === "/h") {
    msg.delete().catch();
    msg.reply({
      embed: {
        color: 3447003,
        author: {
          name: client.user.username,
          icon_url: "https://klike.net/uploads/posts/2019-03/1551511801_1.jpg",
        },
        title: "Список команд для бота",
        url: ``,
        description: "Список всех доступных команд для бота и их настройки",
        fields: [
          {
            name: "Задачи",
            value: `**__/nt__** - для постановки новой задачи. Принимает в себя 4 аргумента,
        записанные через точку с запятой (;). 
        Пример: **__/nt заголовок задачи; описание задачи; срок исполнения; ответственный__** (указываются 4 цифры пользователя дискорд без решетки (#)).

        **__задачи__** - команда для просмотра всех назначенных задач.
        Выписывается без аргументов.

        **__мои задачи__** - команда для просмотра задач, закрепленных за тобой.
        Задачи проверяются по id пользователя Discord. Аргументы не принимает.

        **__выполненные задачи__** - список ранее выполненных задач. Аргументы не принимат.

        **__мои выполненные задачи__** - список выполненных задач с фильтрацией по пользователяю, 
        сделавшему запрос. Аргументы не принимает.
        `,
          },
          {
            name: "Выполнение задачи",
            value: `**__готово {id задачи}__** - переносит задачу из списка поставленных в список выполненных задач.
        В качестве аргумента принимает id задачи без фигурных скобок.
        Пример: **__готово 228__**`,
          },
          {
            name: "Фильтрация по спискам задач",
            value: `Ко всем командам, формирующим списки задач, можно применить фильтр по диапазону дат.
        Для такой фильтрации необходимо после написания команды поставить пробел и написать следующую конструкцию:
        задачи **__c 20.12.2020 по 21.12.2020__**`,
          },
          {
            name: "Доступен графческий интерфейс",
            value:
              "В падлу прописывать задачи текстом через ;? Теперь доступен [графический интерфейс](http://134.0.113.190:3030/index.html)",
          },
        ],
      },
    });
  }
  if (msg.content == "sms") {
    msg.delete().catch();
    sms.my_balance(function (e) {
      msg.reply(`Текущий баланс sms.ru: ${e.balance}`, { tts: true });
    });
  }
  if (msg.content == "лимиты sms") {
    msg.delete().catch();
    sms.my_limit((e) => {
      msg.reply(`Текущий статус лимита по SMS.ru: ${e.current}/${e.total}`);
    });
  }
  if (msg.content === "тикеты") {
    msg.delete().catch();
    // msg.reply(`Количество не закрытых тикетов - ${hde.tickets}`, {tts: true})
  }
  if (msg.content.toLocaleLowerCase() == "монетка") {
    msg.channel.send("Монета подбрасывается...");

    let random = Math.floor(Math.random() * 4) + 1; // Объявление переменной random - она вычисляет случайное число от 1 до 3

    if (random === 1) {
      // Если вычислено число 1, то выпадает орёл.
      msg.channel.send(":full_moon: Орёл!");
    } else if (random === 2) {
      // Если вычислено число 2, то выпадает решка.
      msg.channel.send(":new_moon: Решка!");
    } else if (random === 3) {
      // Если вычислено число 3, то монета падает ребром.
      msg.channel.send(":last_quarter_moon: Монета упала ребром!");
    }
  }
  if (
    msg.content.toLowerCase() === "задачи" ||
    msg.content.toLowerCase() === "что там по задачкам?"
  ) {
    msg.delete().catch();
    connection.connect(function (err) {
      if (err) {
        msg.reply("Не могу подключиться к БД");
        return console.error("Ошибка: " + err.message);
      } else {
        console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * FROM inWorkTasks`;
        connection.query(mData, (err, res) => {
          if (err) {
            return console.log("Ошибка: " + err.message);
          } else {
            if (res.length) {
              msg.reply("Задач в работе: " + res.length + " :muscle:");
              for (key in res) {
                msg.reply(
                  "id задачи: " +
                    res[key].id +
                    "\n" +
                    "Заголовок задачи: " +
                    res[key].head +
                    "\n" +
                    "Описание задачи: " +
                    res[key].description +
                    "\n" +
                    "Срок: " +
                    res[key].deadline +
                    "\n" +
                    "Ответственный: " +
                    res[key].responsible
                );
              }
            } else {
              msg.reply("у меня для тебя ничего нет :cold_sweat:");
            }
          }
        });
      }
    });
  }
  if (/^задачи с/.test(msg.content.toLowerCase())) {
    msg.delete().catch();
    let firstDate = normaldateToISO(msg.content.split("с ")[1].slice(0, 10));
    let secondDate = normaldateToISO(msg.content.split("по ")[1].slice(0, 10));
    console.log(firstDate);
    connection.connect(function (err) {
      if (err) {
        msg.reply("Не могу подключиться к БД");
        return console.error("Ошибка: " + err.message);
      } else {
        console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * FROM inWorkTasks WHERE DATE(created_at) BETWEEN STR_TO_DATE("${firstDate}", "%Y-%m-%d") and STR_TO_DATE("${secondDate}", "%Y-%m-%d")`;
        connection.query(mData, (err, res) => {
          if (err) {
            return console.log("Ошибка: " + err.message);
          } else {
            if (res.length) {
              msg.reply("Задач в работе: " + res.length + " :muscle:");
              for (key in res) {
                msg.reply(
                  "id задачи: " +
                    res[key].id +
                    "\n" +
                    "Заголовок задачи: " +
                    res[key].head +
                    "\n" +
                    "Описание задачи: " +
                    res[key].description +
                    "\n" +
                    "Срок: " +
                    res[key].deadline +
                    "\n" +
                    "Ответственный: " +
                    res[key].responsible
                );
              }
            } else {
              msg.reply("у меня для тебя ничего нет :cold_sweat:");
            }
          }
        });
      }
    });
  }
  if (msg.content.toLowerCase() == "мои задачи") {
    msg.delete().catch();
    connection.connect(function (err) {
      if (err) {
        msg.reply("Не могу подключиться к БД");
        return console.error("Ошибка: " + err.message);
      } else {
        console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * FROM inWorkTasks WHERE responsible='${username(
          msg.author.discriminator
        )}'`;
        connection.query(mData, (err, res) => {
          if (err) {
            return console.log("Ошибка: " + err.message);
          } else {
            if (res.length) {
              msg.reply("Задач в работе: " + res.length + " :muscle:");
              for (key in res) {
                msg.reply(
                  "id задачи: " +
                    res[key].id +
                    "\n" +
                    "Заголовок задачи: " +
                    res[key].head +
                    "\n" +
                    "Описание задачи: " +
                    res[key].description +
                    "\n" +
                    "Срок: " +
                    res[key].deadline +
                    "\n" +
                    "Ответственный: " +
                    res[key].responsible
                );
              }
            } else {
              msg.reply("у меня для тебя ничего нет :cold_sweat:");
            }
          }
        });
      }
    });
  }
  if (/^мои задачи с/.test(msg.content.toLowerCase())) {
    msg.delete().catch();
    let firstDate = normaldateToISO(msg.content.split("с ")[1].slice(0, 10));
    let secondDate = normaldateToISO(msg.content.split("по ")[1].slice(0, 10));
    console.log(firstDate);
    connection.connect(function (err) {
      if (err) {
        msg.reply("Не могу подключиться к БД");
        return console.error("Ошибка: " + err.message);
      } else {
        console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * 
      FROM inWorkTasks 
      WHERE DATE(created_at) 
      BETWEEN 
      STR_TO_DATE("${firstDate}", "%Y-%m-%d") 
      and
      STR_TO_DATE("${secondDate}", "%Y-%m-%d") 
      and 
      responsible='${username(msg.author.discriminator)}'`;
        connection.query(mData, (err, res) => {
          if (err) {
            return console.log("Ошибка: " + err.message);
          } else {
            if (res.length) {
              msg.reply("Задач в работе: " + res.length + " :muscle:");
              for (key in res) {
                msg.reply(
                  "id задачи: " +
                    res[key].id +
                    "\n" +
                    "Заголовок задачи: " +
                    res[key].head +
                    "\n" +
                    "Описание задачи: " +
                    res[key].description +
                    "\n" +
                    "Срок: " +
                    res[key].deadline +
                    "\n" +
                    "Ответственный: " +
                    res[key].responsible
                );
              }
            } else {
              msg.reply("у меня для тебя ничего нет :cold_sweat:");
            }
          }
        });
      }
    });
  }
  if (msg.content.toLowerCase() == "выполненные задачи") {
    msg.delete().catch();
    connection.connect(function (err) {
      if (err) {
        msg.reply("Не могу подключиться к БД");
        return console.error("Ошибка: " + err.message);
      } else {
        console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * FROM doneTasks`;
        connection.query(mData, (err, res) => {
          if (err) {
            return console.log("Ошибка: " + err.message);
          } else {
            if (res.length) {
              msg.reply("Задач выполнено: " + res.length + " :muscle:");
              for (key in res) {
                msg.reply(
                  "id задачи: " +
                    res[key].id +
                    "\n" +
                    "Заголовок задачи: " +
                    res[key].head +
                    "\n" +
                    "Описание задачи: " +
                    res[key].description +
                    "\n" +
                    "Срок: " +
                    res[key].deadline +
                    "\n" +
                    "Ответственный: " +
                    res[key].responsible +
                    "\n" +
                    "Выполнено: " +
                    res[key].done_at.toISOString().split("T")[0]
                );
              }
            } else {
              msg.reply("у меня для тебя ничего нет :cold_sweat:");
            }
          }
        });
      }
    });
  }
  if (/^выполненные задачи с/.test(msg.content.toLowerCase())) {
    msg.delete().catch();
    let firstDate = normaldateToISO(msg.content.split("с ")[1].slice(0, 10));
    let secondDate = normaldateToISO(msg.content.split("по ")[1].slice(0, 10));
    console.log(firstDate);
    connection.connect(function (err) {
      if (err) {
        msg.reply("Не могу подключиться к БД");
        return console.error("Ошибка: " + err.message);
      } else {
        console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * 
      FROM doneTasks 
      WHERE DATE(done_at) 
      BETWEEN 
      STR_TO_DATE("${firstDate}", "%Y-%m-%d") 
      and
      STR_TO_DATE("${secondDate}", "%Y-%m-%d")`;
        connection.query(mData, (err, res) => {
          if (err) {
            return console.log("Ошибка: " + err.message);
          } else {
            if (res.length) {
              msg.reply("Задач выполнено: " + res.length + " :muscle:");
              for (key in res) {
                msg.reply(
                  "id задачи: " +
                    res[key].id +
                    "\n" +
                    "Заголовок задачи: " +
                    res[key].head +
                    "\n" +
                    "Описание задачи: " +
                    res[key].description +
                    "\n" +
                    "Срок: " +
                    res[key].deadline +
                    "\n" +
                    "Ответственный: " +
                    res[key].responsible
                );
              }
            } else {
              msg.reply("у меня для тебя ничего нет :cold_sweat:");
            }
          }
        });
      }
    });
  }
  if (msg.content.toLowerCase() == "мои выполненные задачи") {
    msg.delete().catch();
    connection.connect(function (err) {
      if (err) {
        msg.reply("Не могу подключиться к БД");
        return console.error("Ошибка: " + err.message);
      } else {
        console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * FROM doneTasks WHERE responsible='${username(
          msg.author.discriminator
        )}'`;
        connection.query(mData, (err, res) => {
          if (err) {
            return console.log("Ошибка: " + err.message);
          } else {
            if (res.length) {
              msg.reply("Задач выполнено: " + res.length);
              for (key in res) {
                msg.reply(
                  "id задачи: " +
                    res[key].id +
                    "\n" +
                    "Заголовок задачи: " +
                    res[key].head +
                    "\n" +
                    "Описание задачи: " +
                    res[key].description +
                    "\n" +
                    "Срок: " +
                    res[key].deadline +
                    "\n" +
                    "Ответственный: " +
                    res[key].responsible +
                    "\n" +
                    "Выполнено: " +
                    res[key].done_at.toISOString().split("T")[0]
                );
              }
            } else {
              msg.reply("у меня для тебя ничего нет :cold_sweat:");
            }
          }
        });
      }
    });
  }
  if (/^мои выполненые задачи с/.test(msg.content.toLowerCase())) {
    msg.delete().catch();
    let firstDate = normaldateToISO(msg.content.split("с ")[1].slice(0, 10));
    let secondDate = normaldateToISO(msg.content.split("по ")[1].slice(0, 10));
    console.log(firstDate);
    connection.connect(function (err) {
      if (err) {
        msg.reply("Не могу подключиться к БД");
        return console.error("Ошибка: " + err.message);
      } else {
        console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * 
      FROM doneTasks 
      WHERE DATE(done_at)
      BETWEEN 
      STR_TO_DATE("${firstDate}", "%Y-%m-%d") 
      and
      STR_TO_DATE("${secondDate}", "%Y-%m-%d") 
      and 
      responsible='${username(msg.author.discriminator)}'`;
        connection.query(mData, (err, res) => {
          if (err) {
            return console.log("Ошибка: " + err.message);
          } else {
            if (res.length) {
              msg.reply("Задач в работе: " + res.length);
              for (key in res) {
                msg.reply(
                  "id задачи: " +
                    res[key].id +
                    "\n" +
                    "Заголовок задачи: " +
                    res[key].head +
                    "\n" +
                    "Описание задачи: " +
                    res[key].description +
                    "\n" +
                    "Срок: " +
                    res[key].deadline +
                    "\n" +
                    "Ответственный: " +
                    res[key].responsible
                );
              }
            } else {
              msg.reply("у меня для тебя ничего нет :cold_sweat:");
            }
          }
        });
      }
    });
  }
  if (/^готово/.test(msg.content.toLowerCase())) {
    let message = msg.content.slice(7);
    console.log(message);
    connection.connect(function (err) {
      if (err) {
        msg.reply("Не могу подключиться к БД");
        return console.error("Ошибка: " + err.message);
      } else {
        console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * FROM inWorkTasks WHERE id=${message}`;
        connection.query(mData, (err, res) => {
          if (err) {
            return console.log("Ошибка: " + err.message);
          } else {
            let pushToDoneTab = `insert into 
                    doneTasks(head, description, deadline, responsible, created_at, done_at)
                    values('${res[0].head}', 
                    '${res[0].description}', 
                    '${res[0].deadline}', 
                    '${res[0].responsible}', 
                    '${
                      res[0].created_at
                        .toISOString()
                        .split("T")[0]
                        .slice(0, 9) +
                      `${Number(
                        res[0].created_at
                          .toISOString()
                          .split("T")[0]
                          .slice(9, 10)
                      )}`
                    }', 
                    '${today}')`;
            connection.query(pushToDoneTab, (err) => {
              if (err) {
                return console.log(err);
              } else {
                let deleteTask = `delete from inWorkTasks where id=${message}`;
                connection.query(deleteTask, (err) => {
                  err
                    ? console.log(err)
                    : () => {
                        msg.reply("Так держать! :fire:");
                        msg.reply("Я успешно обновил данные!");
                      };
                });
              }
            });
          }
        });
      }
    });
  }
  if (/^\/nt/.test(msg.content.toLowerCase())) {
    let message = msg.content.slice(4);
    let data = message.split("; ");
    connection.connect(function (err) {
      if (err) {
        msg.reply("Не могу подключиться к БД");
        return console.error("Ошибка: " + err.message);
      } else {
        console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `INSERT INTO inWorkTasks(head, description, deadline, responsible, created_at) VALUES('${
          data[0]
        }', '${data[1]}', '${data[2]}', '${username(data[3])}', '${today}')`;
        connection.query(mData, (err, res) => {
          if (err) {
            return console.log("Ошибка: " + err.message);
          } else {
            console.log(res);
            msg.reply(`Задача ${data[0]} успешно добавлена! :clap:`);
          }
        });
      }
    });
  }
  if (msg.content === 'статистика по источникам') {
    msg.reply(`Статистика на текущий момент по процессу Власа: 
    ${TV}: ${TV_counter},
    ${internet}: ${internet_counter},
    ${recomend}: ${recomend_counter},
    ${paper}: ${paper_counter},
    ${adv_in_transport}: ${adv_in_transport_counter},
    ${adv_in_stand}: ${adv_in_stand_counter},
    ${pos}: ${pos_counter},
    ${lead_generators}: ${lead_generators_counter},
    ${smm}: ${smm_counter},
    ${context}: ${context_counter}, 
    ${target}: ${target_counter},
    ${geo_service}: ${geo_service_counter},
    ${avito}: ${avito_counter},
    ${combo}: ${combo_counter},
    ${others}: ${others_counter},
    
    Улетевшие в ошибку:
    ${error1}: ${error1_counter},
    ${error2}: ${error2_counter}.
    `)
    
    connection.query('select * from statistic', (err, data) => {
      if (!err){
        msg.reply(`Детали event - ${error1}:`)
        for (key in data){
          
          msg.reply(`Сделка ${key}. ${data[key].lead_name}. Ссылка на сделку: 
          https://yristmsk.amocrm.ru/leads/detail/${data[key].lead_id}`)
        }
        console.log(data)
      } else msg.reply('не могу показать тебе ссылки на ошибочные сделки, сорь. Ошибка - ' + err)
    })
    connection.query('select * from statistic2', (err, data) => {
      if (!err){
        msg.reply(`Детали event - ${error2}:`)
        for (key in data){
          
          msg.reply(`Сделка ${key}. ${data[key].lead_name}. Ссылка на сделку: 
          https://yristmsk.amocrm.ru/leads/detail/${data[key].lead_id}`)
        }
        console.log(data)
      } else msg.reply('не могу показать тебе ссылки на ошибочные сделки, сорь. Ошибка - ' + err)
    })
  }
});
cron.schedule("0 0 9 * * *", () => {
  client.channels.cache.get("835159002403831879").send(
    `Короче, @everyone, 
    я вас спас и в благородство играть не буду: 
    выполните для меня пару задачек – и мы в расчете. 
    Заодно посмотрим, как быстро у вас башка после очередной конфы прояснится. 
    А по вашей теме постараюсь разузнать. 
    Хрен его знает, на кой ляд вам эта заработная плата сдалась, 
    но я в чужие дела не лезу, хотите получить, значит есть зачем…`,
    {
      files: [
        "https://memepedia.ru/wp-content/uploads/2018/05/sidorovich-shablon.jpg",
      ],
    }
  );
  console.log("send");
  setTimeout(() => {
    connection.connect(function (err) {
      if (err) {
        client.channels.cache
          .get("835159002403831879")
          .send("Не могу подключиться к БД");
        return console.error("Ошибка: " + err.message);
      } else {
        console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * FROM inWorkTasks`;
        connection.query(mData, (err, res) => {
          if (err) {
            return console.log("Ошибка: " + err.message);
          } else {
            if (res.length) {
              client.channels.cache
                .get("835159002403831879")
                .send("Задач в работе: " + res.length + " :muscle:");
              for (key in res) {
                client.channels.cache
                  .get("835159002403831879")
                  .send(
                    "id задачи: " +
                      res[key].id +
                      "\n" +
                      "Заголовок задачи: " +
                      res[key].head +
                      "\n" +
                      "Описание задачи: " +
                      res[key].description +
                      "\n" +
                      "Срок: " +
                      res[key].deadline +
                      "\n" +
                      "Ответственный: " +
                      res[key].responsible
                  );
              }
            } else {
              client.channels.cache
                .get("835159002403831879")
                .send("у меня для тебя ничего нет :cold_sweat:");
            }
            sms.my_balance((e) => {
              client.channels.cache
                .get("844589763935207446")
                .send(`На sms.ru ${e.balance} руб.`);
            });
            sms.my_limit((e) => {
              client.channels.cache
                .get("844589763935207446")
                .send(`Лимиты по смс - ${e.current}/${e.total}`);
            });
          }
          client.channels.cache
            .get("844589763935207446")
            .send(`задачи теперь можно ставить в [графическом интерфейсе]()`);
        });
      }
    });
  }, 10000);
});
cron.schedule("*/30 * * * *", () => {
  sms.my_balance((e) => {
    if (Number(Math.floor(e.balance)) >= 15000) {
      client.channels.cache
        .get("844589763935207446")
        .send(`На sms.ru ${e.balance} руб. Все в порядке`);
    } else if (
      Number(Math.floor(e.balance)) <= 15000 &&
      Number(Math.floor(e.balance)) >= 5000
    ) {
      client.channels.cache
        .get("844589763935207446")
        .send(
          `На sms.ru ${e.balance} руб. Все вроде хорошо, но неплохо было бы запросить деньги`
        );
    } else if (
      Number(Math.floor(e.balance)) <= 5000 &&
      Number(Math.floor(e.balance)) >= 2000
    ) {
      client.channels.cache.get("844589763935207446").send(`@Rlathey атеншен!!1
    На sms.ru ${e.balance} руб.
    Этого уже мало!`);
    } else if (Number(Math.floor(e.balance)) <= 2000) {
      client.channels.cache.get("844589763935207446")
        .send(`@everyone сегодня погоду будет определять теплая, неустойчивая воздушная масса.
    Воздух днем прогреется до температуры горения жопы Власа во время тупняка менеджеров. Местами ожидается сильный поток тикетных осадков в районе helpdeskeddy.
    Обусловлено это тем, что на SMS.ru осталось всего ${e.balance} руб.
    На этот час у нас все с пронозом погоды, срочно пополняйте SMS.ru`);
    }
    connection.query('select * from online order by id desc limit 1', (err, resp) => {
      if (!err) {
        console.log(resp)
        client.channels.cache.get("844589763935207446").send(`на ${resp.dt} количество пользователей онлайн: ${resp.usercount}`)
      }
      else client.channels.cache.get("844589763935207446").send('я пытался прочитать данные из базы данных по онлайну, но у меня ничего не вышло.\n Прикладываю лог ошибки: \n'
       + err)
    });
    // client.channels.cache
    // .get("844589763935207446")
    // .send(`количество не закрытых тикетов - ${hde.countTickets()}`);
  });
  cron.schedule('0 0 18 * * *', () => {
    client.channels.cache.get('844589763935207446').send(`Статистика на сегодняшний день по процессу Власа: 
    ${TV}: ${TV_counter},
    ${internet}: ${internet_counter},
    ${recomend}: ${recomend_counter},
    ${paper}: ${paper_counter},
    ${adv_in_transport}: ${adv_in_transport_counter},
    ${adv_in_stand}: ${adv_in_stand_counter},
    ${pos}: ${pos_counter},
    ${lead_generators}: ${lead_generators_counter},
    ${smm}: ${smm_counter},
    ${context}: ${context_counter}, 
    ${target}: ${target_counter},
    ${geo_service}: ${geo_service_counter},
    ${avito}: ${avito_counter},
    ${combo}: ${combo_counter},
    ${others}: ${others_counter}.

    Улетевшие в ошибку:
    ${error1}: ${error1_counter},
    ${error2}: ${error2_counter}.
    
    Данные по источникам взяты с:
    https://docs.google.com/spreadsheets/d/1igqu5WiTejkb-7nueGv737F11LJU4M1wvEdDJNMvd5k/edit#gid=0`);

    setTimeout(() => {
      TV_counter = 0;
      internet_counter = 0;
      recomend_counter = 0;
      paper_counter = 0;
      adv_in_transport_counter = 0;
      adv_in_stand_counter = 0;
      pos_counter = 0;
      lead_generators_counter = 0;
      smm_counter = 0;
      context_counter = 0; 
      target_counter = 0;
      geo_service_counter = 0;
      avito_counter = 0;
      combo_counter = 0;
      others_counter = 0;
    }, 5000);
  });

});
function username(discriminator) {
  const discriminators = {
    user_1: ["4261", "Садовников Сергей"],
    user_2: ["4819", "Власов Дмитрий"],
    user_3: ["8613", "Шишкин Валерий"],
  };
  for (key in discriminators) {
    if (discriminator == discriminators[key][0]) {
      return discriminators[key][1];
    }
  }
}
function normaldateToISO(normal_date) {
  let data = normal_date.split(".");
  let iso = `${data[2]}-${data[1]}-${data[0]}`;
  return iso;
}
function sitedateToISO(site_date) {
  let data = site_date.split("/");
  let iso = `${data[2]}-${data[0]}-${data[1]}`;
  return iso;
}

client.login(cfg.TOKEN);
