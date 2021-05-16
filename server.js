const Discord = require('discord.js');
const client = new Discord.Client();
const fs = require('fs');
const http = require('http');
const port = 3000 || process.env.PORT;
try {
    let t = require('./tasks.json')

http.createServer().listen(port)
client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  console.log(t + typeof(t));
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }
  if (msg.content === 'задачи'){
    console.log(t.tasks.length + '');
    if (t.tasks.length){
        msg.reply('Задач в работе: ' + t.tasks.length)
        for (key in t.tasks){
            msg.reply('id задачи: '+t.tasks[key].id +'\n' +
            'Заголовок задачи: ' +t.tasks[key].param.name +'\n'+
            'Описание задачи: ' +t.tasks[key].param.description+ '\n' +
            'Срок: ' +t.tasks[key].param.deadline+ '\n'+
            'Ответственный: ' +t.tasks[key].param.resp);
        }
    } else msg.reply("У меня для тебя ничего нет")
    
  } 
  if (/^готово/.test(msg.content)){
      let message = msg.content.slice(7);
      console.log(message)
      let tasks = t; 
      let promise = new Promise((resolve, reject) => {
        tasks.tasks.forEach(element => {
            if(element.id == message){
                let element_pos = tasks.tasks.indexOf(element)
                tasks.tasks.splice(element_pos, 1)
            }
        });
        console.log(tasks);
        resolve(tasks)
      }).then((tasks) =>{
          console.log(tasks)
          fs.writeFile('tasks.json', JSON.stringify(tasks), (err, data) => {
              err ? console.log(err) : msg.reply("готово")
          })
      })
      
  }
  if (/^\/nt/.test(msg.content)){
    let message = msg.content.slice(4);
    let data = message.split('; ')
    let readData = JSON.stringify(t);
    let writebleData = {
            id: Math.floor(Math.random() * 10000), 
            param: {
                name: data[0],
                description: data[1],
                deadline: data[2],
                resp: data[3]
            }
    }

    console.log(readData.slice(0, -2))
    if (t.status){
        fs.writeFile('tasks.json', '', (err, data) => {
            err ? console.log(err) : msg.reply("Записываю");
        })
        fs.writeFile('tasks.json', `{"tasks":[${JSON.stringify(writebleData)}]}`, (err, data) => {
            err ? console.log(err) : msg.reply("Задача поставлена");
        })
    }
    else {
        fs.writeFile('tasks.json', '', (err, data) => {
            err ? console.log(err) : msg.reply("Записываю");
        })
        fs.writeFile('tasks.json', `${readData.slice(0, -2)},${JSON.stringify(writebleData)}]}`, (err, data) => {
            err ? console.log(err) : msg.reply("Задача поставлена");
        })
    }
    
  }
});

client.login('ODQzMjY0MzEzODQyMDczNjcx.YKBVFw.EA3S0XLLah7Qedc7MISjH7AZixs');
}catch(e){
    let promise = new Promise((resolve, reject) => {
        fs.writeFile('tasks.json', `{"status": "empety"}`, (err, data) => {
    err ? console.log(err) : console.log("пустой файл");
    })}).then(() => {
        let t = require('./tasks.json')
    })

}
