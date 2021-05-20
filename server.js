const Discord = require("discord.js");
const client = new Discord.Client();
const express = require('express')();
const bp = require('body-parser');
const cfg = require("./config.json");
const mysql = require("mysql2");
const sms = require('./smsru.js');
var cron = require("node-cron");

express.use(bp.json())
express.get('/', (req, res) => {
  console.log(req);
  res.send('working')
});
express.get('/dishook', (req, res) => {
  console.log('req ' + req.json());
  console.log('req body: ' + req.body.json());
  res.send('working')
  res.status(200).end();
});
express.listen('3030', () => {
  console.log("3030")
});


let today = new Date().toISOString().split("T")[0];
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "discordTasks",
  password: "password",
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});
client.on("message", (msg) => {
  console.log(msg.content)
  
  if (msg.content === "ping") {
    msg.reply("pong");
    console.log(msg.author.username);
  }
  if (msg.content == "sms"){
    msg.reply(`Текущий баланс sms.ru: ${sms.balance}`);
  }
  if (msg.content == "лимиты sms"){
    msg.reply(`Текущий статус лимита по SMS.ru: ${sms.limit}`);
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
  //   cron.schedule('1 * * * * *', () => {
  //     client.channels.cache.get('829032315937095693').send('Hello here!')
  //     console.log('send')
  //   });
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
            client.channels.cache
            .get("844589763935207446")
            .send(`На sms.ru ${sms.balance} руб.`);
            client.channels.cache
            .get("844589763935207446")
            .send(`Лимиты по смс - ${sms.limit}`);
          }
        });
      }
    });
  }, 10000);
});
cron.schedule( '*/30 * * * *', ()=> {
  if (Number(Math.floor(sms.balance)) >= 15000){
    client.channels.cache
  .get("844589763935207446")
  .send(`На sms.ru ${sms.balance} руб. Все в порядке`);
  }
  else if(Number(Math.floor(sms.balance)) <= 15000 && Number(Math.floor(sms.balance)) >= 10000) {
    client.channels.cache
  .get("844589763935207446")
  .send(`На sms.ru ${sms.balance} руб. Все вроде хорошо, но неплохо было бы запросить деньги`);
  } else if(Number(Math.floor(sms.balance)) <= 5000 && Number(Math.floor(sms.balance)) >= 2000) {
    client.channels.cache
  .get("844589763935207446")
  .send(`@Rlathey, атеншен!!1
  На sms.ru ${sms.balance} руб.
  Этого уже мало!`);
  }
  client.channels.cache
  .get("844589763935207446")
  .send(`Дневные лимиты: ${sms.limit}`);
  
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
