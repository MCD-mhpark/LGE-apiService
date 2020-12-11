var express = require('express');
var router = express.Router();
var eloqua = require('eloqua-oauth').authentication;

oauth.post("/oauth/:appId/:installId", function(req, res){
    //Get the parameters from the request uri
    var appId = req.params.appId;
    var installId = req.params.installId;
    var callback = req.query.callback;

    //Create the authorize uri and redirect the user
    var uri = eloqua.authorize(appId, 'https://[app]/callback', installId);
    res.redirect(uri);
    res.redirect(uri);
});    

oauth.all("/callback", function(req, res){
    //Get the parameters from the uri
    var installId = req.query.state;
    var code = req.query.code;
 
    //Load appId, callback, and client_secret based on the installId of the request

    //Call the grant endpoint in Eloqua       
    eloqua.grant(appId, client_secret, code, 'https://[app]/callback', function (error, body) {
        if (error) {
            //Handle the error
        }else{
            //Finish the installtion in Eloqua by redirecting to the callback in the previous step
            res.redirect(callback);
        }
    });
});

module.exports = router;
