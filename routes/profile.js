var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var LibraryModel = require('../models/library');
var BorrowBookModel = require('../models/borrowBooks');
var checkLogin = require('../middlewares/check').checkLogin;
var checkIsAdmin = require('../middlewares/check').checkIsAdmin;

router.get('/:userId', checkLogin, async function (req, res, next) {
    var currentUser = req.session.user;
    var userId = req.params.userId;
    var user = await UserModel.getUserByDefaultId(userId);
    
    try {
        var bBook = await BorrowBookModel.getBorrowBooks(user._id)

        var result = [];
        bBook.forEach(async function(item) {
            var book = await LibraryModel.getRawBookById(item.bookId);

            var temp = item.created_at.split(" ");
            var returnTime = temp[0].split("-");
            var rtMonth = parseInt(returnTime[1]) + 1;
            var rTime = returnTime[0] + "-" + rtMonth + "-" + returnTime[2];

            result.push({
                id: item._id,
                bookId: item.bookId,
                created_at: item.created_at,
                returnTime: rTime,
                name: book.name,
                author: book.author,
                cover: book.cover,
                introduction: book.introduction
            })
        });
        setTimeout(() => {
            res.render('profile', {
                profile: user,
                borrow: result
            })  
        }, 1000)  
    } catch(e) {
        req.flash('error', 'Something go wrong, please try again!');
    }
});

// POST return book 还书
router.get('/:borrowId/return/:bookId', checkIsAdmin, async function (req, res, next) {
    var borrowId = req.params.borrowId,
        bookId = req.params.bookId,
        user = req.session.user._id;

    try {
        await BorrowBookModel.returnBookById(borrowId);
        var book = await LibraryModel.getRawBookById(bookId);
        try {
            await LibraryModel.updateBookById(bookId, '59dcc048234ad64c210a7bae', {
                inventory: book.inventory + 1
            })
            req.flash('success', 'Return Successfully!');
            res.redirect('back');
        } catch (e) {
            req.flash('error', 'Something go wrong, please try again!');
            res.redirect('back');
        }
    } catch (error) {
        req.flash('error', 'Something go wrong, please try again!');
        res.redirect('back');
    }
});

// POST return book 还书
router.get('/:bookId/return2/:userId', checkIsAdmin, async function (req, res, next) {
    var bookId = req.params.bookId,
        userId = req.params.userId; // 学号
    
    var user = await UserModel.getUserById(userId);
   
    try {
        await BorrowBookModel.returnBookByBookId(bookId, user._id); // bookid, user._id
        var book = await LibraryModel.getRawBookById(bookId);
        try {
            await LibraryModel.updateBookById(bookId, '59dcc048234ad64c210a7bae', {
                inventory: book.inventory + 1
            })
            req.flash('success', 'Return Successfully!');
            res.redirect('back');
        } catch (e) {
            req.flash('error', 'Something go wrong, please try again!');
            res.redirect('back');
        } 
    } catch (error) {
        req.flash('error', 'Can\'t find the borrowed record, please try again!');
        res.redirect('back');
    }
});

module.exports = router;