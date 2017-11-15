var fs = require('fs');
var path = require('path');
var express = require('express');
var router = express.Router();

var LibraryModel = require('../models/library');
var BorrowBookModel = require('../models/borrowBooks');
var UserModel = require('../models/users');
var checkLogin = require('../middlewares/check').checkLogin;
var checkIsAdmin = require('../middlewares/check').checkIsAdmin;

router.get('/', checkIsAdmin, async function (req, res, next) {
    var admin = req.query.admin;
    
    try {
        var books = await LibraryModel.getBooks(admin);
        books.forEach(async function(book) {
            try {
                var borrowCount = await BorrowBookModel.getBorrowBooksCount(book._id);
                book.borrowCount = borrowCount;
            } catch (error) {
                req.flash('error', 'Something go wrong, please try again!');
            }
        }, this);

        setTimeout(() => {
            res.render('library', {
                books: books
            });
        }, 1000)
    } catch (error) {
        req.flash('error', 'Something go wrong, please try again!');
        next();
    }

});

// POST  Add Book
router.post('/', checkIsAdmin, function (req, res, next) {
    var admin = req.session.user._id;

    var bookData = {
        admin: req.session.user._id,
        name: req.fields.name,
        location: req.fields.location,
        author: req.fields.author,
        press: req.fields.press,
        inventory: parseInt(req.fields.inventory),
        date: req.fields.date,
        score: parseInt(req.fields.score),
        cover: req.fields.cover_url || req.files.cover.path.split(path.sep).pop() ,
        introduction: req.fields.introduction
    }
    // 校验参数
    try {
        if (!bookData.name.length) {
            throw new Error('Please fill in the name!');
        }
        if (!bookData.introduction.length) {
            throw new Error('Please fill in the introduction!');
        }
    } catch (e) {
        req.flash('error', e.message);
        return res.redirect('back');
    }

    // const IDSet = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];    

    // var IDNo = Math.floor(Math.random() * 999);
    // if ((IDNo + '').length === 2 ) {
    //     IDNo = '0' + IDNo;
    // } else if ((IDNo + '').length === 1) {
    //     IDNo = '00' + IDNo; 
    // }
    var realName = bookData.name + '(' + bookData.location +')';

    var book = {
        admin: bookData.admin,
        name: realName,
        author: bookData.author,
        press: bookData.press,
        inventory: bookData.inventory,
        date: bookData.date,
        score: bookData.score,
        cover: bookData.cover,
        introduction: bookData.introduction,
        pv: 0
    };
    
    LibraryModel.create(book)
        .then(function (result) {
            // 此 post 是插入 mongodb 后的值，包含 _id
            book = result.ops[0];
            req.flash('success', 'Add successfully!');
            // 发表成功后跳转到
            res.redirect(`/library`);
        })
        .catch(next);
});

// GET /library/:bookId 单独的 book
router.get('/:bookId', function (req, res, next) {
    var bookId = req.params.bookId;

    Promise.all([
        LibraryModel.getBookById(bookId),// 获取文章信息
        LibraryModel.incPv(bookId)// pv 加 1
    ])
        .then(function (result) {
            var book = result[0];
            if (!book) {
                throw new Error('The book does not exist!');
            }
            book.location = book.name.slice(-7, -1);
            res.render('book', {
                book: book
            });
        })
        .catch(next);
});

// GET /library/:bookId/remove 删除 book
router.get('/:bookId/remove', checkIsAdmin, function (req, res, next) {
    var bookId = req.params.bookId;
    var admin = req.session.user._id;

    LibraryModel.delBookById(bookId, admin)
        .then(function () {
            req.flash('success', 'Delete the book successfully!');
            // 删除成功后跳转到主页
            res.redirect('/library');
        })
        .catch(next);
});

// POST /library/:bookId/edit 编辑 book
router.post('/:bookId/edit', checkIsAdmin, function (req, res, next) {
    var bookId = req.params.bookId;
    var admin = req.session.user._id;
    
    var bookData = {
        name: req.fields.name,
        author: req.fields.author,
        press: req.fields.press,
        inventory: parseInt(req.fields.inventory),
        date: req.fields.date,
        score: parseInt(req.fields.score),
        introduction: req.fields.introduction
    };

    LibraryModel.updateBookById(bookId, admin, bookData)
        .then(function () {
            req.flash('success', 'Edit book success!');
            // 编辑成功后跳转到上一页
            res.redirect(`/library`);
        })
        .catch(next);
});


// POST 借书
router.get('/:bookId/borrow', checkIsAdmin, async function (req, res, next) {
    var userId = req.session.user._id;
    var bookId = req.params.bookId;
    
    var borrow = {
        userId: userId,
        bookId: bookId
    };
    try {
        var book = await LibraryModel.getRawBookById(borrow.bookId);
        if (book.inventory >= 1) {
            try {
                await LibraryModel.updateBookById(borrow.bookId, '59dcc048234ad64c210a7bae', {
                    inventory: book.inventory - 1
                })
                try {
                    await BorrowBookModel.create(borrow)
                    req.flash('success', 'Borrow Successfully!');
                    res.redirect('back');
                } catch (error) {
                    req.flash('error', 'Something go wrong, please try again!');
                    res.redirect('back');
                }
            } catch (error) {
                req.flash('error', 'Something go wrong, please try again!');
                res.redirect('back');
            }
            
        } else {
            req.flash('error', 'Zero inventory!');
            res.redirect('back');
        }
    } catch (error) {
        req.flash('error', 'Something go wrong, please try again!');
        res.redirect('back');
    }
    
});
// POST 借书 By 指定 user_id
router.get('/:bookId/borrow/:userId', checkIsAdmin, async function (req, res, next) {
    var userId = req.params.userId;
    var bookId = req.params.bookId;
    
    var user = await UserModel.getUserById(userId);
    if (!user) {
        req.flash('error', 'There is no Student Id exist, please try another one!');
        res.redirect('back');
        return false;
    } 
    var hasBorrowedBook = await BorrowBookModel.getBorrowBooks(user._id);
    if (hasBorrowedBook.length >= 2) {
        req.flash('error', 'Has reached the upper limit of the book!(One reader can only borrow 2 books at the same time)');
        res.redirect('back');
        return false;
    }

    var borrow = {
        userId: user._id,
        bookId: bookId
    };

    try {
        var book = await LibraryModel.getRawBookById(borrow.bookId);
        if (book.inventory >= 1) {
            try {
                await LibraryModel.updateBookById(borrow.bookId, '59dcc048234ad64c210a7bae', {
                    inventory: book.inventory - 1
                })
                try {
                    await BorrowBookModel.create(borrow)
                    req.flash('success', 'Borrow Successfully by ' + userId +'!');
                    res.redirect('back');
                } catch (error) {
                    req.flash('error', 'Something go wrong, please try again!');
                    res.redirect('back');
                }
            } catch (error) {
                req.flash('error', 'Something go wrong, please try again!');
                res.redirect('back');
            }
            
        } else {
            req.flash('error', 'Zero inventory!');
            res.redirect('back');
        }
    } catch (error) {
        req.flash('error', 'Something go wrong, please try again!');
        res.redirect('back');
    }
    
});



module.exports = router;