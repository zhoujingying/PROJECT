
var mongoose= require('mongoose');

module.exports = new mongoose.Schema({


    //关联字段，设为引用---分类ID
    category:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用
        ref:'Categories'
    },

    //关联字段，设为引用---user
    user:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用
        ref:'Users'
    },

    //通知标题
    title:String,

    //通知标题
    description:{
        type:String,
        default:""
    },
    //添加时间
    addTime: {
        type: Date,
        default: new Date()
    },

    //阅读量
    views: {
        type: Number,
        default: 0
    },
    content:{
        type:String,
        default:""
    },

    //评论
    comments: {
        type: Array,
        default: []
    }
    

})

