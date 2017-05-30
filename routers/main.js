var express = require('express');
var router = express.Router();
var Category = require('../models/Categories');

router.get('/',function(req,res,next){

    //数据库中读取分类模型
    Category.find().then(function (categories) {

        // console.log(categories);
        res.render('main/index',{
            userInfo:req.userInfo,
            categories:categories
        });
    })


})

module.exports = router;