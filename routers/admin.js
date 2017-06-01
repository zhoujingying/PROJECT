var express = require('express');
var router = express.Router();

var User = require('../models/Users');
var Category = require('../models/Categories');
var Contents = require('../models/Contents');

/**
 * 权限判断
 */
router.use(function(req,res,next){
    if(!req.userInfo.isAdmin){
        res.send('管理员身份验证失败');
        return;
    }else{
        next();
    }
})

/**
 * 首页
 */
router.get('/',function(req,res,next){
    res.render('admin/index',{
        userInfo:req.userInfo
    });
})

/**
 * 用户管理
 */

router.get('/user',function(req,res){

    // 从数据库中读取所以用户数据
    //limit(Number):限制数据库显示条数
    //skip(Num):忽略数据的条数
    //count():数据总条数

    /**
     * 每页显示10条
     * 1：skip(0)
     * 2:skip(10)
     * 
     * (当前页-1)*limit
     * 
     */

    var page = Number(req.query.page || 1);      //http  ?page=1   query多余字符
    var limit = 2;
    var page_max = 0;
    var page_count = 0;


    User.count().then(function(count){

        page_count = count;
        
        //计算总页数

        page_max = Math.ceil(count/limit);

        //取值>page_max 则 page=page_max
        page = Math.min(page,page_max);    

        //取值<1 则 page=1
        page = Math.max(page,1);

        var skip = (page-1)*limit;
        
        User.find().limit(limit).skip(skip).then(function(users){
        res.render('admin/user_index',{
        userInfo:req.userInfo,
        api:'user',
        users:users,
        page:page,
        page_max:page_max,
        page_count:page_count,
        page_limit:limit
            })
        })

    })
    

    
})



/**
 * 查看分类 get提交
 */
router.get('/category',function(req,res){
    
    var page = Number(req.query.page || 1);      //http  ?page=1   query多余字符
    var limit = 2;
    var page_max = 0;
    var page_count = 0;


    Category.count().then(function(count){

        page_count = count;
        
        //计算总页数

        page_max = Math.ceil(count/limit);

        //取值>page_max 则 page=page_max
        page = Math.min(page,page_max);    

        //取值<1 则 page=1
        page = Math.max(page,1);

        var skip = (page-1)*limit;

        /*
        * 1: 升序
        * -1： 降序
        *
        * */


        Category.find().sort({_id:-1}).limit(limit).skip(skip).then(function(categories){
        res.render('admin/category_index',{
        userInfo:req.userInfo,
        categories:categories,
        api:'category',
        page:page,
        page_max:page_max,
        page_count:page_count,
        page_limit:limit
            })
        })

    })
    
})


/**
 * 添加分类
 */

//get接口返回页面
router.get('/category/add',function(req,res){
   
   res.render('admin/category_add',{
        userInfo:req.userInfo
    })

})

//post接口处理数据
router.post('/category/add',function(req,res){
   
   var name = req.body.name || "";
   if(name == ''){
       res.render('admin/shown_message',{
           userInfo:req.userInfo,
           message:'新增类别不能为空',
       });
       return;
   }

   //查询数据库

   Category.findOne({
       name:name
   }).then(function(rs){
       if(rs){
            res.render('admin/shown_message',{
            userInfo:req.userInfo,
            message:'新增类别名字已经存在',
        });
        return Promise.reject();
       }else{
           
           return new Category({
               name:name
           }).save();
       }
   }).then(function(newCategory){
                res.render('admin/shown_message',{
                userInfo:req.userInfo,
                message:'新增类别添加成功',
                url:'/admin/category'
                });
           });
})


/**
 * 分类修改与删除
 */

//修改
router.get('/category/edit',function(req,res){

    var id = req.query.id || "";
    Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/shown_message',{
                userInfo:req.userInfo,
                message:"分类信息不存在"
            });
        }else{
            res.render('admin/category_edit',{
                userInfo:req.userInfo,
                category:category
            });
        }
    })
})

//修改
router.post('/category/edit',function(req,res){
    
    var id = req.query.id || "";
    var name = req.body.name || "";       //post提交过来的

     Category.findOne({
        _id:id
    }).then(function(category){
        if(!category){
            res.render('admin/shown_message',{
                userInfo:req.userInfo,
                message:"分类信息不存在"
            });
            return Promise.reject();
        }else{
            //用户没有做任何修改时
            if(name == category.name){
                res.render('admin/shown_message',{
                    userInfo:req.userInfo,
                    message:"修改成功",
                    url:'/admin/category'
            });
            return Promise.reject();
            }else{
                //判断重名+保存
               return Category.findOne({
                    _id:{$ne:id},      //id不一样
                    name:name
                });
            }
        }
    }).then(function(sameCategory){
        if(sameCategory){
            res.render('admin/shown_message',{
                    userInfo:req.userInfo,
                    message:"数据库中已存在同名类型"
            });
             return Promise.reject();
        }else{
            return Category.update({
                _id:id
            },{
                name:name
            });
        }
    }).then(function(){
        res.render('admin/shown_message',{
                    userInfo:req.userInfo,
                    message:"修改成功",
                    url:'/admin/category'
            });
    })

})


//删除
router.get('/category/delete',function(req,res){
    var id = req.query.id || "";

    Category.remove({
        _id:id
    }).then(function(){
        res.render('admin/shown_message',{
                userInfo:req.userInfo,
                message:"删除成功",
                url:"/admin/category"
            });
    })
})

/**
 *
 *  博客内容显示
 */

router.get('/content',function (req,res) {

    var page = Number(req.query.page || 1);      //http  ?page=1   query多余字符
    var limit = 2;
    var page_max = 0;
    var page_count = 0;


    Contents.count().then(function(count){

        page_count = count;

        //计算总页数

        page_max = Math.ceil(count/limit);

        //取值>page_max 则 page=page_max
        page = Math.min(page,page_max);

        //取值<1 则 page=1
        page = Math.max(page,1);

        var skip = (page-1)*limit;

        /*
         * 1: 升序
         * -1： 降序
         * */
        Contents.find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).then(function(contents){
            //populate对应contents schemas中的category健
            console.log(contents);
            res.render('admin/content_index',{
                userInfo:req.userInfo,
                contents:contents,
                api:'content',
                page:page,
                page_max:page_max,
                page_count:page_count,
                page_limit:limit
            })
        })

    })

})

/**
 *
 *  发布通知页面显示
 */

router.get('/content/add',function (req,res) {

    Category.find().then(function (categories) {
        res.render('admin/content_add',{
            userInfo:req.userInfo,
            categories:categories
        })
    })


})

/**
 *
 *  发布通知保存
 */

router.post('/content/add',function (req,res) {

    if(req.body.title === "" ||req.body.content === ""){
        res.render('admin/shown_message',{
            userInfo:req.userInfo,
            message:"通知标题和内容不能为空"
        })
        return;
    }

    new Contents({
        category:req.body.category,
        title:req.body.title,
        user: req.userInfo._id.toString(),
        description:req.body.description,
        // content:req.body.content.replace(reg1,"&nbsp").replace(/\r\n/g,"<br/>")
        content:req.body.content
    }).save().then(function (rs) {
        res.render('admin/shown_message',{
            userInfo:req.userInfo,
            message:"内容保存成功",
            url:'/admin/content'
        })
    })
})


/**
 *
 *  发布通知修改get
 */
router.get('/content/edit',function (req,res) {
    var id = req.query.id || "";

    var categories = [];

    Category.find().sort({_id:-1}).then(function(rs){

        categories = rs;

        return Contents.findOne({
            _id: id
        }).populate('category');
    }).then(function(contents){
        if(!contents){
            res.render('admin/shown_message',{
                userInfo:req.userInfo,
                message:"分类信息不存在"
            });
            return Promise.reject();
        }else{
            res.render('admin/content_edit',{
                userInfo:req.userInfo,
                contents:contents,
                categories:categories
            });
        }
    })


})



/**
 *
 *  发布通知修改post
 */
router.post('/content/edit',function (req,res) {
    var id = req.query.id || "";

    if(req.body.title === "" ||req.body.content === ""){
        res.render('admin/shown_message',{
            userInfo:req.userInfo,
            message:"通知标题和内容不能为空"
        })
        return;
    }

    Contents.update({
            _id: id
        }
    ,{
        category: req.body.category,
        title: req.body.title,
        description: req.body.description,
        content: req.body.content
        }).then(function () {
        res.render('admin/shown_message', {
            userInfo: req.userInfo,
            message: '内容保存成功',
            url: '/admin/content'
        })
    })
})


/**
 *
 *  发布博客删除post
 */
router.get('/content/delete',function (req,res) {
    var id = req.query.id || "";

    Contents.remove({
        _id:id
    }).then(function(){
        res.render('admin/shown_message',{
            userInfo:req.userInfo,
            message:"删除成功",
            url:"/admin/content"
        });
    })
})


/**
 *
 *  禁言用户
 */
router.get('/user/unactive',function (req,res){
    var id = req.query.id || "";

    User.update({
            _id: id
        }
        ,{
          active:false
        }).then(function () {
        res.render('admin/shown_message', {
            userInfo: req.userInfo,
            message: '成功将用户 '+req.userInfo.username+' 禁言，该账号将不能再发布博客和留言！',
            url: '/admin/user'
        })
    })
})


/**
 *
 *  解禁用户
 */
router.get('/user/active',function (req,res){
    var id = req.query.id || "";

    User.update({
            _id: id
        }
        ,{
            active:true
        }).then(function () {
        res.render('admin/shown_message', {
            userInfo: req.userInfo,
            message: '成功将用户 '+req.userInfo.username+' 解禁，该账号将恢复所有用户功能！',
            url: '/admin/user'
        })
    })
})

/**
 * 1.return 数据操作
 * 2.return Promise.reject();
 */


module.exports = router;