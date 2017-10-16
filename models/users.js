var User = require('../lib/mongo').User;

module.exports = {
    // 注册一个用户
    create: function (user) {
        return User.create(user).exec();
    },
    // 通过学号获取用户信息
    getUserById: function (id) {
        return User
                .findOne({ id: id })
                .addCreatedAt()
                .exec();
    },
    getUserByDefaultId: function(id) {
        return User
                .findOne({ _id: id})
                .addCreatedAt()
                .exec();
    }
};