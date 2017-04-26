
var mogooes = require('mongoose');

var categoriesSchema = require('../schemas/categories');

module.exports = mogooes.model('Categories',categoriesSchema);   //在数据库中创建 Users