var fs = require('fs');
var path = require('path');
var sha1 = require('sha1');
var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkNotLogin = require('../middlewares/check').checkNotLogin;
var checkIsAdmin = require('../middlewares/check').checkIsAdmin;

// GET /signup 注册页
router.get('/', checkIsAdmin, function (req, res, next) {
    res.render('signup');
});

// POST /signup 用户注册
router.post('/', checkIsAdmin, function (req, res, next) {
    var userData = {
        id: req.fields.id,
        name: req.fields.name,
        gender: req.fields.gender,
        bio: req.fields.bio,
        avatar: req.files.avatar.path.split(path.sep).pop(),
        password: req.fields.password,
        repassword: req.fields.repassword
    }
    // 校验参数
    try {
        if (userData.password !== userData.repassword) {
            throw new Error('两次输入密码不一致');
        }
    } catch (e) {
        // 注册失败，异步删除上传的头像
        fs.unlink(req.files.avatar.path);
        req.flash('error', e.message);
        return res.redirect('/signup');
    }

    // 明文密码加密
    userData.password = sha1(userData.password);

    // 待写入数据库的用户信息
    var user = {
        id: userData.id,
        name: userData.name,
        password: userData.password,
        gender: userData.gender,
        bio: userData.bio,
        avatar: userData.avatar,
        isAdmin: false
    };
    // 用户信息写入数据库
    UserModel.create(user)
        .then(function (result) {
            // 此 user 是插入 mongodb 后的值，包含 _id
            user = result.ops[0];
            // 将用户信息存入 session
            delete user.password;
            // req.session.user = user;
            // 写入 flash
            req.flash('success', 'Registration success');
            // 跳转到首页
            res.redirect('/home');
        })
        .catch(function (e) {
            // 注册失败，异步删除上传的头像
            fs.unlink(req.files.avatar.path);
            // 用户名被占用则跳回注册页，而不是错误页
            if (e.message.match('E11000 duplicate key')) {
                req.flash('error', 'This Student\'s ID has been used, please try another one!');
                return res.redirect('/signup');
            }
            next(e);
        });
});

module.exports = router;