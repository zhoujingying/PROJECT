
var mogooes = require('mongoose');

module.exports = new mogooes.Schema({

    username:String,
    password:String,
    isAdmin:{                  //是否为管理员，不需要cookie
        type:Boolean,
        default:false
    }

})
