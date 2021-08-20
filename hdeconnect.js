const config = require('./config.json');
const fetch = require('node-fetch');
const api_key = Buffer.from(config.HDE_TOKEN).toString('base64');
const domain = 'https://itgt.helpdeskeddy.com/api/v2/'

async function tickets() {
    let url = `${domain}tickets/?status_list=open`;
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': 'Basic ' + api_key
        }
    })
    let json = await response.json();
    return json
}
 module.exports = tickets;
