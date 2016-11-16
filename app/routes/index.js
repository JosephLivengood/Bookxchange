'use strict';

var path = process.cwd();
var UserHandler = require(path + '/app/auth/userHandler.js');
var passwordless = require('passwordless');

module.exports = function (app) {
	
    var userHandler = new UserHandler();
    
    app.route('/')
        .get(function(req, res) { res.render(path + '/public/test') });

	app.route('/login')
		.get(userHandler.loadLogin)
		.post(passwordless.requestToken(userHandler.sendToken,{failureRedirect: '/login'}), userHandler.tokenSent);

	app.route('/profile')
		.get(passwordless.restricted({failureRedirect: '/login'}), userHandler.showProfile)
		.post(passwordless.restricted({failureRedirect: '/login'}), userHandler.updateName);

	app.route('/acceptlogin', passwordless.acceptToken());
 
	app.route('/logout')
		.get(passwordless.logout(), function (req, res) { res.redirect('/login') });

    
};