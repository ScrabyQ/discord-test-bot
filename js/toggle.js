let body = document.querySelector('.body');
if (localStorage.getItem('theme') == 'undefined'){
    localStorage.setItem('theme', 'light')
}
if (localStorage.getItem('theme') == 'dark'){
    body.setAttribute('style', 'background-image: url(img/backdark.png);');
    body.setAttribute('class', 'body dark')
    document.querySelector('#listen').setAttribute('class', 'text-light')
}
else if (localStorage.getItem('theme') == 'light') {
    body.setAttribute('style', 'background-image: url(img/back.png);');
    body.setAttribute('class', 'body light')
    document.querySelector('#listen').setAttribute('class', 'text-dark')
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