'use strict';

var path = process.cwd();
var UserHandler = require(path + '/app/auth/userHandler.js');
var BookHandler = require(path + '/app/controllers/bookHandler.js');
var RequestHandler = require(path + '/app/controllers/requestHandler.js');
var passwordless = require('passwordless');

module.exports = function (app) {
	
    var userHandler = new UserHandler();
    var bookHandler = new BookHandler();
    var requestHandler = new RequestHandler();
    
    app.route('/')
        .get(function(req, res) { res.render(path + '/public/home', 
        	{profileName:'Joseph',
        	pendingApprovedRequests: 0,
        	pendingIncomingRequests: 0}
        )});

	app.route('/login')
		.get(userHandler.loadLogin)
		.post(passwordless.requestToken(userHandler.sendToken,{failureRedirect: '/login'}), userHandler.tokenSent);

	app.route('/profile')
		.get(passwordless.restricted({failureRedirect: '/login'}), userHandler.showProfile)
		.post(passwordless.restricted({failureRedirect: '/login'}), userHandler.updateName);

	app.route('/acceptlogin', passwordless.acceptToken());
 
	app.route('/logout')
		.get(passwordless.logout(), function (req, res) { res.redirect('/login') });
		
	app.route('/test')
		.post(bookHandler.checkISBN)
		.get(function (req, res) { res.render(path + '/public/test')});
		
	app.route('/test2')
		.get(bookHandler.getMostRecent)
		.post(requestHandler.submitRequest);

    
};