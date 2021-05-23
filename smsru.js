let SMSru = require('sms_ru');
let config = require('./config.json');
let sms = new SMSru(config.SMSRU_TOKEN);
module.exports.getInfo = function (bal, lim) {
    sms.my_balance(function(e){
        let res;
        res = e.balance;
        module.exports.balance = res;
        bal = res; 
      })
    
    sms.my_limit(function(e){
        let res = e.current+'/'+e.total;
        module.exports.limit = res;
        lim = res;
        console.log(lim)
    })
}

