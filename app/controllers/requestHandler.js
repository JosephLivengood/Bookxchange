'use strict';

var http = require('http');
var url = process.env.db;
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
        //MONGOSTORE
    };
     
    //buttonvalues:deny/approve (isbn+' '+owneremail+' '+approved/denied)
    this.answerRequest = function(req, res) {
        var answerRequestDetails = req.body.answer.split(' '); //[0]ISBN [1]owneremail [2]approved/denied
        //MONGOSTORE
        //EMAIL
    };


}

module.exports = RequestHandler;
