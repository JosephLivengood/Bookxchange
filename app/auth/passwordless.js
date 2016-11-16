'use strict';

var passwordless = require('passwordless');
var MongoStore = require('passwordless-mongostore');
var email   = require("emailjs");

var CONNECTION_STRING = process.env.db;
var smtpServer  = email.server.connect({
   user:    'book.xchange.live@gmail.com',
   password: process.env.emp, 
   host:    'smtp.gmail.com', 
   ssl:     true
});

module.exports = function (app) {
    passwordless.init(new MongoStore(CONNECTION_STRING));
    passwordless.addDelivery(
        function(tokenToSend, uidToSend, recipient, callback) {
            var host = 'https://bookx-livengood.c9users.io/acceptlogin';
            smtpServer.send({
                text:    'Hello!\nAccess your account here: ' 
                + host + '?token=' + tokenToSend + '&uid=' 
                + encodeURIComponent(uidToSend) +'\n\nRemember, this is your single use individual link!', 
                from:    'BookXchange', 
                to:      recipient,
                subject: 'Login Token for BookX!'
            }, function(err, message) { 
                if(err) {
                    console.log(err);
                }
                callback(err);
            });
    }); 
    app.use(passwordless.sessionSupport());
    app.use(passwordless.acceptToken({ successRedirect: '/profile'}));
};