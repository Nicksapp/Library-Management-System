var express = require('express');
var router = express.Router();

var UserModel = require('../models/users');
var checkLogin = require('../middlewares/check').checkLogin;

router.get('/', checkLogin, function (req, res, next) {
    var user = req.session.user;
    res.render('profile', {
        user: req.session.user
    })
});

module.exports = router;