
var mongoose = require('mongoose');

var usersSchema = require('../schemas/users');

module.exports = mongoose.model('Users',usersSchema);   //在数据库中创建 Users