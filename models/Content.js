
var mogooes = require('mongoose');

var contentSchema = require('../schemas/contents');

module.exports = mogooes.model('Content',contentSchema);   //在数据库中创建 Content