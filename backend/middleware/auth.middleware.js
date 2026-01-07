import passport from "passport";

const checkAuth = (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(401).json({ message: info ? info.message : 'Không được phép. Vui lòng đăng nhập.' });
        }
        req.user = user;
        next();
    })(req, res, next);
};

const checkRole = (roles) => (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Không có quyền truy cập.' });
    }
    next();
};

const checkNotAdmin = (req, res, next) => {
    if (req.user.role === 'admin') {
        return res.status(403).json({ message: 'Admin không được phép truy cập!' });
    }
    next();
};

const attemptLogin = (req, res, next) => {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            // Trả về message từ LocalStrategy
            return res.status(401).json({ 
                message: info ? info.message : 'Đăng nhập thất bại.' 
            });
        }

        req.user = user;
        next();
    }) (req, res, next);
};

export { checkAuth, attemptLogin, checkRole, checkNotAdmin };