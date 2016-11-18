'use strict';

var mongo = require('mongodb').MongoClient;
var path = process.cwd();
var CONNECTION_STRING = process.env.db;

function RequestHandler() {
    
    //status: sent>denied/approved>completed
    this.submitRequest = function(req, res) {
        var requestDetails = req.body.ISBN_owner.split(' '); //[0]ISBN [1]owneremail
        var doc = {
            "req": req.session.profile,
            "reqemail": req.user,
            "reqdate": new Date(),
            "status": "sent",
            "resisbn": "",
            "success": ""
        };
        console.log(requestDetails+JSON.stringify(doc));
        mongo.connect(CONNECTION_STRING, function(err, db) {
            if (err) console.log(err);
            var collection = db.collection('books');
            var isDuplicate = false;
            collection.find(
                {isbn: requestDetails[0],
                owneremail: requestDetails[1]},
                { requests : 1 },
                {sort: {reqdate: -1}}
            ).toArray(function(err, result) {
                if (err) console.log(err);
                console.log(result);
                for(i = 0; i < result.length; i++) {
                    if (result[i].reqemail == req.user) {
                        isDuplicate = true;
                        return res.send('duplicate request');//HANDLE DUP    
                    }
                }
            });
            if(!isDuplicate) {
              collection.findAndModify(
                    {isbn: requestDetails[0],
                    owneremail: requestDetails[1]},
                    [['_id','asc']],
                    {$push:{ requests:{ doc } } },
                    {},
                    function(err, object) {
                        if (err) console.log(err);
                        console.log(object);
                        res.send('Request saved');
                        db.close();
                    }
                );
            }
        });
    };
     
    //buttonvalues:deny/approve (isbn+' '+owneremail+' '+approved/denied)
    this.answerRequest = function(req, res) {
        var answerRequestDetails = req.body.answer.split(' '); //[0]ISBN [1]owneremail [2]approved/denied
        //MONGOSTORE
        //EMAIL
    };


}

module.exports = RequestHandler;
