var express = require('express');
var router = express.Router();
var converters = require('../../../common/converters');

/* Bluk 가져오기 정의에 대한 data 전체 검색 */
router.get('/', function (req, res, next) {
    bscard_eloqua.bulk.contacts.imports.get().then((result) => {
    console.log(result.data);
    res.json(result.data);
    }).catch((err) => {
    console.error(err);
    });
});

/* Bluk 가져오기 정의에 대한 data 1건 검색 */
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
router.post('/uploadData' , function (req,res,next) {

    var id = 305;
    // 현재 bulk 가져오기 정의 id는 305 이나 , 명함앱에 미정의된 필드가 있어서 추후에 벌크 가져오기 정의를 업데이트 해줘야한다.
    console.log(11);
    console.log(req.body);
    var data = req.body;
    // var data = [];
    // for(var i = 0;  1000 > i ; i++){
    //     var one_data = {
    //         "userId":"dslim",
    //         "userCode":"LGEKR",
    //         "product":"all",
    //         "first_name":"대선3",
    //         "last_name":"임3",
    //         "company":"intellicode",
    //         "rank":"데이터서비스사업부/부장",
    //         "hp":"010.7402.0722",
    //         "tel":"031252.9127",
    //         "fax":"031.629.7826",
    //         "addr1":"(16229)경기도수원시영통구광교로105경기R&DB센터705호",
    //         "addr2":"",
    //         "email": "dskim" +  i +"@intellicode.co.kr",
    //         "homepage":"http://goldenplanet.co.kr",
    //         "etc1":"test용",
    //         "etc2":"",
    //         "mailingDate":"2019-12-2919:48:08",
    //         "subscriptionDate":"1577616544"
    //     }

    //     data.push(one_data);
    // }

    console.log(data);
    
    
    var bulk_data = converters.bulk_bscard(data);

    console.log(bulk_data);
    bscard_eloqua.bulk.contacts.imports.uploadData(req.params.id , bulk_data).then((result) => {
        console.log(result.data);
        res.json(true);
    }).catch((err) => {
        console.error(err);
        res.json(false);
    });

});

module.exports = router;