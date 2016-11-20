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
		.get(bookHandler.getMostRecent)
		.post(passwordless.restricted({failureRedirect: '/login'}),requestHandler.submitRequest);

	app.route('/login')
		.get(userHandler.loadLogin)
		.post(passwordless.requestToken(userHandler.sendToken,{failureRedirect: '/login'}), userHandler.tokenSent);

	app.route('/profile')
		.get(passwordless.restricted({failureRedirect: '/login'}), userHandler.showProfile)
		.post(passwordless.restricted({failureRedirect: '/login'}), userHandler.updateProfile);

	app.route('/acceptlogin', passwordless.acceptToken());
 
	app.route('/deletebook')
		.post(passwordless.restricted({failureRedirect: '/login'}),bookHandler.deleteISBN);
		
	app.route('/mybooks')
		.get(bookHandler.loadAddedBooksGrid)
		.post(passwordless.restricted({failureRedirect: '/login'}),bookHandler.checkISBN);
 
	app.route('/logout')
		.get(passwordless.logout(), function (req, res) { res.redirect('/login') });
		
	app.route('/requests')
		.get(requestHandler.viewRequests);
		
	app.route('/viewRequest')
		.get(bookHandler.getReqBooks)
		.post(requestHandler.answerRequest);
    
};