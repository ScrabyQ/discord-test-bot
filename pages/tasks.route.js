const {Router, static} = require('express'); 
const path = require('path')

const tasks = Router(); 

tasks.get(
  "tasks.html",
  static(path.join(__dirname, "/js")),
  (req, res) => {
    res.sendFile("tasks.html", { root: __dirname });
  }
);