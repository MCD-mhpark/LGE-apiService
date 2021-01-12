const { json } = require('express');
var express = require('express');
var router = express.Router();
var converters = require('../../common/converters');

//하나의 이메일 검색값으로 여러 contacts id를 조회 
// 조회순서에 따른 데이터는 보장되지 않는다 (ex labeltest_2 , labeltest_1로 조회했을 경우 결과값이 labeltest_1, labeltest_2로 나옴)
async function getContacts(data_list, depth ){
    
    var queryString = {};
    var emailString = "";
    var email_list = [];
    if(data_list){
        email_list = data_list;
        emailString += "?";
    } 
    for(var i = 0 ; email_list.length > i ; i++ ){
        emailString += "emailAddress='" + email_list[i] + "'";
    }
    queryString['search'] = emailString ;
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
     

    var data =  converters.bscard(req.body);

    var form = {};
    var success_count = 0;
    var failed_count = 0;
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
        success_count++;
    }).catch((err) => {
        console.log(err.response.status);
        console.log(err.response.statusText);
        result_list.push({
            email : data[i].emailAddress,
            status : err.response.status ? err.response.status : "ETC Error",
            message : err.response.statusText ? err.response.statusText : "UnknownTest Error"
        });
        failed_count++;
    });

    }

    console.log("total count : " + data.length + "  ::: success_count : " + success_count + "  ::: failed_count : " + success_count );
    form.total = data.length;
    form.success_count = success_count;
    form.failed_count = failed_count;
    form.result_list = result_list;
 
    res.json(form);
    
    
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
    
   

    var form = {};
    var success_count = 0;
    var failed_count = 0;
    var result_list = [];
    
    
    for(var i = 0 ; bs_data.length > i ; i++){
        console.log(bs_data[i].id)
        var id = bs_data[i].id;
        
        await bscard_eloqua.data.contacts.update( id, bs_data[i] ).then((result) => {
            console.log(result.data);
            // res.json(result.data);
            result_list.push({
                email : bs_data[i].emailAddress,
                status : 200 ,
                message : "success"
            });

            success_count++;
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

            failed_count++;
           
        });
    }

    console.log("total count : " + bs_data.length + "  ::: success_count : " + success_count + "  ::: failed_count : " + success_count );
    form.total = bs_data.length;
    form.success_count = success_count;
    form.failed_count = failed_count;
    form.result_list = result_list;
 
    res.json(form);

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
    
    var form = {};
    var success_count = 0;
    var failed_count = 0;

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
            success_count++;
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
            failed_count++;
           
        });
        
    }

    console.log("total count : " + delete_data.length + "  ::: success_count : " + success_count + "  ::: failed_count : " + success_count );
    form.total = delete_data.length;
    form.success_count = success_count;
    form.failed_count = failed_count;
    form.result_list = result_list;
 
    res.json(form);
    
});

router.post('/test', async function (req, res, next) {
    var queryString = {}  ;

    // var id = getContacts(email , "minimal");
    var queryString = {};
    var field = req.body.field;
    var operator = req.body.operator;
    var values =  req.body.values;
    var depth =  req.body.depth;
    
    queryString['search'] = "?firstName='" + values + "'";
    queryString['depth'] = depth ? depth : "";

    console.log(queryString);
    bscard_eloqua.data.contacts.get(  queryString).then((result) => {
        console.log(result.data);
        res.json(result.data);
        // res.json(true);
    }).catch((err) => {
        console.error(err);
        res.json(false);
    });


});


module.exports = router;
