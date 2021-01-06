var express = require('express');
var router = express.Router();

/* Contacts */
router.get('/', function (req, res, next) {
    bscard_eloqua.bulk.contacts.imports.get().then((result) => {
    console.log(result.data);
    res.json(result.data);
    }).catch((err) => {
    console.error(err);
    });
});

/* Contacts */
router.get('/one/:id', function (req, res, next) {



   

    bscard_eloqua.bulk.contacts.imports.getOne(req.params.id).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
    });
});

// contact bulk data 가져오기 정의 만들기
router.post('/create/' , function (req,res,next) {

    //* req.body 참조 url = https://docs.oracle.com/en/cloud/saas/marketing/bscard_eloqua-develop/Developers/BulkAPI/Tutorials/Import.htm
    // body
    /*
    * {
          "name": "Docs Import Example",
          "fields": {
              "firstName": "{{Contact.Field(C_FirstName)}}",
              "lastName": "{{Contact.Field(C_LastName)}}",
              "emailAddress": "{{Contact.Field(C_EmailAddress)}}"
           },
               "identifierFieldName": "emailAddress",
               "isSyncTriggeredOnImport" : "false"
            } */

    bscard_eloqua.bulk.contacts.imports.create(req.body).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
    });

})

// contact bulk data 가져오기 정의 업데이트
router.post('/update/' , function (req,res,next) {

    //* req.body 참조 url = https://docs.oracle.com/en/cloud/saas/marketing/bscard_eloqua-develop/Developers/BulkAPI/Tutorials/Import.htm
    // body
    /*
    * {
          "name": "Docs Import Example",
          "fields": {
              "firstName": "{{Contact.Field(C_FirstName)}}",
              "lastName": "{{Contact.Field(C_LastName)}}",
              "emailAddress": "{{Contact.Field(C_EmailAddress)}}"
           },
               "identifierFieldName": "emailAddress",
               "isSyncTriggeredOnImport" : "false"
            } */

    bscard_eloqua.bulk.contacts.imports.update(req.body).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
    });

})

// contact bulk data 가져오기 정의 업데이트 , 현재 contact 데이터에 대해서 100 , 1000 , 10000건의 데이터 업로드를 TEST
router.post('/uploadData/:id' , function (req,res,next) {

    // var upData = [];
    //
    // for(var i = 0 ; i < 10000; i++){
    //     upData.push({
    //         firstName: "ljtt" + i,
    //         lastName: "goldt" + i,
    //         emailAddress: "ljt" +i+"@tribonstest.com"}
    //     )
    // }
    //
    // // req.body = upData;
    // req.body = upData;

    bscard_eloqua.bulk.contacts.imports.uploadData(req.params.id , req.body).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
    });

});

module.exports = router;