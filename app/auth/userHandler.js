'use strict';

var mongo = require('mongodb').MongoClient;
var path = process.cwd();
var CONNECTION_STRING = process.env.db;
var BookHandler = require(path + '/app/controllers/bookHandler.js');

function UserHandler () {

    var bookHandler = new BookHandler();

    this.sendToken = function(user, delivery, callback, req, res) {
        mongo.connect(CONNECTION_STRING,function(err,db) {
            if (err) console.log(err);
            var collection=db.collection('users');
            collection.findAndModify(
                {email:user.toLowerCase()},
                [['_id','asc']],
                {$setOnInsert:{email: user.toLowerCase(), name: 'Empty',history:[], success: 'false', role: 'user'}},
                {upsert:true, new: true },
                function(err, doc) {
                    if (err) console.log(err), callback(null, null);
                    //callback(null, doc.value.email);
                    req.session.profile = doc.value.name;
                    req.session.profilerole = doc.value.role;
                    callback(null, doc.value.email);
                    db.close();
                }
            );
        });
    };
    
    this.loadLogin = function (req, res) {
        res.render(path + '/public/login', {tokenSent: false});
    };
    
    this.tokenSent = function (req, res) {
        res.render(path + '/public/login', {tokenSent: true});
    };
    
    this.showProfile = function(req, res) {
        var needsUpdate = (req.user =='Empty') ? true : false;
        bookHandler.loadAddedBooksGrid(req.user, function(i) { res.render(path + '/public/profile',
                {needsUpdate: needsUpdate,
                loggedIn: Boolean(req.user),
                loggedInAs: req.session.profile,
                loggedInEmail: req.user,
                books: i});
        });
    };

    this.updateProfile = function(req, res) {
        var newuser = req.body.newuser;
        mongo.connect(CONNECTION_STRING,function(err,db) {
            if (err) console.log(err);
            var collection=db.collection('users');
            collection.findAndModify(
                {email:req.user.toLowerCase()},
                [['_id','asc']],
                {$set: {name: newuser}},
                {new: true},
                function(err, doc) {
                    if (err) console.log(err);
                    req.session.profile = newuser;
                    res.redirect('/profile');
                    db.close();
                }
            );
            //db.close();
        });
    };
}

module.exports = UserHandler;