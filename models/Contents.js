
var mongoose = require('mongoose');

var contentsSchema = require('../schemas/contents');

module.exports = mongoose.model('Contents',contentsSchema);   //在数据库中创建 Content