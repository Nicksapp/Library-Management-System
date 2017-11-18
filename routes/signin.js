var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;

// GET /signin 登录页
router.get('/', checkNotLogin, function (req, res, next) {
    res.render('signin')
});

// POST /signin 用户登录
router.post('/', checkNotLogin, function (req, res, next) {
    var id = req.fields.id;
    var password = req.fields.password;

    UserModel.getUserById(id)
        .then(function (user) {
            if (!id) {
                req.flash('error', 'User does not exist!');
                return res.redirect('back');
            }
            // 检查密码是否匹配
            if (sha1(password) !== user.password) {
                req.flash('error', 'Wrong user name or password!');
                return res.redirect('back');
            }
            req.flash('success', 'Signin successful!');
            // 用户信息写入 session
            delete user.password;
            req.session.user = user;
            // 跳转到主页
            res.redirect('/home');
        })
        .catch(function(e) {
            req.flash('error', 'This user has not registered yet!');
            res.redirect('/signin');
            next(e)
        });
});


module.exports = router;