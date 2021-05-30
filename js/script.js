'use strict';
let tasks;
let api = fetch('/get_tasks').then((response) => {
    return response.json()
}).then((data) => {
    tasks = data;
}).then(() => {
    for (let element in tasks){
        console.log(element)
        let div = document.createElement('div');
        div.className = 'col-sm-6';
        div.innerHTML = `
    <div class="card-header">
    ${tasks[element].id}
    <a href="#" class="btn btn-dark btn-sm" style="float: right; margin-bottom: 10px;">Редактировать</a>
    </div>
    <div class="card-body">
    <h5 class="card-title">${tasks[element].head}</h5>
    <p class="card-text">${tasks[element].description}</p>
    </div>
    `
        document.getElementById('row').append(div)
    };
}); 


document.getElementById('listen').addEventListener('click', () => {
    let div = document.createElement('div');
div.className = 'col-sm-6';
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
