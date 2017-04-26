
var mogooes = require('mongoose');

var usersSchema = require('../schemas/users');

module.exports = mogooes.model('Users',usersSchema);   //在数据库中创建 Users