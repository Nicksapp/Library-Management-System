var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var BorrowBookModel = require('../models/borrowBooks');
var checkIsAdmin = require('../middlewares/check').checkIsAdmin;

router.get('/:bookId', checkIsAdmin, async function (req, res, next) {
    var bookId = req.params.bookId;

    try {
        var users = await BorrowBookModel.getBorrowUsers(bookId);
    
        var result = [];
        users.forEach(async function(user) {
            var userInfo = await UserModel.getUserByDefaultId(user.userId)
            result.push({
                userId: user.userId,
                name: userInfo.name,
                id: userInfo.id,
                avatar: userInfo.avatar,
                borrowTime: user.created_at
            })
        });
        // 获得一本书已借的用户
        setTimeout(function() {
            res.render('borrow', {
                borrowUser: result
            });
        }, 1000);  

    } catch (error) {
        next();
    }
      
});

module.exports = router;