'use strict';

var https = require('https');
var mongo = require('mongodb').MongoClient;
var path = process.cwd();
var CONNECTION_STRING = process.env.db;

function BookHandler() {

    this.getMostRecent = function(req, res) {
        mongo.connect(CONNECTION_STRING,function(err,db) {
			if (err) console.log(err);
            var collection=db.collection('books');
            collection.find({},
				{requests: 0},
				{sort: {date: -1}}
			).limit(17).toArray(function(err, result) {
                if (err) console.log(err);
				//console.log(result);
                res.render(path + '/public/home',
                    {profileName:req.session.profile,
                    pendingApprovedRequests: 0,
                    pendingIncomingRequests: 0,
                    books:result});
                db.close();
            });
        });
    };

    this.checkISBN = function(req, res) {
        var ISBN = req.body.ISBN;
        var url = 'https://openlibrary.org/api/books?bibkeys=' + ISBN + '&jscmd=data&format=json';
        https.get(url, function(result) {
            var body = '';
            result.on('data', function(data) {
                body += data;
            });
            result.on('end', function() {
                var response = JSON.parse(body);
                console.log(response);
                var r = response[ISBN];
                if (!r) return res.send('invalid');
                if (!r.authors) r.authors = [{"name":"-"}];
                if (!r.number_of_pages) r.number_of_pages = "unavailable";
                if (!r.publish_date) r.publish_date = "unavailable";
                var doc = {
                    "isbn": ISBN,
                    "owner": req.session.profile,
                    "owneremail": req.user,
                    "ownercountry": req.session.profilecountry,
                    "date": new Date(),
                    "requests": [],
                    "info": {
                        "isbn": ISBN,
                        "title": r.title,
                        "author": r.authors[0].name,
                        "pages": r.number_of_pages,
                        "publish_date": r.publish_date,
                    }
                    //COVER HANDLED CLIENTSIDE  http://covers.openlibrary.org/b/isbn/5353003098-L.jpg
                };
                mongo.connect(CONNECTION_STRING, function(err, db) {
                    if (err) console.log(err);
                    var collection=db.collection('books');
                    collection.insert(doc, function(err, result) {
                        if (err) console.log(err);
                        res.redirect('/profile');
                        db.close();
                    });
                });
                console.log(doc);
            });
        }).on('error', function(e) {
            console.log('error: ' + e);
        });
    };
    
    this.deleteISBN = function(req, res) {
        var ISBN = req.body.ISBN;
        mongo.connect(CONNECTION_STRING, function(err, db) {
            if (err) console.log(err);
            var collection=db.collection('books');
            collection.remove({isbn: ISBN, owneremail: req.user},
            function(err, result) {
                if (err) console.log(err);
                res.redirect('/profile');
                db.close();
            });
        });
    };
    
    this.getReqBooks = function(req, res) {
        var requestedBook = req.query.isbn;
        var requester = req.query.req;
        mongo.connect(CONNECTION_STRING,function(err,db) {
			if (err) console.log(err);
            var collection=db.collection('books');
            collection.find(
                {isbn: requestedBook,
                owneremail: req.user},
				{requests: 1},
				{sort: {date: -1}}
			).toArray(function(err, result) {
                if (err) console.log(err);
				for(var i = 0; i < result[0].requests.length; i++) {
                    if (result[0].requests[i].req == requester) {
                        var requesterEmail = result[0].requests[i].reqemail;
                        collection.find(
                            {owneremail: requesterEmail},
                            {requests: 0},
                            {sort: {date: -1}}
                        ).toArray(function(err, result2) {
                            if (err) console.log(err);
                            res.render(path + '/public/requestersbooks',
                                {profileName:req.session.profile,
                                books: result2});
                        });
                        break;
                    }
				}
            });
        });
        
        
    };
    
    this.loadAddedBooksGrid = function(email, callback) {
        mongo.connect(CONNECTION_STRING,function(err,db) {
			if (err) console.log(err);
            var collection=db.collection('books');
            collection.find({owneremail: email},
				{},
				{sort: {date: -1}}
			).toArray(function(err, result) {
                if (err) console.log(err);
                callback(result);
                db.close();
            });
        });
    };

}

module.exports = BookHandler;