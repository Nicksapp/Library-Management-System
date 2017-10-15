var BorrowBooks = require('../lib/mongo').BorrowBook;

module.exports = {
    create: function(borrowbook) {
        return BorrowBooks.create(borrowbook).exec();
    },
    getBorrowBooks: function(userId) {
        return BorrowBooks
                    .find({ userId: userId })
                    .populate({ path: 'admin', model: 'User' })
                    .sort({ _id: 1 })
                    .addCreatedAt()
                    .exec();
    },
    getBorrowBooksCount: function(userId) {
        return BorrowBooks
                    .count({ userId: userId })
                    .exec();
    },
    returnBookById: function (id) {
        return BorrowBooks.remove({ _id: id }).exec();
    },
}