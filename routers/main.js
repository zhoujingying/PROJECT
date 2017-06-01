var express = require('express');
var router = express.Router();
var Category = require('../models/Categories');
var Contents = require('../models/Contents');
var Users = require('../models/Users');
var Comments = require('../models/Comments');

var data;
/*
 * 处理通用的数据
 * */
router.use(function (req, res, next) {

    data = {
        userInfo:req.userInfo,
        categories:[]
    }
    Category.find().then(function(categories) {
        data.categories = categories;
        next();
    });

})

router.get('/',function(req,res,next){

    data.category = req.query.category || '';
    data.page = Number(req.query.page || 1);
    data.limit = 2;
    data.page_max = 0;
    data.page_count = 0;

    var where = {};
    if(data.category){
        where.category = data.category;
    }

    //数据库中读取分类模型
    Category.find().then(function (categories) {

        data.categories = categories;

        return Contents.where(where).count();

    }).then(function (count) {

        data.page_count = count;
        //计算总页数
        data.page_max = Math.ceil(data.page_count/data.limit);

        //取值>page_max 则 page=page_max
        data.page = Math.min(data.page,data.page_max);

        //取值<1 则 page=1
        data.page = Math.max(data.page,1);

        var skip = (data.page-1)*data.limit;


        return  Contents.where(where).find().sort({_id:-1}).limit(data.limit).skip(skip).populate(['category','user']).sort({
            addTime:-1
        })
;
    }).then(function (contents) {
        data.contents = contents;
        // console.log(data);
        res.render('main/index',data);
    })


})

router.get('/view', function (req, res){

    var contentId = req.query.contentid || '';

    Contents.findOne({
        _id: contentId
    }).then(function (content) {

        data.content = content;


        //增加阅读数并保存数据库
        content.views++;
        content.save();

        res.render('main/view', data);
    });

});




router.get('/user',function(req,res,next){
       // console.log(categories);
        res.render('main/user_index',{
            userInfo:req.userInfo
        });

})


/*
* 获取用户已发表博客， 通过  .where(条件) 方法在contents中查找本用户发表的博客
* */

router.get('/user/content',function (req,res) {

    var page = Number(req.query.page || 1);      //http  ?page=1   query多余字符
    var limit = 2;
    var page_max = 0;
    var page_count = 0;

    var where = {};
    where.user = data.userInfo;

    Contents.where(where).count().then(function(count){

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
        // console.log(data);
        Contents.where(where).find().sort({_id:-1}).limit(limit).skip(skip).populate(['category','user']).then(function(contents){
            //populate对应contents schemas中的category健
            // console.log(contents);
            res.render('main/content_index',{
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

/*
* 用户添加博客get
* */
router.get('/user/content/add',function (req,res) {

    // console.log(req.userInfo);
    if(!req.userInfo.active){
        // console.log(1);
        res.render('main/shown_message',{
            userInfo:req.userInfo,
            message:"您的账号已被锁，无法发表博客和评论，请等候管理员处理！"
        })
        return;
    }
        Category.find().then(function (categories) {
            res.render('main/content_add',{
                userInfo:req.userInfo,
                categories:categories
            })
        })





})

/*
* 用户添加博客post
* */
router.post('/user/content/add',function (req,res) {

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
        content:req.body.content
    }).save().then(function (rs) {
        res.render('admin/shown_message',{
            userInfo:req.userInfo,
            message:"内容保存成功",
            url:'/user/content'
        })
    })
})


/*
*
*  获取用户评论
* */
router.get('/user/comment',function (req,res) {

    var page = Number(req.query.page || 1);      //http  ?page=1   query多余字符
    var limit = 2;
    var page_max = 0;
    var page_count = 0;

    var where = {};
    where.user = data.userInfo;

    Comments.where(where).count().then(function(count){

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
        // console.log(data);
        Comments.where(where).find().sort({_id:-1}).limit(limit).skip(skip).populate(['user','forContent']).then(function(comments){
            //populate对应contents schemas中的category健
            // console.log(contents);
            res.render('main/comment_index',{
                userInfo:req.userInfo,
                comments:comments,
                api:'comment',
                page:page,
                page_max:page_max,
                page_count:page_count,
                page_limit:limit
            })
        })

    })

})


// router.get('/',function(req,res,next){
//     res.render('admin/user_index',{
//         userInfo:req.userInfo
//     });
// })

module.exports = router;