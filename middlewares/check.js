// 用户权限控制
module.exports = {
    checkLogin: function checkLogin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', 'Not logged in');
            return res.redirect('/signin');
        }
        next();
    },

    checkNotLogin: function checkNotLogin(req, res, next) {
        if (req.session.user) {
            req.flash('error', 'Has logged');
            return res.redirect('back');//返回之前的页面
        }
        next();
    },

    checkIsAdmin: function checkIsAdmin(req, res, next) {
        if (!req.session.user) {
            req.flash('error', 'Not logged in');
            return res.redirect('/signin');
        } else {
            if (!req.session.user.isAdmin) {
                req.flash('error', 'No Access');
                return res.redirect('back');//返回之前的页面
            }
        }
        next();
    }
};