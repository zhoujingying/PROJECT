var express = require('express');
var router = express.Router();

var User = require('../models/Users');
var Category = require('../models/Categories');

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
        
        Category.find().limit(limit).skip(skip).then(function(categories){
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
       res.render('admin/category_message',{
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
            res.render('admin/category_message',{
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
                res.render('admin/category_message',{
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
            res.render('admin/category_message',{
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
            res.render('admin/category_message',{
                userInfo:req.userInfo,
                message:"分类信息不存在"
            });
            return Promise.reject();
        }else{
            //用户没有做任何修改时
            if(name == category.name){
                res.render('admin/category_message',{
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
            res.render('admin/category_message',{
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
        res.render('admin/category_message',{
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
        res.render('admin/category_message',{
                userInfo:req.userInfo,
                message:"删除成功",
                url:"/admin/category"
            });
    })
})
module.exports = router;




/**
 * 1.return 数据操作
 * 2.return Promise.reject();
 */