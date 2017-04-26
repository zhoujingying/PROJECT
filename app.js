'use strict'
var express = require('express');
var swig = require('swig');

//1.加载数据库及其他必要模块,并进行配置
var mogooes = require('mongoose');
var bodyParser = require('body-parser');     //用来处理浏览器发送的数据
var cookies = require('cookies');
var User = require('./models/Users');

var app = express();
//配置body-parser
app.use(bodyParser.urlencoded({extended:true}));       //req.body就可以获取到数据

//配置cookie
app.use(function(req,res,next){
    req.cookies = new cookies(req,res);
    req.userInfo = {};        //给req增加一个自定义属性
    
    //解析登录信息
    if(req.cookies.get('userInfo')){     //用户信息，从cookie中获取
        try {
            req.userInfo = JSON.parse(req.cookies.get('userInfo'));

            //获取当前登录用户类型,从数据库获取
            User.findById(req.userInfo._id).then(function(userInfo){
                req.userInfo.isAdmin = Boolean(userInfo.isAdmin);
                next();
            })

        } catch (error) { next();}
    }else{
         next();
    }
   
})


//2.配置应用模板
app.engine('html',swig.renderFile);
app.set('views','./views');
app.set('view engine','html');
swig.setDefaults({cache:false});   //取消缓存


//3.静态文件托管
app.use('/public',express.static(__dirname+'/public'));

// app.get('/',function(req,res,next){
//     res.render('index');   //后可跟数据参数
    
// })

//4.根据不同功能划分模块
app.use('/admin',require('./routers/admin'));
app.use('/api',require('./routers/api'));
app.use('/',require('./routers/main'));





//5.连接数据库并开启应用
mogooes.connect('mongodb://localhost:27017/blog',function(err){
    if (err) {
        console.log('connext err');
    }else{
        console.log('successful');
        app.listen(8081);
    }
});     // 连接前需开启数据库服务

