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
    getBorrowBooksCount: function(bookId) {
        return BorrowBooks
                    .count({ bookId: bookId })
                    .exec();
    },
    returnBookById: function (id) {
        return BorrowBooks.remove({ _id: id }).exec();
    },
    getBorrowUsers: function(bookId) {
        return BorrowBooks
                    .find({ bookId: bookId})
                    .sort({ _id: 1 })
                    .addCreatedAt()
                    .exec();
    },
    returnBookByBookId: function(bookId, userId) {
        return BorrowBooks
                    .remove({ 
                        bookId: bookId,
                        userId: userId
                    })
                    .exec()
    }
}