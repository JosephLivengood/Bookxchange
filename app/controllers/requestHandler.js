'use strict';

var mongo = require('mongodb').MongoClient;
var path = process.cwd();
var CONNECTION_STRING = process.env.db;

function RequestHandler() {
    
    this.submitRequest = function(req, res) {
        var requestDetails = req.body.ISBN_owner.split(' ');
        var doc = {
            "reqisbn": requestDetails[0],
            "req": req.session.profile,
            "reqemail": req.user,
            "reqdate": new Date()
        };
        console.log(requestDetails+JSON.stringify(doc));
        if (req.user == requestDetails[1]) return res.redirect('/');
        mongo.connect(CONNECTION_STRING, function(err, db) {
            if (err) console.log(err);
            var collection = db.collection('books');
            var isDuplicate = false;
            collection.find(
                {isbn: requestDetails[0],
                owneremail: requestDetails[1]},
                {requests : 1},
                {sort: {date: 1}}
            ).toArray(function(err, result) {
                if (err) console.log(err);
                console.log(result);
                if (result[0].requests.length > 0) {
                    for(var i = 0; i < result[0].requests.length; i++) {
                        if (result[0].requests[i].reqemail == req.user) {
                            isDuplicate = true;
                            return res.redirect('/');  
                        }
                    }
                }
                if(!isDuplicate) {
                  collection.findAndModify(
                        {isbn: requestDetails[0],
                        owneremail: requestDetails[1]},
                        [['_id','asc']],
                        {$push:{ requests: doc } },
                        {},
                        function(err, object) {
                            if (err) console.log(err);
                            console.log(object);
                            res.redirect('/');
                        }
                    );
                }
                db.close();
            });
        });
    };
    
    this.viewRequests = function(req, res) {
        mongo.connect(CONNECTION_STRING,function(err,db) {
			if (err) console.log(err);
            var collection=db.collection('books');
            collection.find(
                {owneremail: req.user,
                $where:'this.requests.length>0'},
				{sort: {date: -1}}
			).toArray(function(err, result) {
                if (err) console.log(err);
				console.log(result);
				var listRequests = [];
				for(var i = 0; i < result.length; i++) {
                    for(var x = 0; x < result[i].requests.length; x++) {
                        result[i].requests[x].title = result[i].info.title;
                        console.log(result[i].requests[x]);
                        listRequests.push(result[i].requests[x]);
                    }
				}
				listRequests.sort(function(a,b) {return (a.reqdate > b.reqdate) ? 1 : ((b.reqdate > a.reqdate) ? -1 : 0);} );
				db.collection('users').find(
				    {email: req.user}
				).sort({date: -1}).toArray(function(err, result2) {
                    if (err) console.log(err);
                    //HANDLE NO HISTORY!
                    var historyDocs = result2[0].history;
                    console.log(historyDocs);
                    res.render(path + '/public/requests', {profileName:req.session.profile, user:req.user, books:listRequests, historyDocs: historyDocs});
                    db.close();
				});
            });
        });
    };

    this.answerRequest = function(req, res) {
        var answerRequestDetails = req.body.ISBN_owner.split(' '); //[0]ISBN(000=denied) [1]owneremail
        var requestedBook = req.query.isbn;
        var requestedEmail = answerRequestDetails[1];
        var responseBook = answerRequestDetails[0];
        var responseEmail = req.user;
        var historyDoc = {
            "accepted": false,
            "requestedBook": requestedBook,
            "requestedEmail": requestedEmail,
            "responseBook": responseBook,
            "responseEmail": responseEmail,
            "date": new Date()
        };
        mongo.connect(CONNECTION_STRING,function(err,db) {
			if (err) console.log(err);
            var collection=db.collection('books');   
            if (responseBook == '000') {
                collection.update(
                    {isbn: requestedBook},
                    {$pull: { 'requests': { reqemail: requestedEmail } } }
                );
                console.log(responseEmail+' declined trade from '+requestedEmail+' ('+requestedBook+')');
                res.redirect('/requests');
            } else {
                historyDoc.accepted=true;
                collection.remove(
                    {isbn: requestedBook,
                    owneremail: responseEmail}
                );
                collection.remove(
                    {isbn: responseBook,
                    owneremail: requestedEmail}
                );
                console.log(responseEmail+' accepted trade from '+requestedEmail+' ('+requestedBook+' for '+responseBook+')');
                res.render(path + '/public/approvedRequest',
                    {requestedBook: requestedBook,
                    requestedEmail: requestedEmail,
                    responseBook: responseBook,
                    responseEmail: responseEmail}
                );
            }
            db.collection('users').update(
                {$or:[{email: requestedEmail},{email: responseEmail}]},
                {$push:{'history':{historyDoc}}},
                {multi: true}
            );
        });
        
    };

}

module.exports = RequestHandler;
