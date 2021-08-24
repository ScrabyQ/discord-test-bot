const amoCRM = require("amocrm-js");
const fs = require('fs');
const currentToken = require('../token.json')
const config = require('../config.json');

const client_id = Buffer.from(config.client_id).toString('base64');
const client_secret = Buffer.from(config.client_secret).toString('base64');
const code = Buffer.from(config.code).toString('base64');
const domain = Buffer.from(config.domain).toString('base64');
const redirect_uri = Buffer.from(config.redirect_uri).toString('base64');

const crm = new amoCRM({
    domain,
    auth: {
        client_id,
        client_secret,
        redirect_uri,
        code
    }
});
crm.connect()
 
try {
    crm.connection.setToken(currentToken, 0)
} catch (e) {
    console.log("Ошибка при обработке token.json: " + e)
}
 
 
crm.on('connection:beforeConnect', () => console.log('Ошибка connection:beforeConnect'));
crm.on('connection:beforeFetchToken', () => console.log('Ошибка connection:beforeFetchToken'));
crm.on('connection:beforeRefreshToken', () => {    console.log('Ошибка connection:beforeRefreshToken');});
crm.on('connection:checkToken', () => console.log('Ошибка connection:checkToken'));
crm.on('connection:authError', (err) => {
    console.log('Ошибка connection:authError', err);
    crm.connection.refreshToken()
        .then((data) => {
            console.log('refreshToken')
            fs.writeFileSync('./token.json', JSON.stringify(data.data))
        })
        .catch((err) => {
            console.log('refresh err: ', err)
        });
});
crm.on('connection:connected', () => {    console.log('connected');});
crm.on('connection:error', () => console.log('Ошибка connection:error'));
crm.on('connection:newToken', (token) => {
    console.log('newToken')
    fs.writeFileSync('./token.json', JSON.stringify(token.data))
})

module.exports.getLead = async function (lead_id, msg) {
    console.log('log')
    let data = await crm.request.get(`/api/v4/leads/${lead_id}/notes`)
    console.log(data)
}


