
var mongoose = require('mongoose');

module.exports = new mongoose.Schema({

    username:String,
    password:String,
    isAdmin:{                  //是否为管理员，不需要cookie
        type:Boolean,
        default:false
    },
    active:{
        type:Boolean,
        default:true
    }



})
