const Discord = require('discord.js');
const client = new Discord.Client();
const cfg = require('./config.json');
const mysql = require("mysql2");
let today = new Date().toISOString().split('T')[0];
  
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  database: "discordTasks",
  password: "password"
});

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
    console.log(msg.author.username);
  }
  if (msg.content.toLocaleLowerCase() == 'монетка'){
    msg.channel.send('Монета подбрасывается...')

    let random = Math.floor(Math.random() * 4) + 1; // Объявление переменной random - она вычисляет случайное число от 1 до 3
    
    if (random === 1) { // Если вычислено число 1, то выпадает орёл.
        msg.channel.send(':full_moon: Орёл!')
    } else if (random === 2) { // Если вычислено число 2, то выпадает решка.
        msg.channel.send(':new_moon: Решка!')
    } else if (random === 3) { // Если вычислено число 3, то монета падает ребром.
        msg.channel.send(':last_quarter_moon: Монета упала ребром!')
    }
  }
  if (msg.content.toLowerCase() === 'задачи' || msg.content.toLowerCase() === 'что там по задачкам?'){
    connection.connect(function(err){
            if (err) { 
            msg.reply('Не могу подключиться к БД');
            return console.error("Ошибка: " + err.message);
            }
            else{
                console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * FROM inWorkTasks`;
                connection.query(mData, (err, res) => {
                if (err){
                    return console.log('Ошибка: ' + err.message);
                } else {
                    if (res.length){
                        msg.reply('Задач в работе: ' + res.length + ' :muscle:')
                         for (key in res){
                             msg.reply('id задачи: '+res[key].id +'\n' +
                             'Заголовок задачи: ' +res[key].head +'\n'+
                             'Описание задачи: ' +res[key].description+ '\n' +
                             'Срок: ' +res[key].deadline+ '\n'+
                             'Ответственный: ' +res[key].responsible);
                         }
                    } else { 
                        msg.reply("у меня для тебя ничего нет :cold_sweat:")
                    }
                }
                })
            }
         });
  } 
  if (/^задачи с/.test(msg.content.toLowerCase())){
      let firstDate =normaldateToISO(msg.content.split('с ')[1].slice(0, 10));
      let secondDate = normaldateToISO(msg.content.split('по ')[1].slice(0, 10));
      console.log(firstDate)
    connection.connect(function(err){
            if (err) { 
            msg.reply('Не могу подключиться к БД');
            return console.error("Ошибка: " + err.message);
            }
            else{
                console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * 
        FROM inWorktasks 
        WHERE DATE(created_at) 
        BETWEEN 
        STR_TO_DATE("${firstDate}", "%Y-%m-%d") 
        and
        STR_TO_DATE("${secondDate}", "%Y-%m-%d")`;
                connection.query(mData, (err, res) => {
                if (err){
                    return console.log('Ошибка: ' + err.message);
                } else {
                    if (res.length){
                        msg.reply('Задач в работе: ' + res.length)
                         for (key in res){
                             msg.reply('id задачи: '+res[key].id +'\n' +
                             'Заголовок задачи: ' +res[key].head +'\n'+
                             'Описание задачи: ' +res[key].description+ '\n' +
                             'Срок: ' +res[key].deadline+ '\n'+
                             'Ответственный: ' +res[key].responsible);
                         }
                    } else { 
                        msg.reply("у меня для тебя ничего нет :cold_sweat:")
                    }
                }
                })
            }
         });
  }
  if (msg.content.toLowerCase() == 'мои задачи'){
    connection.connect(function(err){
            if (err) { 
            msg.reply('Не могу подключиться к БД');
            return console.error("Ошибка: " + err.message);
            }
            else{
                console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * FROM inWorkTasks WHERE responsible='${username(msg.author.discriminator)}'`;
                connection.query(mData, (err, res) => {
                if (err){
                    return console.log('Ошибка: ' + err.message);
                } else {
                    if (res.length){
                        msg.reply('Задач в работе: ' + res.length)
                         for (key in res){
                             msg.reply('id задачи: '+res[key].id +'\n' +
                             'Заголовок задачи: ' +res[key].head +'\n'+
                             'Описание задачи: ' +res[key].description+ '\n' +
                             'Срок: ' +res[key].deadline+ '\n'+
                             'Ответственный: ' +res[key].responsible);
                         }
                    } else { 
                        msg.reply("у меня для тебя ничего нет :cold_sweat:")
                    }
                }
                })
            }
         });
  } 
  if (/^мои задачи с/.test(msg.content.toLowerCase())){
    let firstDate =normaldateToISO(msg.content.split('с ')[1].slice(0, 10));
    let secondDate = normaldateToISO(msg.content.split('по ')[1].slice(0, 10));
    console.log(firstDate)
  connection.connect(function(err){
          if (err) { 
          msg.reply('Не могу подключиться к БД');
          return console.error("Ошибка: " + err.message);
          }
          else{
              console.log("Подключение к серверу MySQL успешно установлено");
      let mData = `SELECT * 
      FROM inWorktasks 
      WHERE DATE(created_at) 
      BETWEEN 
      STR_TO_DATE("${firstDate}", "%Y-%m-%d") 
      and
      STR_TO_DATE("${secondDate}", "%Y-%m-%d") 
      and 
      responsible='${username(msg.author.discriminator)}'`;
              connection.query(mData, (err, res) => {
              if (err){
                  return console.log('Ошибка: ' + err.message);
              } else {
                  if (res.length){
                      msg.reply('Задач в работе: ' + res.length)
                       for (key in res){
                           msg.reply('id задачи: '+res[key].id +'\n' +
                           'Заголовок задачи: ' +res[key].head +'\n'+
                           'Описание задачи: ' +res[key].description+ '\n' +
                           'Срок: ' +res[key].deadline+ '\n'+
                           'Ответственный: ' +res[key].responsible);
                       }
                  } else { 
                      msg.reply("у меня для тебя ничего нет :cold_sweat:")
                  }
              }
              })
          }
       });
}
  if (msg.content.toLowerCase() == 'выполненные задачи'){
    connection.connect(function(err){
            if (err) { 
            msg.reply('Не могу подключиться к БД');
            return console.error("Ошибка: " + err.message);
            }
            else{
                console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * FROM doneTasks`;
                connection.query(mData, (err, res) => {
                if (err){
                    return console.log('Ошибка: ' + err.message);
                } else {
                    if (res.length){
                        msg.reply('Задач выполнено: ' + res.length)
                         for (key in res){
                             msg.reply('id задачи: '+res[key].id +'\n' +
                             'Заголовок задачи: ' +res[key].head +'\n'+
                             'Описание задачи: ' +res[key].description+ '\n' +
                             'Срок: ' +res[key].deadline+ '\n'+
                             'Ответственный: ' +res[key].responsible + '\n' +
                             'Выполнено: ' + res[key].done_at.toISOString().split("T")[0]);
                         }
                    } else { 
                        msg.reply("у меня для тебя ничего нет :cold_sweat:")
                    }
                }
                })
            }
         });
  }
  if (/^выполненные задачи с/.test(msg.content.toLowerCase())){
    let firstDate =normaldateToISO(msg.content.split('с ')[1].slice(0, 10));
    let secondDate = normaldateToISO(msg.content.split('по ')[1].slice(0, 10));
    console.log(firstDate)
  connection.connect(function(err){
          if (err) { 
          msg.reply('Не могу подключиться к БД');
          return console.error("Ошибка: " + err.message);
          }
          else{
              console.log("Подключение к серверу MySQL успешно установлено");
      let mData = `SELECT * 
      FROM doneTasks 
      WHERE DATE(done_at) 
      BETWEEN 
      STR_TO_DATE("${firstDate}", "%Y-%m-%d") 
      and
      STR_TO_DATE("${secondDate}", "%Y-%m-%d")`;
              connection.query(mData, (err, res) => {
              if (err){
                  return console.log('Ошибка: ' + err.message);
              } else {
                  if (res.length){
                      msg.reply('Задач выполнено: ' + res.length)
                       for (key in res){
                           msg.reply('id задачи: '+res[key].id +'\n' +
                           'Заголовок задачи: ' +res[key].head +'\n'+
                           'Описание задачи: ' +res[key].description+ '\n' +
                           'Срок: ' +res[key].deadline+ '\n'+
                           'Ответственный: ' +res[key].responsible);
                       }
                  } else { 
                      msg.reply("у меня для тебя ничего нет :cold_sweat:")
                  }
              }
              })
          }
       });
}
  if (msg.content.toLowerCase() == 'мои выполненные задачи'){
    connection.connect(function(err){
            if (err) { 
            msg.reply('Не могу подключиться к БД');
            return console.error("Ошибка: " + err.message);
            }
            else{
                console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * FROM doneTasks WHERE responsible='${username(msg.author.discriminator)}'`;
                connection.query(mData, (err, res) => {
                if (err){
                    return console.log('Ошибка: ' + err.message);
                } else {
                    if (res.length){
                        msg.reply('Задач выполнено: ' + res.length)
                         for (key in res){
                             msg.reply('id задачи: '+res[key].id +'\n' +
                             'Заголовок задачи: ' +res[key].head +'\n'+
                             'Описание задачи: ' +res[key].description+ '\n' +
                             'Срок: ' +res[key].deadline+ '\n'+
                             'Ответственный: ' +res[key].responsible + '\n' +
                             'Выполнено: ' + res[key].done_at.toISOString().split("T")[0]);
                         }
                    } else { 
                        msg.reply("у меня для тебя ничего нет :cold_sweat:")
                    }
                }
                })
            }
         });
  }
  if (/^мои выполненые задачи с/.test(msg.content.toLowerCase())){
    let firstDate =normaldateToISO(msg.content.split('с ')[1].slice(0, 10));
    let secondDate = normaldateToISO(msg.content.split('по ')[1].slice(0, 10));
    console.log(firstDate)
  connection.connect(function(err){
          if (err) { 
          msg.reply('Не могу подключиться к БД');
          return console.error("Ошибка: " + err.message);
          }
          else{
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
              if (err){
                  return console.log('Ошибка: ' + err.message);
              } else {
                  if (res.length){
                      msg.reply('Задач в работе: ' + res.length)
                       for (key in res){
                           msg.reply('id задачи: '+res[key].id +'\n' +
                           'Заголовок задачи: ' +res[key].head +'\n'+
                           'Описание задачи: ' +res[key].description+ '\n' +
                           'Срок: ' +res[key].deadline+ '\n'+
                           'Ответственный: ' +res[key].responsible);
                       }
                  } else { 
                      msg.reply("у меня для тебя ничего нет :cold_sweat:")
                  }
              }
              })
          }
       });
}
  if (/^готово/.test(msg.content.toLowerCase())){
      let message = msg.content.slice(7);
      console.log(message);
      connection.connect(function(err){
            if (err) { 
            msg.reply('Не могу подключиться к БД');
            return console.error("Ошибка: " + err.message);
            } else {
                console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `SELECT * FROM inWorkTasks WHERE id=${message}`;
                connection.query(mData, (err, res) => {
                if (err){
                    return console.log('Ошибка: ' + err.message);
                } else {
                    
                    
                    let pushToDoneTab = `insert into 
                    doneTasks(head, description, deadline, responsible, created_at, done_at)
                    values('${res[0].head}', 
                    '${res[0].description}', 
                    '${res[0].deadline}', 
                    '${res[0].responsible}', 
                    '${res[0].created_at.toISOString().split("T")[0].slice(0, 9) 
                    + `${Number(res[0].created_at.toISOString().split("T")[0].slice(9, 10)) + 1}`}', 
                    '${today}')`
                    connection.query(pushToDoneTab, (err) => {
                        if (err){
                            return console.log(err);
                        } else {
                            let deleteTask =`delete from inWorkTasks where id=${message}`;
                            connection.query(deleteTask, (err) => {
                                err ? console.log(err) : () => {
                                    msg.reply("Так держать! :fire:");
                                    msg.reply("Я успешно обновил данные!");
                                }
                            })
                        }
                    })
                }
                })
            }
         });
  }
  if (/^\/nt/.test(msg.content.toLowerCase())){
    let message = msg.content.slice(4);
    let data = message.split('; ');
    connection.connect(function(err){
            if (err) { 
            msg.reply('Не могу подключиться к БД');
            return console.error("Ошибка: " + err.message);
            }
            else{
                console.log("Подключение к серверу MySQL успешно установлено");
        let mData = `INSERT INTO inWorkTasks(head, description, deadline, responsible, created_at) VALUES('${data[0]}', '${data[1]}', '${data[2]}', '${username(data[3])}', '${today}')`;
                connection.query(mData, (err, res) => {
                if (err){
                    return console.log('Ошибка: ' + err.message);
                } else {
                     console.log(res);
                     msg.reply(`Задача ${data[0]} успешно добавлена!`)
                }
                })
            }
         });
  }
});

function username (discriminator) {
    const discriminators = {
        user_1: ['4261', 'Садовников Сергей'],
        user_2: ['4819', 'Власов Дмитрий'],
        user_3: ['8613', 'Шишкин Валерий'] 
    }
    for (key in discriminators){
        if (discriminator == discriminators[key][0]){
            return discriminators[key][1];
        }
    }
}
function normaldateToISO (normal_date) {
    let data = normal_date.split('.');
    let iso = `${data[2]}-${data[1]}-${data[0]}`
    return iso;
}
client.login(cfg.TOKEN);
