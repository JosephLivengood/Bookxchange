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
				{ requests: 0},
				{sort: {date: -1}}
			).limit(17).toArray(function(err, result) {
                if (err) console.log(err);
				//console.log(result);
                res.render(path + '/public/home', {profileName:'Samantha',pendingApprovedRequests: 0,pendingIncomingRequests: 0,books:result});
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
                	});
        		});
                console.log(doc);
                res.send(JSON.stringify(doc));
            });
        }).on('error', function(e) {
            console.log('error: ' + e);
        });
    };
    
    this.getUserBooks = function(req, res) {
        
    };

}

module.exports = BookHandler;