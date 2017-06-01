
var mongoose = require('mongoose');

module.exports = new mongoose.Schema({

    user:{
        //类型
        type:mongoose.Schema.Types.ObjectId,
        //引用
        ref:'Users'
    },
    forContent: {
            //类型
            type:mongoose.Schema.Types.ObjectId,
            //引用
            ref:'Contents'
    },
    postTime:{
        type: Date,
        default: new Date()
    },
    comment: {
        type: String,
        default: ""
    },
    isReported:{
        type:Boolean,
        default:false
    },
    reportCount: {
        type: Number,
        default: 0
    }




})
