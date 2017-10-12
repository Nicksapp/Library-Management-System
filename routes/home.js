var express = require('express');
var router = express.Router();

var LibraryModel = require('../models/library');
var checkLogin = require('../middlewares/check').checkLogin;

router.get('/', function (req, res, next) {
    LibraryModel.getBooks('59dcc048234ad64c210a7bae')
        .then(function (books) {
            res.render('home', {
                books: books
            });
        })
        .catch(next);
});

module.exports = router;