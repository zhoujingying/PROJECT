
var mongoose = require('mongoose');

var categoriesSchema = require('../schemas/categories');

module.exports = mongoose.model('Categories',categoriesSchema);   //在数据库中创建 Users