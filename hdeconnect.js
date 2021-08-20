const config = require('./config.json');
global.fetch = require('node-fetch');
const api_key = Buffer.from(config.HDE_TOKEN).toString('base64');
const domain = 'https://itgt.helpdeskeddy.com/api/v2/'
let tickets;
module.exports.tickets = tickets;


module.exports.getTickets = function getTickets() {
    let req_body = `${domain}tickets/?status_list=open`;
        fetch(req_body, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + api_key
        }
    }).then(response => response.json)
    .then( result => {
        console.log("c модуля количество тикетов " + result.pagination.total)
        return  result
    })
}
