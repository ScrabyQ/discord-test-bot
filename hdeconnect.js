const config = require('./config.json');
global.fetch = require('node-fetch');
const api_key = Buffer.from(config.HDE_TOKEN).toString('base64');
console.log(api_key)
const domain = 'https://itgt.helpdeskeddy.com/api/v2/'
let responseData;

async function getTickets() {
    let req_body = `${domain}tickets/?status_list=open`;
    let response = await fetch(req_body, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + api_key
        }
    })
    if (response.ok){
        let res = await response.json();
        module.exports.open_ticketes_count = res.pagination.total;
        console.log(res)

        
    }
    else {
        console.log('ошибка: ' + response.statusText)
    }
}
getTickets();