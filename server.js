const Discord = require("discord.js");
const client = new Discord.Client();
const express = require('express')
const app = require('express')();
const path = require('path');
const bp = require('body-parser');
const fs = require('fs');
const cfg = require("./config.json");
const mysql = require("mysql2");
var cron = require("node-cron");
let SMSru = require('sms_ru');
let hde = require('./hdeconnect.js')
let config = require('./config.json');
let sms = new SMSru(config.SMSRU_TOKEN);
    

let jsonParser = bp.json();
let url_encode = bp.urlencoded({extended: true});

let today = new Date().toISOString().split("T")[0];

let date1, date2;
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "discordTasks",
  password: "password",
});

app.use(bp.json())
app.use(url_encode)
//#region подгрузка страниц и компонентов
app.get('/index.html', express.static(path.join(__dirname, '/js')), (req, res) => {
  res.sendFile('index.html', { root: __dirname });
})
app.get('/', express.static(path.join(__dirname, '/js')), (req, res) => {
  res.sendFile('index.html', { root: __dirname });
})
app.get('/donetasks/done.html', express.static(path.join(__dirname, '/js')), (req, res) => {
  res.sendFile('donetasks/done.html', { root: __dirname });
})
 app.get('/js/script.js', (req, res) => {
   res.sendFile('js/script.js', { root: __dirname });
 })
 app.get('/js/done.js', (req, res) => {
  res.sendFile('js/done.js', { root: __dirname });
})
//#endregion
app.get('/get_tasks', (req, res) => {
  connection.query('SELECT * FROM inWorkTasks', (err, data) => {
    res.json(data);
  })
})
app.get('/get_done_tasks', (req, res) => {
  connection.query('SELECT * FROM doneTasks', (err, data) => {
    res.json(data);
  })
})
app.get('/iwt_filter', (err, data) => {
  let queryDate = `SELECT * 
  FROM inWorkTasks 
  WHERE DATE(created_at) 
  BETWEEN 
  STR_TO_DATE("${date1}", "%Y-%m-%d") 
  and
  STR_TO_DATE("${date2}", "%Y-%m-%d")`;
  connection.query(queryDate, (err, data) => {
    res.json(data);
  })
})
app.post('/iwt_filter', url_encode, (req, res) => {
  date1 = req.body.date1;
  date2 = req.body.date2;
  res.sendFile('iwt/data.html', {root: __dirname})
  res.status(200);
})
app.post('/delete_task', jsonParser, (req, res)=> {
  if (req.body.type === 'itw'){
    let queryData = `delete from inWorkTasks where id="${req.body.id}"`
    connection.query(queryData, (err, data) => {
    err ? console.log(err) : console.log('data has been deleted');
  })
  } else if (req.body.type === 'dt'){
    let queryData = `delete from doneTasks where id="${req.body.id}"`
    connection.query(queryData, (err, data) => {
    err ? console.log(err) : console.log('data has been deleted');
  })
  }
})
app.post('/create_task', url_encode, (req, res) => {
console.log(req.body.datepicker)
res.status(200).end();
})
app.get('/create_task', (req, res) => {
  res.sendFile('index.html', { root: __dirname })
})
app.post('/dishook/slacontrole', jsonParser, (req, res) => {
  
  client.channels.cache.get('844987698594054165').send({embed: {
    color: 15294560, 
    author: {
      name: client.user.username,
      icon_url: 'https://klike.net/uploads/posts/2019-03/1551511801_1.jpg'
    },
    title: "Не забыли про заявку?",
    url: `https://itgt.helpdeskeddy.com/ru/ticket/list/filter/id/1/ticket/${req.body.id}/#/`, 
    description: 'Время последней активности превысило полчаса!', 
    fields: [{
      name: "Тема тикета",
      value: req.body.name
    }, 
    {
      name: "Оставил заявку",
      value: req.body.author
    },
    {
      name: "Время последнего ответа",
      value: req.body.message
    }
    ]
  }})

  res.send('send to Discord channel')
  res.status(200).end();
});
app.post('/dishook/mess', jsonParser, (req, res) => {
  client.channels.cache.get('844987698594054165').send({embed: {
    color: 15105570, 
    author: {
      name: client.user.username,
      icon_url: 'https://klike.net/uploads/posts/2019-03/1551511801_1.jpg'
    },
    title: "Новый ответ в тикете!",
    url: `https://itgt.helpdeskeddy.com/ru/ticket/list/filter/id/1/ticket/${req.body.id}/#/`, 
    description: 'Информация по новому ответу в тикете', 
    fields: [{
      name: "Тема тикета",
      value: req.body.name
    }, 
    {
      name: "Оставил заявку",
      value: req.body.author
    },
    {
      name: "Новое сообщение",
      value: req.body.message
    }
    ]
  }})
  res.send('send to Discord channel')
  res.status(200).end();
});
app.post('/dishook', jsonParser, (req, res) => {

  client.channels.cache.get('844987698594054165').send({embed: {
    color: 3447003, 
    author: {
      name: client.user.username,
      icon_url: 'https://klike.net/uploads/posts/2019-03/1551511801_1.jpg'
    },
    title: "Новый заявка в HDE!",
    url: `https://itgt.helpdeskeddy.com/ru/ticket/list/filter/id/1/ticket/${req.body.id}/#/`, 
    description: 'Информация по новому тикету', 
    fields: [{
      name: "Тема тикета",
      value: req.body.name
    }, 
    {
      name: "Оставил заявку",
      value: req.body.author
    },
    {
      name: "Комментарий",
      value: req.body.message
    }
    ]
  }})
  res.send('send to Discord channel')
  res.status(200).end();
});
app.listen('3030', () => {
  console.log("3030")
});


client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("message", (msg) => {
  if (msg.content === '/h'){
    msg.delete().catch();
    msg.reply({embed: {
      color: 3447003, 
      author: {
        name: client.user.username,
        icon_url: 'https://klike.net/uploads/posts/2019-03/1551511801_1.jpg'
      },
      title: "Список команд для бота",
      url: ``, 
      description: 'Список всех доступных команд для бота и их настройки', 
      fields: [{
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
        `
      }, 
      {
        name: "Выполнение задачи",
        value: `**__готово {id задачи}__** - переносит задачу из списка поставленных в список выполненных задач.
        В качестве аргумента принимает id задачи без фигурных скобок.
        Пример: **__готово 228__**`
      },
      {
        name: "Фильтрация по спискам задач",
        value: `Ко всем командам, формирующим списки задач, можно применить фильтр по диапазону дат.
        Для такой фильтрации необходимо после написания команды поставить пробел и написать следующую конструкцию:
        задачи **__c 20.12.2020 по 21.12.2020__**`
      }
      ]
    }})
  }
  if (msg.content == "sms"){
    msg.delete().catch();
    sms.my_balance( function(e){
      msg.reply(`Текущий баланс sms.ru: ${e.balance}`, {tts: true});
   }) 
   
  }
  if (msg.content == "лимиты sms"){
    msg.delete().catch();
    sms.my_limit((e) => {
      msg.reply(`Текущий статус лимита по SMS.ru: ${e.current}/${e.total}`);
    })
  }
  if (msg.content === "тикеты"){
    msg.delete().catch();
    msg.reply(`Количество не закрытых тикетов - ${hde.open_ticketes_count}`, {tts: true})
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
                      `${
                        Number(
                          res[0].created_at
                            .toISOString()
                            .split("T")[0]
                            .slice(9, 10)
                        ) + 1
                      }`
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
            })
            sms.my_limit((e) => {
            client.channels.cache
            .get("844589763935207446")
            .send(`Лимиты по смс - ${e.current}/${e.total}`);
            })
            
          }
        });
      }
    });
  }, 10000);
});
cron.schedule( '*/30 * * * *', ()=> {

  sms.my_balance((e) => {
    if (Number(Math.floor(e.balance)) >= 15000){
      client.channels.cache
    .get("844589763935207446")
    .send(`На sms.ru ${e.balance} руб. Все в порядке`);
    }
    else if(Number(Math.floor(e.balance)) <= 15000 && Number(Math.floor(e.balance)) >= 5000) {
      client.channels.cache
    .get("844589763935207446")
    .send(`На sms.ru ${e.balance} руб. Все вроде хорошо, но неплохо было бы запросить деньги`);
    } else if(Number(Math.floor(e.balance)) <= 5000 && Number(Math.floor(e.balance)) >= 2000) {
      client.channels.cache
    .get("844589763935207446")
    .send(`@Rlathey, атеншен!!1
    На sms.ru ${e.balance} руб.
    Этого уже мало!`);
    }
    client.channels.cache
    .get("844589763935207446")
    .send(`количество не закрытых тикетов - ${hde.open_ticketes_count}`);
    
  })
  
})
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
 
 
client.login(cfg.TOKEN);
