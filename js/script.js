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
    <button id="${tasks[element].id}" class="btn btn-outline-dark btn-sm delete" style="float: right; margin-bottom: 10px;">удалить</button>
    <a href="#" class="btn btn-outline-dark btn-sm" style="float: right; margin-bottom: 10px;">выполнить</a>
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

let delete_buttons = document.querySelectorAll('.delete')
console.log(typeof(delete_buttons))
console.log(delete_buttons)

delete_buttons.forEach(key => {
    console.log(key)
    delete_buttons[key].addEventListener('click', ()=>{

        let body = {
            id: delete_buttons[key].id
        }
        fetch('/delete_itw', {
            method: 'POST',
            body: JSON.stringify(body)
        })
    })
});
   