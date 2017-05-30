
var mogooes = require('mongoose');

module.exports = new mogooes.Schema({


    //关联字段，设为引用---分类ID
    category:{
        //类型
        type:mogooes.Schema.Types.ObjectId,
        //引用
        ref:'Content'
    },

    //通知标题
    title:String,

    //通知标题
    description:{
        type:String,
        default:""
    },

    content:{
        type:String,
        default:""
    }
    

})
