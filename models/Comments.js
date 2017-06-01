
var mongoose = require('mongoose');

var commentsSchema = require('../schemas/comments');

module.exports = mongoose.model('Comments',commentsSchema);   //在数据库中创建 Content