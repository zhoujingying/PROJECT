var express = require('express');
var router = express.Router();
var userModel = require('../models/Users')

/**
 * 统一返回格式(包括错误码配置)
 */

var responseData;

router.use(function(req,res,next){
    responseData = {
        code:0,
        message:''
    }
    next();
})

/**
 * 注册逻辑
 *   1.非空校验
 *   2.密码一致
 * 
 * 数据库查询：
 *   1.是否已被注册
 */


router.post('/user/regist',function(req,res){
    var username = req.body.username;
    var password = req.body.password;
    var repassword = req.body.repassword;
    
    if(username == ''){
        responseData.code = 1;
        responseData.message = '用户名不能为空';
        res.json(responseData);
        return;
    }
    if(password == ''&&repassword == ''){
        responseData.code = 2;
        responseData.message = '密码不能为空';
        res.json(responseData);
        return;
    }
    if(password != repassword){
        responseData.code = 3;
        responseData.message = '两次输入的密码不一致';
        res.json(responseData);
        return;
    }

    userModel.findOne({
        username:username         //查找
    }).then(function(userInfo){
        if( userInfo){
            responseData.code = 4;
            responseData.message = '用户名已被注册';
            res.json(responseData);
            return;
        }else{
            var user = new userModel({
                username:username,
                password:password
            });
            return user.save();
        }
    }).then(function(userInfo){
        responseData.message = '注册成功！';
        responseData.userInfo = {
                _id:userInfo._id,
                username:userInfo.username
            
            }
            req.cookies.set('userInfo',JSON.stringify({       //为客户端设置cookies信息
                _id:userInfo._id,
                username:userInfo.username 
            }));
        res.json(responseData);
    })
})

/**
 * 登陆逻辑
 */
router.post('/user/login',function(req,res){
    var username = req.body.username;
    var password = req.body.password;

    if(username == "" || password == ""){
        responseData.code = 1;
        responseData.message = "用户名或密码不能为空";
        res.json(responseData);
    }

    userModel.findOne({
        username:username,
        password:password
    }).then(function(userInfo){
        if(!userInfo){
            responseData.code = 2;
            responseData.message = '用户名或密码错误';
            res.json(responseData);
        }else{
            responseData.message = '登陆成功！';
            responseData.userInfo = {
                _id:userInfo._id,
                username:userInfo.username
            
            }
            req.cookies.set('userInfo',JSON.stringify({       //为客户端设置cookies信息
                _id:userInfo._id,
                username:userInfo.username 
            }));
            
            res.json(responseData);
        }

        
    })



    console.log('收到数据')

})


/**
 * 退出
 */
router.get('/user/logout',function(req,res){
    req.cookies.set('userInfo',null);        //将cookie设置为空
    res.json(responseData);
})

module.exports = router;