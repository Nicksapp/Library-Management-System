// 创建数据库连接 - create connection to database
var config = require('config-lite')(__dirname);
var Mongolass = require('mongolass'); // mongodb 驱动
var moment = require('moment');
var objectIdToTimestamp = require('objectid-to-timestamp');

var mongolass = new Mongolass();

mongolass.connect(config.mongodb);

// 根据 id 生成创建时间 created_at
mongolass.plugin('addCreatedAt', {
    afterFind: function (results) {
        results.forEach(function (item) {
            item.created_at = moment(objectIdToTimestamp(item._id)).format('YYYY-MM-DD HH:mm');
        });
        return results;
    },
    afterFindOne: function (result) {
        if (result) {
            result.created_at = moment(objectIdToTimestamp(result._id)).format('YYYY-MM-DD HH:mm');
        }
        return result;
    }
});

exports.User = mongolass.model('User', {
    id: { type: 'string'},
    name: { type: 'string' },
    password: { type: 'string' },
    avatar: { type: 'string' },
    gender: { type: 'string', enum: ['m', 'f', 'x'] },
    bio: { type: 'string' },
    isAdmin: { type: 'boolean'} // 管理员设置
});
exports.User.index({ id: 1 }, { unique: true }).exec();// 根据用户名找到用户，用户名全局唯一

exports.Library = mongolass.model('Library', {
    admin: {
        type: Mongolass.Types.ObjectId
    },
    name: { // 书名
        type: 'string'
    },
    author: { // 作者
        type: 'string'
    },
    press: { // 出版社
        type: 'string'
    },
    inventory: { // 库存
        type: 'number'
    },
    date: { // 出版日期
        type: 'string'
    },
    score: {  // 评分
        type: 'number', 
    },
    cover: { // 封面
        type: 'string'
    },
    introduction: { // 简介
        type: 'string'
    },
    pv: {
        type: 'number'
    }
});
exports.Library.index({
    admin: 1,
    _id: -1
}).exec(); // 按创建时间降序查看book