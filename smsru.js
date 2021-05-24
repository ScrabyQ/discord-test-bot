let SMSru = require('sms_ru');
let config = require('./config.json');
let sms = new SMSru(config.SMSRU_TOKEN);
    sms.my_balance(function(e){
        let res;
        res = e.balance;
      })
    
    sms.my_limit(function(e){
        let res = e.current+'/'+e.total;
    })

