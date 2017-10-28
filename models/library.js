var Library = require('../lib/mongo').Library;

module.exports = {
    // add 一本书
    create: function create(book) {
        return Library.create(book).exec();
    },
    // 通过book id 获取book
    getBookById: function (bookId) {
        return Library
            .findOne({ _id: bookId })
            .populate({ path: 'admin', model: 'User' })
            .addCreatedAt()
            .exec();
    },
     // 按创建时间降序获取所有 book 或者某个特定admin的所有book
    getBooks: function(admin) {
        var query = {};
        if (admin) {
            query.admin = admin;
        }
        return Library
            .find(query)
            .populate({ path: 'admin', model: 'User' })
            .sort({ _id: -1 })
            .addCreatedAt()
            .exec();
    },
    searchBook: function(data) { //string
        var queryData = new RegExp(data.trim());
        return Library
            .find({
                '$or': [{
                    name: queryData
                }, {
                    author: queryData
                }, {
                    press: queryData
                }]
            })
            .sort({ _id: -1 })
            .exec();
    },
    // 通过book id 获取book（编辑book）
    getRawBookById: function (bookId) {
        return Library
            .findOne({ _id: bookId })
            .populate({ path: 'admin', model: 'User' })
            .exec();
    },
    // 通过用户 id 和book id 更新book
    updateBookById: function (bookId, admin, data) {
        return Library.update({ admin: admin, _id: bookId }, { $set: data }).exec();
    },
    // 通过用户 id 和book id 删除book
    delBookById: function (bookId, admin) {
        return Library.remove({ admin: admin, _id: bookId }).exec();
    },
    // 通过book id 给 pv 加 1
    incPv: function incPv(bookId) {
        return Library
            .update({ _id: bookId }, { $inc: { pv: 1 } })
            .exec();
    }
};