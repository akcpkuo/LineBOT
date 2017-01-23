"use strict";

var config = require('./config');
var request = require('request');
var querystring = require('querystring');

module.exports = {

    translate:function(queryText, target, callback) {
        console.log('Enter translate');
        const q = querystring.escape(queryText);
        var req = request.defaults({
            jar: true,
            rejectUnauthorized: false,
            followAllRedirects: true
        });
        const queryURL = "https://www.googleapis.com/language/translate/v2?q="+q+"&target="+target+"&key=AIzaSyA87OKGc0ebmZ7zmv1485_BCJx3Ac03t3g";
        //const queryURL = "https://www.googleapis.com/language/translate/v2?q=%E8%80%81%E8%99%8E&target=en&key=AIzaSyA87OKGc0ebmZ7zmv1485_BCJx3Ac03t3g"
        req.get({
            url:queryURL,
            headers: {
                'Cache-Control':'no-cache'
            }
        }, function(err, resp, body) {
            console.log('Body=', body);
            if (err) {
                console.log('Error: ', error);
                callback(err);
            } else {
                callback(null, body);
            }
        });
    }

};
