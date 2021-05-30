'use strict';
let tasks;
let api = fetch('/get_tasks').then((response) => {
    return response.json()
}).then((data) => {
    tasks = data;
}); 
for (element in tasks){
    let div = document.createElement('div');
    div.className = 'col-sm-6';
    div.innerHTML = `
<div class="card-header">
статус задачи
</div>
<div class="card-body">
<h5 class="card-title">${tasks[element].id}</h5>
<p class="card-text">Описание задачи</p>
<a href="#" class="btn btn-primary">Редактировать</a>
</div>
`
    document.getElementById('row').append(div)
};

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
