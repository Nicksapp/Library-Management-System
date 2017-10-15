var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var LibraryModel = require('../models/library');
var BorrowBookModel = require('../models/borrowBooks');
var checkLogin = require('../middlewares/check').checkLogin;

router.get('/', checkLogin, function (req, res, next) {
    var user = req.session.user;
    BorrowBookModel.getBorrowBooks(user._id)
        .then(function(bBook) {
            // var result = [];
            // result.forEach(function(item) {
            //     LibraryModel.getRawBookById(item.bookId)
            //         .then(function(book) {
            //             result.push({
            //                 id: book._id,
            //                 name: book.name,
            //                 author: book.author,
            //                 cover: book.cover,
            //                 introduction: book.introduction
            //             });
            //         })
            // });
            
            res.render('profile', {
                user: user,
                borrow: bBook
            })   
        
             
        })
});

// POST 还书 
router.get('/:borrowId/return/:bookId', checkLogin, function (req, res, next) {
    var borrowId = req.params.borrowId;
    var bookId = req.params.bookId;
    var user = req.session.user._id;

    BorrowBookModel.returnBookById(id)
        .then(function () {
            LibraryModel.getRawBookById(bookId)
                .then(function (book) {
                    LibraryModel.updateBookById(bookId, '59dcc048234ad64c210a7bae', { inventory: book.inventory + 1 })
                        .then(function () {
                            req.flash('success', 'Return successfully!');
                            res.redirect('back');
                        })
                })
            
        })
        .catch(next);
});

module.exports = router;