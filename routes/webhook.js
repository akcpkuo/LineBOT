var express = require('express');
var crypto = require('crypto');
var request = require('request');
var router = express.Router();
var config = require('./config');
var translate = require('../api/translate');

var lineChannelSecret = config.lineChannelSecret;
var accessToken = config.accessToken;

/* GET users listing. */
router.post('/', function(req, res, next) {

    var bodyString = JSON.stringify(req.body);
    console.log('Body = ', bodyString);
    var signature = req.headers['x-line-signature'];
    console.log('signature :', signature);
    console.log('headers', req.headers);
    var validate = validateSignature(bodyString, lineChannelSecret, signature);
    if (validate) {
        console.log('Validate OK!');
        var events = req.body.events;
        if (events&&events.length>0) {
            var firstEvent = events[0];
            console.log('Event=', firstEvent);
            var type = firstEvent.type;
            if (type==='message'&&firstEvent.message.type==='text') {
                replyTranslate(firstEvent, function(err){
                    res.send('ok');
                });
            } else if (type==='follow') {
                sendGreetingMessage(firstEvent.replyToken, function(err){
                    res.send('ok');
                });
            } else {
                console.log('Check Error');
                res.send('ok');
            }
        } else {
            res.send('ok');
        }
    } else {
        res.send('ok');
    }
});

function validateSignature(bodyS, channelSecret, mysignature) {
  if (mysignature) {
    console.log('Start hmac body = ', bodyS);
    var hmac = crypto.createHmac('sha256', channelSecret);
    console.log('HMAC = ', hmac);
    try {
      hmac.update(bodyS);
      var digest = hmac.digest('base64');
      console.log('Body Digest =', digest);
      console.log('Signature =', mysignature);
      if (digest === mysignature) {
        return true;
      }
    } catch (ex) {
      console.log(ex);
    }

  }
  console.log('validate fail!');
  return false;
}

function replyTranslate(event, callback) {
    var message = event.message.text;
    var replyToken = event.replyToken;

    translate.translate(message, 'zh-TW', function(err, result){
        if (err) {
            console.log('Translate Error:', err);
            callback(err);
        } else {
            var resultObject = JSON.parse(result);
            var data = resultObject.data;
            if (data) {
                var translatedText = data.translations[0].translatedText;
                console.log('translatedText:', translatedText);
                replymessage(replyToken, translatedText, function(err, result){
                    if (err) {
                        console.log('translate error:', err);
                        callback(err);
                    } else {
                        callback(null);
                    }
                });
            } else {
                callback("no data");
            }
        }
    });
}

function sendGreetingMessage(replyToken, cb) {
    var req = request.defaults({
      jar: true,
      rejectUnauthorized: false,
      followAllRedirects: true
    });
    var url = 'https://api.line.me/v2/bot/message/reply';
    var bearerHeadder = "Bearer "+accessToken
    var reply = {
      replyToken:replyToken,
      messages:[
        {
          type: "text",
          text: "您好，輸入任何語言都會幫您翻譯成中文。",
        }
      ]
    };
    var bodyString = JSON.stringify(reply);
    var params = {
      url:url,
      method: "POST",
      json: true,
      headers: {
        'Authorization': bearerHeadder,
        'Content-Type': 'application/json'
      },
      body: reply
    };
    req.post(params, function(error, res, resbody){
      if (error) {
        console.log("Post to line error: ", error);
      }
      console.log('Body=', resbody);
      cb(null);
    });
}

function replymessage(replyToken, message, cb) {
  var req = request.defaults({
    jar: true,
    rejectUnauthorized: false,
    followAllRedirects: true
  });
  var url = 'https://api.line.me/v2/bot/message/reply';
  var bearerHeadder = "Bearer "+accessToken
  var reply = {
    replyToken:replyToken,
    messages:[
      {
        type: "text",
        text: message,
      }
    ]
  };
  var bodyString = JSON.stringify(reply);
  var params = {
    url:url,
    method: "POST",
    json: true,
    headers: {
      'Authorization': bearerHeadder,
      'Content-Type': 'application/json'
    },
    body: reply
  };
  req.post(params, function(error, res, resbody){
    if (error) {
      console.log("Post to line error: ", error);
    }
    console.log('Body=', resbody);
    cb(null);
  });
}

// function replymessage(replyToken, cb) {
//   var req = request.defaults({
//     jar: true,
//     rejectUnauthorized: false,
//     followAllRedirects: true
//   });
//   var url = 'https://api.line.me/v2/bot/message/reply';
//   var bearerHeadder = "Bearer "+accessToken
//   var message = {
//     replyToken:replyToken,
//     messages:[
//       {
//         type: "template",
//         altText: "this is a buttons template",
//         template: {
//           type: "buttons",
//           thumbnailImageUrl: 'https://www.cool3c.com/files/imagecache/meta_fb/icext/26c7d871ccbe605a050b555f436696f8.jpg',
//           title: "Menu",
//           text: "Please select",
//           actions: [
//             {
//               type: "postback",
//               label: "Buy",
//               data: "action=buy&itemid=123"
//             },
//             {
//               type: "postback",
//               label: "Add to cart",
//               data: "action=add&itemid=123"
//             },
//             {
//               type: "uri",
//               label: "View detail",
//               uri: "http://ec2-54-88-194-195.compute-1.amazonaws.com/test"
//             }
//           ]
//         }
//       }
//     ]
//   };
//   var bodyString = JSON.stringify(message);
//   var params = {
//     url:url,
//     method: "POST",
//     json: true,
//     headers: {
//       'Authorization': bearerHeadder,
//       'Content-Type': 'application/json'
//     },
//     body: message
//   };
//   req.post(params, function(error, res, resbody){
//     if (error) {
//       console.log("Post to line error: ", error);
//     }
//     console.log('Body=', resbody);
//     cb(null);
//   });
// }

module.exports = router;
