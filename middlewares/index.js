const verifyAuthentication = require('./verify_authentication');

const useMiddleware = function (routes, middleware) {
    let exemptedRoutes = routes.except ? routes.except : [];
    let onlyRoutes = routes.only ? routes.only : [];

    return function (req, res, next) {
        let path = req.path;

        if (exemptedRoutes.length) {
            if ((exemptedRoutes.indexOf(path) >= 0)) {
                return next();
            } else {
                return middleware(req, res, next);
            }
        } else if (onlyRoutes.length) {
            if (onlyRoutes.indexOf(path) < 0) {
                return next();
            } else {
                return middleware(req, res, next);
            }
        } else {
            return middleware(req, res, next);
        }
    };
};

const setUp = function (router) {
    // Authentication middleware
    router.use(useMiddleware({
        except: ['/auth/login', '/auth/register']
    }, verifyAuthentication));
}

module.exports = setUp;