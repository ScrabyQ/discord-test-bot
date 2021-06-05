let body = document.querySelector('.body');


if (!localStorage.getItem('expand')){
    localStorage.setItem('expand', 'true')
} 
if (localStorage.getItem('expand') == 'false'){
    console.log(localStorage.getItem('expand'))
    let toggle = document.querySelector('.toggle');
    let nav = document.querySelector('.nav');
    let cont = document.querySelector('.ncontainer');
    cont.setAttribute('class', 'ncontainer active') 
    toggle.setAttribute('class', 'toggle active') 
    nav.setAttribute('class', 'nav active') 
} else if (localStorage.getItem('menu-expand') == 'true') {
    let toggle = document.querySelector('.toggle');
    let nav = document.querySelector('.nav');
    let cont = document.querySelector('.ncontainer');
    cont.setAttribute('class', 'ncontainer') 
    toggle.setAttribute('class', 'toggle') 
    nav.setAttribute('class', 'nav') 
}
if (localStorage.getItem('theme') == 'undefined'){
    localStorage.setItem('theme', 'light')
}
if (localStorage.getItem('theme') == 'dark'){
    body.setAttribute('style', 'background-image: url(img/backdark.png);');
    body.setAttribute('class', 'body dark')
    document.querySelector('#listen').setAttribute('class', 'text-light')

    // modal works
    try {
        document.querySelector('.modal-content').setAttribute('class', 'modal-content bg-dark text-light')
        document.querySelector('input[name="head"]').setAttribute('class', 'form-control bg-dark text-light')
        document.querySelector('textarea[name="description"]').setAttribute('class', 'form-control bg-dark text-light')
        document.querySelector('input[name="deadline"]').setAttribute('class', 'form-control bg-dark text-light')
        document.querySelector('input[name="responsible"]').setAttribute('class', 'form-control bg-dark text-light')
    } catch(e){
        console.log(e)
    }
}
else if (localStorage.getItem('theme') == 'light') {
    body.setAttribute('style', 'background-image: url(img/back.png);');
    body.setAttribute('class', 'body light')
    document.querySelector('#listen').setAttribute('class', 'text-dark')

     // modal works
     try {
        document.querySelector('.modal-content').setAttribute('class', 'modal-content bg-light text-dark')
        document.querySelector('input[name="head"]').setAttribute('class', 'form-control bg-light text-dark')
        document.querySelector('textarea[name="description"]').setAttribute('class', 'form-control bg-light text-dark')
        document.querySelector('input[name="deadline"]').setAttribute('class', 'form-control bg-light text-dark')
        document.querySelector('input[name="responsible"]').setAttribute('class', 'form-control bg-light text-dark')
    } catch(e){
        console.log(e)
    }
}
document.querySelector('.toggle-theme').addEventListener('click', () => {


if (body.getAttribute('class') ==  'body light'){
    localStorage.setItem('theme', 'dark');
    body.setAttribute('style', 'background-image: url(img/backdark.png);');
    body.setAttribute('class', 'body dark')
    document.querySelector('#listen').setAttribute('class', 'text-light')
    window.location.reload();
}
else if (body.getAttribute('class') ==  'body dark'){
    localStorage.setItem('theme', 'light');
    body.setAttribute('style', 'background-image: url(img/back.png);');
    body.setAttribute('class', 'body light');
    document.querySelector('#listen').setAttribute('class', 'text-dark');
    window.location.reload();
}
})

document.querySelector('.toggle').addEventListener('click', () => {
    if (localStorage.getItem('expand') == 'false'){
        localStorage.setItem('expand', 'true')
        let toggle = document.querySelector('.toggle');
        let nav = document.querySelector('.nav');
        let cont = document.querySelector('.ncontainer');
        cont.setAttribute('class', 'ncontainer') 
        toggle.setAttribute('class', 'toggle') 
        nav.setAttribute('class', 'nav') 
    }
    else if (localStorage.getItem('expand') == 'true') {
        localStorage.setItem('expand', 'false')
        let toggle = document.querySelector('.toggle');
        let nav = document.querySelector('.nav');
        let cont = document.querySelector('.ncontainer');
        cont.setAttribute('class', 'ncontainer active') 
        toggle.setAttribute('class', 'toggle active') 
        nav.setAttribute('class', 'nav active') 
    }
})