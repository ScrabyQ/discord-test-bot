const fetch = require('node-fetch');
const config = require('config');

const token = config.get("infobot.token");
const domain = config.get("infobot.req_domain")

module.exports = async function getBalance() { 
    let request = await fetch(req_domain + '/v1/profile/?token=' + token)
    let response = await request.json()
    console.log(response)
    return response
}