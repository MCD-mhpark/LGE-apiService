const { json } = require('express');
var express = require('express');
var router = express.Router();
var converters = require('../../common/converters');

//하나의 이메일 검색값으로 여러 contacts id를 조회 
// 조회순서에 따른 데이터는 보장되지 않는다 (ex labeltest_2 , labeltest_1로 조회했을 경우 결과값이 labeltest_1, labeltest_2로 나옴)
async function getContacts(email_list, depth ){
    
    var queryString = {};
    var emailString = "?";
    for(var i = 0 ; email_list.length > i ; i++ ){
        emailString += "emailAddress='" + email_list[i] + "'";
    }
    queryString['search'] = emailString;
    queryString['depth'] = depth ? depth : "";

    console.log(queryString);
    var contacts_data ;
    await bscard_eloqua.data.contacts.get(queryString).then((result) => { 
        console.log(result.data);
        // console.log(result.data.total);
        
        if(result.data.total && result.data.total > 0 ){
            contacts_data = result.data;
            console.log(contacts_data);
        }
    }).catch((err) => {
        console.error(err.message);
     
    });


    return contacts_data;
}

async function mappedContacts(bs_data, depth){
    
    var queryString = {};
    var emailString = "?";
    for(var i = 0 ; bs_data.length > i ; i++ ){
        emailString += "emailAddress='" + bs_data[i].email + "'";
    }
    queryString['search'] = emailString;
    queryString['depth'] = depth ? depth : "";
    console.log(queryString);
    await bscard_eloqua.data.contacts.get(queryString).then((result) => { 
        console.log(result.data);
        // console.log(result.data.total);
        
        if(result.data.total && result.data.total > 0 ){
            var result = result.data.elements;
            for(var i = 0 ; bs_data.length > i ; i++){
                for(var j = 0 ; result.length > j ; j++){ 
                    if(bs_data[i].email == result[j].emailAddress){
                        bs_data[i].id = result[j].id;
                    }
                }
                
            }

        }

    }).catch((err) => {
        console.error(err);
        
    });
    // console.log(bs_data);
    return bs_data;
}


router.get('/all', async function (req, res, next) {
    var queryString = {
        depth : req.query.depth
    };
    await bscard_eloqua.data.contacts.get(queryString).then((result) => { 
        console.log(result.data);
        // res.json(true);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
        res.json(false);
    });
});

//이메일 배열 값으로 여러 contacts id를 조회
router.post('/search_all', async function (req, res, next) {
    // emails 예제 ["jtlim1@goldenplanet.co.kr" , "jtlim2@goldenplanet.co.kr" .. ]
    var email_list =  req.body.email_list;
    console.log(email_list);
    var depth = req.body.depth;
    var contacts_data = await getContacts(email_list , depth );

    if(contacts_data && contacts_data.total > 0) res.json(contacts_data);
    else res.json(false);

});

router.get('/search_one', function (req, res, next) {
    var queryString = {}  ;

    // var id = getContacts(email , "minimal");
    var id = req.query.id;

    bscard_eloqua.data.contacts.getOne( id , queryString).then((result) => {
        console.log(result.data);
        res.json(result.data);
        // res.json(true);
    }).catch((err) => {
        console.error(err);
        res.json(false);
    });
});

router.post('/create', async function (req, res, next) {

    console.log("create call");
        //body 예시
        // req.body = {
        //   "address1": "P.O.Box 72202 - 00200",
        //   "address2": "6th Floor, Lonrho House ",
        //   "address3": "Standard Street, City Centre",
        //   "businessPhone": "2540312885",
        //   "city": "Copenhagen1",
        //   "country": "Denmark1",
        //   "emailAddress": "fortinbras1@norway.com",
        //   "fax": "2540312886",
        //   "firstName": "Fort",
        //   "lastName": "Fortinbras",
        //   "mobilePhone": "2540312887",
        //   "postalCode": "2620",
        //   "province": "Malmo",
        //   "salesPerson": "Hamlet",
        //   "title": "Actor",
        // }


        // req.body =  [
        //     {
        //       "userId":"dslim", 
        //       "userCode":"LGEKR", 
        //       "product":"all", 
        //       "first_name":"대선17", 
        //       "last_name":"임17", 
        //       "company":"intellicode", 
        //       "rank":"데이터 서비스 사업부 /부장", 
        //       "hp":"010.7402.0722", 
        //       "tel":"031 252.9127", 
        //       "fax":"031.629.7826",                    
        //       "addr1":"(16229) 경기도 수원시 영통구광교로 105 경기R&DB센터 705호", 
        //       "addr2":"", 
        //       "email":"dslim17@intellicode.co.kr", 
        //       "homepage":"http://goldenplanet.co.kr",
        //       "etc1":"test용", 
        //       "etc2":"", 
        //       "mailingDate":"2019-12-29 19:48:08", 
        //       "subscriptionDate":"1577616544" ,
            
        //     },
        //     {
        //       "userId":"dslim", 
        //       "userCode":"LGEKR", 
        //       "product":"all", 
        //       "first_name":"대선18", 
        //       "last_name":"임18", 
        //       "company":"intellicode", 
        //       "rank":"데이터 서비스 사업부 /부장", 
        //       "hp":"010.7402.0722", 
        //       "tel":"031 252.9127", 
        //       "fax":"031.629.7826",                    
        //       "addr1":"(16229) 경기도 수원시 영통구광교로 105 경기R&DB센터 705호", 
        //       "addr2":"", 
        //       "email":"dslim18@intellicode.co.kr", 
        //       "homepage":"http://goldenplanet.co.kr",
        //       "etc1":"test용", 
        //       "etc2":"", 
        //       "mailingDate":"2019-12-29 19:48:08", 
        //       "subscriptionDate":"1577616544" ,
            
        //     }
        //   ]
     
    console.log(req.body);
    var data =  converters.bscard(req.body);
    console.log(data);
    var result_count = 0;
    var result_list = [];

    for(var i = 0 ; data.length > i ; i++){
    await bscard_eloqua.data.contacts.create( data[i] ).then((result) => {
        console.log(result.data);
        // res.json(result.data);
        result_list.push({
            email : data[i].emailAddress,
            status : 200 ,
            message : "success"
        });
        result_count++;
    }).catch((err) => {
        console.log(err.response.status);
        console.log(err.response.statusText);
        result_list.push({
            email : data[i].emailAddress,
            status : err.response.status ? err.response.status : "ETC Error",
            message : err.response.statusText ? err.response.statusText : "UnknownTest Error"
        });
    });

    }

    console.log("send_data count : " + data.length + "  ::: result_count : " + result_count );
    if(result_list.length > 0) res.json(result_list);
    else res.json(false);
    
    
});

router.put('/update/', async function (req, res, next) {

  
    console.log("update_call");
    // console.log(req.body);
    var bs_data = await mappedContacts(req.body , "partial");
    // console.log(1);
    // console.log(bs_data);

    bs_data =  converters.bscard(bs_data);
    console.log(2);
    console.log(bs_data);
    
    var result_count = 0;
    var result_list = [];

    
    
    for(var i = 0 ; bs_data.length > i ; i++){
        console.log(bs_data[i].id)
        var id = bs_data[i].id;
        // delete  bs_data[i].eloqua_id;
        console.log("update send_data");
        console.log(bs_data[i]);
        await bscard_eloqua.data.contacts.update( id, bs_data[i] ).then((result) => {
            console.log(result.data);
            // res.json(result.data);
            result_list.push({
                email : bs_data[i].emailAddress,
                status : 200 ,
                message : "success"
            });
            result_count++;
        }).catch((err) => {
            console.log(err.response.status);
            console.log(err.response.statusText);
            if(bs_data[i].id){
                result_list.push({
                    email : bs_data[i].emailAddress,
                    status : err.response.status ? err.response.status : "ETC Error",
                    message : err.response.statusText ? err.response.statusText : "Unknown Error"
                });
            }else{
                result_list.push({
                    email : bs_data[i].emailAddress,
                    status : "500" ,
                    message : "Not Found Eloqua Data for Update "
                });
            }
           
        });
    }

    console.log("update_data count : " + bs_data.length + "  ::: update_count : " + result_count );
    if(result_list.length > 0) res.json(result_list);
    else res.json(false);
});

router.delete('/delete', async function (req, res, next) {
    var email_list = [];
    email_list = req.body.email_list;
    var delete_data = [];
    for(var i = 0 ; email_list.length > i; i++){
        delete_data.push({
            email : email_list[i]
        })
    }
    
    delete_data = await mappedContacts(delete_data , "partial");
    // console.log(delete_data);
    
  
    var result_list = [];
    for (var i =0; delete_data.length > i ; i++){
        console.log(delete_data[i]);
        
        await bscard_eloqua.data.contacts.delete(delete_data[i].id).then((result) => {
            // console.log(result);
          
            result_list.push({
                email : delete_data[i].email,
                status : 200 ,
                message : "success"
            });
        }).catch((err) => {
            console.log("delete error");
            console.log(err);
            if(!delete_data[i].id) {
                result_list.push({
                    email : delete_data[i].email,
                    status : "500" ,
                    message : "Not Found Eloqua Data for Delete "
                });
                
            }else{
                result_list.push({
                    email : delete_data[i].email,
                    status : err.response.status ? err.response.status : "ETC Error",
                    message : err.response.statusText ? err.response.statusText : "Unknown Error"
                });
            }
           
        });
        
    }

    if(result_list.length > 0) res.json(result_list);
    else res.json(false);
    
});

router.get('/test', async function (req, res, next) {
    var test = [
        {
            "type": "FieldValue",
            "id": "100005"
        },
        {
            "type": "FieldValue",
            "id": "100017"
        },
        {
            "type": "FieldValue",
            "id": "100023"
        },
        {
            "type": "FieldValue",
            "id": "100024"
        },
        {
            "type": "FieldValue",
            "id": "100032",
            "value": "CLGEL000000000950"
        },
        {
            "type": "FieldValue",
            "id": "100033"
        },
        {
            "type": "FieldValue",
            "id": "100034"
        },
        {
            "type": "FieldValue",
            "id": "100035"
        },
        {
            "type": "FieldValue",
            "id": "100036"
        },
        {
            "type": "FieldValue",
            "id": "100041"
        },
        {
            "type": "FieldValue",
            "id": "100043"
        },
        {
            "type": "FieldValue",
            "id": "100044"
        },
        {
            "type": "FieldValue",
            "id": "100045"
        },
        {
            "type": "FieldValue",
            "id": "100046"
        },
        {
            "type": "FieldValue",
            "id": "100047"
        },
        {
            "type": "FieldValue",
            "id": "100048"
        },
        {
            "type": "FieldValue",
            "id": "100049"
        },
        {
            "type": "FieldValue",
            "id": "100051"
        },
        {
            "type": "FieldValue",
            "id": "100065"
        },
        {
            "type": "FieldValue",
            "id": "100066"
        },
        {
            "type": "FieldValue",
            "id": "100068"
        },
        {
            "type": "FieldValue",
            "id": "100069"
        },
        {
            "type": "FieldValue",
            "id": "100072"
        },
        {
            "type": "FieldValue",
            "id": "100081"
        },
        {
            "type": "FieldValue",
            "id": "100171",
            "value": "intellicode.co.kr"
        },
        {
            "type": "FieldValue",
            "id": "100172",
            "value": "대선 11 임 11"
        },
        {
            "type": "FieldValue",
            "id": "100174"
        },
        {
            "type": "FieldValue",
            "id": "100175"
        },
        {
            "type": "FieldValue",
            "id": "100176"
        },
        {
            "type": "FieldValue",
            "id": "100177"
        },
        {
            "type": "FieldValue",
            "id": "100178"
        },
        {
            "type": "FieldValue",
            "id": "100179"
        },
        {
            "type": "FieldValue",
            "id": "100180"
        },
        {
            "type": "FieldValue",
            "id": "100184"
        },
        {
            "type": "FieldValue",
            "id": "100187"
        },
        {
            "type": "FieldValue",
            "id": "100188"
        },
        {
            "type": "FieldValue",
            "id": "100189"
        },
        {
            "type": "FieldValue",
            "id": "100190"
        },
        {
            "type": "FieldValue",
            "id": "100191"
        },
        {
            "type": "FieldValue",
            "id": "100192"
        },
        {
            "type": "FieldValue",
            "id": "100193"
        },
        {
            "type": "FieldValue",
            "id": "100194",
            "value": "dslimL888SD"
        },
        {
            "type": "FieldValue",
            "id": "100195"
        },
        {
            "type": "FieldValue",
            "id": "100196",
            "value": "LGEKR 11"
        },
        {
            "type": "FieldValue",
            "id": "100197"
        },
        {
            "type": "FieldValue",
            "id": "100199"
        },
        {
            "type": "FieldValue",
            "id": "100200"
        },
        {
            "type": "FieldValue",
            "id": "100201"
        },
        {
            "type": "FieldValue",
            "id": "100202"
        },
        {
            "type": "FieldValue",
            "id": "100203"
        },
        {
            "type": "FieldValue",
            "id": "100205"
        },
        {
            "type": "FieldValue",
            "id": "100206"
        },
        {
            "type": "FieldValue",
            "id": "100208"
        },
        {
            "type": "FieldValue",
            "id": "100209"
        },
        {
            "type": "FieldValue",
            "id": "100210",
            "value": "No"
        },
        {
            "type": "FieldValue",
            "id": "100211",
            "value": "No"
        },
        {
            "type": "FieldValue",
            "id": "100212",
            "value": "No"
        },
        {
            "type": "FieldValue",
            "id": "100213",
            "value": "No"
        },
        {
            "type": "FieldValue",
            "id": "100214"
        },
        {
            "type": "FieldValue",
            "id": "100215"
        },
        {
            "type": "FieldValue",
            "id": "100216"
        },
        {
            "type": "FieldValue",
            "id": "100218"
        },
        {
            "type": "FieldValue",
            "id": "100219"
        },
        {
            "type": "FieldValue",
            "id": "100220"
        },
        {
            "type": "FieldValue",
            "id": "100221"
        },
        {
            "type": "FieldValue",
            "id": "100222"
        },
        {
            "type": "FieldValue",
            "id": "100223"
        },
        {
            "type": "FieldValue",
            "id": "100224"
        },
        {
            "type": "FieldValue",
            "id": "100225"
        },
        {
            "type": "FieldValue",
            "id": "100226"
        },
        {
            "type": "FieldValue",
            "id": "100227"
        },
        {
            "type": "FieldValue",
            "id": "100228"
        },
        {
            "type": "FieldValue",
            "id": "100229",
            "value": "all 11"
        },
        {
            "type": "FieldValue",
            "id": "100230"
        },
        {
            "type": "FieldValue",
            "id": "100231"
        },
        {
            "type": "FieldValue",
            "id": "100232"
        },
        {
            "type": "FieldValue",
            "id": "100233"
        },
        {
            "type": "FieldValue",
            "id": "100234"
        },
        {
            "type": "FieldValue",
            "id": "100235"
        },
        {
            "type": "FieldValue",
            "id": "100236"
        },
        {
            "type": "FieldValue",
            "id": "100237"
        },
        {
            "type": "FieldValue",
            "id": "100238",
            "value": "데이터 서비스 사업부 /부장 11"
        },
        {
            "type": "FieldValue",
            "id": "100239"
        },
        {
            "type": "FieldValue",
            "id": "100240"
        },
        {
            "type": "FieldValue",
            "id": "100241"
        },
        {
            "type": "FieldValue",
            "id": "100242"
        },
        {
            "type": "FieldValue",
            "id": "100243"
        },
        {
            "type": "FieldValue",
            "id": "100244"
        },
        {
            "type": "FieldValue",
            "id": "100245"
        },
        {
            "type": "FieldValue",
            "id": "100246"
        },
        {
            "type": "FieldValue",
            "id": "100247"
        },
        {
            "type": "FieldValue",
            "id": "100248"
        },
        {
            "type": "FieldValue",
            "id": "100249"
        },
        {
            "type": "FieldValue",
            "id": "100250"
        },
        {
            "type": "FieldValue",
            "id": "100251"
        },
        {
            "type": "FieldValue",
            "id": "100252",
            "value": "http://goldenplanet.co.kr 11"
        },
        {
            "type": "FieldValue",
            "id": "100253"
        },
        {
            "type": "FieldValue",
            "id": "100254"
        },
        {
            "type": "FieldValue",
            "id": "100255"
        },
        {
            "type": "FieldValue",
            "id": "100256"
        },
        {
            "type": "FieldValue",
            "id": "100257"
        },
        {
            "type": "FieldValue",
            "id": "100258"
        },
        {
            "type": "FieldValue",
            "id": "100259"
        },
        {
            "type": "FieldValue",
            "id": "100260"
        },
        {
            "type": "FieldValue",
            "id": "100261"
        },
        {
            "type": "FieldValue",
            "id": "100262"
        },
        {
            "type": "FieldValue",
            "id": "100263"
        },
        {
            "type": "FieldValue",
            "id": "100264"
        },
        {
            "type": "FieldValue",
            "id": "100265"
        },
        {
            "type": "FieldValue",
            "id": "100266"
        },
        {
            "type": "FieldValue",
            "id": "100267"
        },
        {
            "type": "FieldValue",
            "id": "100268"
        },
        {
            "type": "FieldValue",
            "id": "100269"
        },
        {
            "type": "FieldValue",
            "id": "100270"
        },
        {
            "type": "FieldValue",
            "id": "100271"
        },
        {
            "type": "FieldValue",
            "id": "100272"
        },
        {
            "type": "FieldValue",
            "id": "100273"
        },
        {
            "type": "FieldValue",
            "id": "100274"
        },
        {
            "type": "FieldValue",
            "id": "100275"
        },
        {
            "type": "FieldValue",
            "id": "100276"
        },
        {
            "type": "FieldValue",
            "id": "100277"
        },
        {
            "type": "FieldValue",
            "id": "100278"
        },
        {
            "type": "FieldValue",
            "id": "100279"
        },
        {
            "type": "FieldValue",
            "id": "100280"
        },
        {
            "type": "FieldValue",
            "id": "100281"
        },
        {
            "type": "FieldValue",
            "id": "100282"
        },
        {
            "type": "FieldValue",
            "id": "100283"
        },
        {
            "type": "FieldValue",
            "id": "100284"
        },
        {
            "type": "FieldValue",
            "id": "100285"
        },
        {
            "type": "FieldValue",
            "id": "100286"
        },
        {
            "type": "FieldValue",
            "id": "100287"
        },
        {
            "type": "FieldValue",
            "id": "100288"
        },
        {
            "type": "FieldValue",
            "id": "100289"
        },
        {
            "type": "FieldValue",
            "id": "100290"
        },
        {
            "type": "FieldValue",
            "id": "100291"
        },
        {
            "type": "FieldValue",
            "id": "100292"
        },
        {
            "type": "FieldValue",
            "id": "100293"
        },
        {
            "type": "FieldValue",
            "id": "100294"
        },
        {
            "type": "FieldValue",
            "id": "100295"
        },
        {
            "type": "FieldValue",
            "id": "100296"
        },
        {
            "type": "FieldValue",
            "id": "100297"
        },
        {
            "type": "FieldValue",
            "id": "100298"
        },
        {
            "type": "FieldValue",
            "id": "100299"
        },
        {
            "type": "FieldValue",
            "id": "100300"
        },
        {
            "type": "FieldValue",
            "id": "100301"
        },
        {
            "type": "FieldValue",
            "id": "100302"
        },
        {
            "type": "FieldValue",
            "id": "100303"
        },
        {
            "type": "FieldValue",
            "id": "100304"
        },
        {
            "type": "FieldValue",
            "id": "100305",
            "value": "No"
        },
        {
            "type": "FieldValue",
            "id": "100306"
        }
    ]

    console.log(test.length);
});


module.exports = router;
