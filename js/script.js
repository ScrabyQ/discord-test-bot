'use strict';
let tasks;
let api = fetch('/get_tasks').then((response) => {
    return response.json()
}).then((data) => {
    tasks = data;
}).then(() => {
   let body = document.querySelector('.body');
   if (localStorage.getItem('theme') === 'light'){
       setTheme('dark', tasks);
   } else if (localStorage.getItem('theme') === 'dark'){
        setTheme('light', tasks);
   }
   else {
    for (let element in tasks){
        console.log(element)
        let div = document.createElement('div');
        div.className = 'col-sm-5 bg-light text-dark';
        div.setAttribute('style', 'box-shadow: 0 0 10px rgba(0,0,0,0.5); margin-right: 10px;margin-left: 10px; margin-top: 10px; margin-bottom: 10px');
        div.innerHTML = `
    <div class="card-header">
    id задачи: ${tasks[element].id}
    <button id="${tasks[element].id}" class="btn btn-outline-danger btn-sm delete" style="float: right; margin-bottom: 10px;">X</button>
    <a href="#" class="btn btn-outline-primary btn-sm" style="float: right; margin-bottom: 10px;">выполнить</a>
    </div>
    <div class="card-body">
    <h5 class="card-title">${tasks[element].head}</h5>
    <p class="card-text">${tasks[element].description}</p>
    <p class="card-text">${tasks[element].deadline}</p>
    <p class="card-text">${tasks[element].responsible}</p>
    <p class="card-text">поставлена: ${tasks[element].created_at.split('T')[0]}</p>

    </div>
    `
        document.getElementById('row').append(div)
    };
   }
}).then(() => {
    let delete_buttons = document.querySelectorAll('.delete')
    delete_buttons.forEach(key => {
    console.log(key.id)
    key.addEventListener('click', ()=>{
        let data = {
            id: key.id,
            type: 'itw'
        }
        fetch('/delete_task', {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })
        window.location.reload();
    })
});
let execute = document.querySelectorAll(".execute");

execute.forEach(key => {
    key.addEventListener('click', () => {
        let data = {
            id: key.id,
            type: 'itw'
        }
        fetch('/complete_task', {
            method: "POST",
            body: JSON.stringify(data),
            headers: {
                "Content-Type": "application/json"
            }
        })
        window.location.reload();   
    })
})
}); 


document.getElementById('listen').addEventListener('click', () => {
    let div = document.createElement('div');
div.className = 'col-sm-5 bg-light text-dark';
div.setAttribute('style', 'box-shadow: 0 0 10px rgba(0,0,0,0.5); margin-right: 10px; margin-left: 10px; margin-top: 10px; margin-bottom: 10px');
div.innerHTML = `
<div class="card-header">
статус задачи
</div>
<div class="card-body">
<h5 class="card-title">Заголовок задачи</h5>
<p class="card-text">Описание задачи</p>
<a href="#" class="btn btn-primary">Редактировать</a>
</div>
`
    document.getElementById('row').append(div)
})


   function setTheme(theme, tasks){
       if (theme == 'dark'){
        for (let element in tasks){
            console.log(element)
            let div = document.createElement('div');
            div.className = 'col-sm-5 bg-light text-dark';
            div.setAttribute('style', 'box-shadow: 0 0 10px rgba(0,0,0,0.5); margin-right: 10px; margin-left: 10px; margin-top: 10px; margin-bottom: 10px');
            div.innerHTML = `
        <div class="card-header">
        id задачи: ${tasks[element].id}
        <button id="${tasks[element].id}" class="btn btn-outline-danger btn-sm delete" style="float: right; margin-bottom: 10px;">X</button>
        <a href="#" id="${tasks[element].id}" class="btn btn-outline-primary btn-sm execute" style="float: right; margin-bottom: 10px; margin-right: 10px">выполнить</a>
        </div>
        <div class="card-body">
        <h5 class="card-title">${tasks[element].head}</h5>
        <p class="card-text">${tasks[element].description}</p>
        <p class="card-text">${tasks[element].deadline}</p>
        <p class="card-text">${tasks[element].responsible}</p>
        <p class="card-text">поставлена: ${tasks[element].created_at.split('T')[0]}</p>
    
        </div>
        `
            document.getElementById('row').append(div)
        };
       } else {
        for (let element in tasks){
            console.log(element)
            let div = document.createElement('div');
            div.className = 'col-sm-5 bg-dark text-light';
            div.setAttribute('style', 'box-shadow: 0 0 10px rgba(0,0,0,0.5); margin-right: 10px; margin-left: 10px; margin-top: 10px; margin-bottom: 10px');
            div.innerHTML = `
        <div class="card-header">
        id задачи: ${tasks[element].id}
        <button id="${tasks[element].id}" class="btn btn-outline-danger btn-sm delete" style="float: right; margin-bottom: 10px;">X</button>
        <a href="#" id="${tasks[element].id}" class="btn btn-outline-primary btn-sm execute" style="float: right; margin-bottom: 10px; margin-right: 10px">выполнить</a>
        </div>
        <div class="card-body">
        <h5 class="card-title">${tasks[element].head}</h5>
        <p class="card-text">${tasks[element].description}</p>
        <p class="card-text">${tasks[element].deadline}</p>
        <p class="card-text">${tasks[element].responsible}</p>
        <p class="card-text">поставлена: ${tasks[element].created_at.split('T')[0]}</p>
    
        </div>
        `
            document.getElementById('row').append(div)
        };
       }
   }