const { json } = require('express');
var express = require('express');
var router = express.Router();
var converters = require('../../common/converters');
var utils = require('../../common/utils');

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
        if(bs_data.length > 1 ) emailString += "emailAddress='" + bs_data[i].email + "'";
        else emailString += "emailAddress=" + bs_data[i].email + "";

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

router.get('/search_one/:id', function (req, res, next) {
    var queryString = {
        depth : "complete"
    }  ;


    console.log(req.params.id);
    
    bscard_eloqua.data.contacts.getOne( req.params.id, queryString).then((result) => {
        console.log(result.data);
        res.json(result.data);
        // res.json(true);
    }).catch((err) => {
        console.error(err);
        res.json(false);
    });
});

router.post('/search_ids', function (req, res, next) {
    var queryString = {
        ids : req.body.ids,
        depth : req.body.depth ? req.body.depth : "complete"
    }  ;

    bscard_eloqua.data.contacts.getMulti( queryString).then((result) => {
        console.log(result.data);
        res.json(result.data);
        // res.json(true);
    }).catch((err) => {
        console.error(err);
        res.json(false);
    });
});

function BS_CARD_ENTITY() {

    this.id = "";
    this.salesPerson = "";      // 판매원 ID
    this.firstName = "";        // 이름
    this.lastName = "";		    // 성
    this.accountName = "";      // 회사명
    this.mobilePhone = "";      // 핸드폰 번호
    this.businessPhone = "";    // 비지니스용 연락처
    this.fax = "";              // 팩스번호
    this.address1 = "";         // 주소1
    this.address2 = "";         // 주소2
    this.emailAddress = "";     // 이메일


    this.fieldValues = [];      // Custom Field List 
    
    
  }

function Convert_BS_CARD_DATA(body_data) {

    var items = body_data;
    var result_data = [];

    for(var i = 0 ; items.length > i ; i++){

        var bs_card_data = new BS_CARD_ENTITY();
        var item = items[i];

        try
        {
            bs_card_data.id = item.id;              // update 와 delete 의 데이터 처리를 위해 Eloqua 의 id값
            bs_card_data.salesPerson = item.userId; //"userId": "jbpark",
    
            var userCode = { "id": "100196", "value": item.userCode }; //100196 Subsidiary custom field//"userCode": "LGEVU",
            bs_card_data.fieldValues.push(userCode);
        
            var product_data = { "id": "100229", "value": item.product }; //"product": "IT_B2B_Cloud", | Eloqua 필드 없음 | 사업부별 인지 확인 필요
            bs_card_data.fieldValues.push(product_data);
            
            bs_card_data.firstName = item.firstName; //"firstName": "진범",
            bs_card_data.lastName = item.lastName; //"lastName": "박",
            bs_card_data.accountname = item.company; //"company": "인텔리코드",
        
            //ba_card_data.? = item.rank; //"rank": "이사/MBA", | Eloqua 필드 정보 없음 _ job title 예상
        
            bs_card_data.mobilePhone = item.hp; //"hp": "010.9241.9080",
            bs_card_data.businessPhone = item.tel; //"tel": "03q.252.9127",
            bs_card_data.fax = item.fax; //"fax": "fax11",
            bs_card_data.address1 = item.addr1; //"addr1": "수원시 영통구",
            bs_card_data.address2 = item.addr2; //"addr2": "서초구 양재",
            bs_card_data.emailAddress = item.email; //"email": "jbpark@intellicode.co.kr",
        
            var website_data = { "id": "100252", "value": item.homepage };
            bs_card_data.fieldValues.push(website_data);
        
            // bs_card_data.description = item.etc1; //"etc1": "메모 남김"  | Eloqua 필드 없음
        
            //"mailingDate": "2021-01-30 19:10:15", | Eloqua 필드 없음
            bs_card_data.subscriptionDate = utils.timeConverter("GET_UNIX",  item.subscriptionDate); //"subscriptionDate": "2021-01-30 19:11:22",
            //"campaignName": "",  | Eloqua 필드 없음
            //"campaignDate": "2031-01-01 00:00:00", | Eloqua 필드 없음
            //"customerProduct": "as", | 박진범 이사님 Product 값이 AS , ID , IT , CLS , CM , Solor , Solution 값이 전부 인지 확인 필요 
            //"krMkt": "N", | Eloqua 필드값 확인 필요 | Eloqua 필드 없음
            bs_card_data.country = item.country; // "country": "Netherlands Antilles",
        
            // var updateDt_data = { "id": "", "value": item.updateDate }; "2031-01-01 00:00:00", | Eloqua 필드 없음
            // bs_card_data.fieldValues.push(updateDt_data);  
            result_data.push(bs_card_data);
        }
        catch(e)
        {
            console.log(e);
        }
    }
    return result_data;
}

router.post('/create', async function (req, res, next) {

    console.log("create call");
    //body 예시
    // req.body =   {
    //"userId": "jbpark",
    //"userCode": "LGEVU",
    //"product": "IT_B2B_Cloud",
    //"firstName": "진범",
    //"lastName": "박",
    //"company": "인텔리코드",
    //"rank": "이사/MBA",
    //"hp": "010.9241.9080",
    //"tel": "03q.252.9127",
    //"fax": "fax11",
    //"addr1": "수원시 영통구",
    //"addr2": "서초구 양재",
    //"email": "jbpark@intellicode.co.kr",
    //"homepage": "",
    //"etc1": "메모 남김",
    //"mailingDate": "2021-01-30 19:10:15",
    //"subscriptionDate": "2021-01-30 19:11:22",
    //"campaignName": "",
    //"campaignDate": "2031-01-01 00:00:00",
    //"customerProduct": "as",
    //"krMkt": "N",
    //"country": "Netherlands Antilles",
    //"updatedDate": "2021-02-01 10:26:01"
    //}
    var data = Convert_BS_CARD_DATA(req.body);

    console.log(data);
    console.log(typeof(data));

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
            console.log(data[i].fieldValues);
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

    console.log("total count : " + data.length + "  ::: success_count : " + success_count + "  ::: failed_count : " + failed_count );
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

    bs_data =  Convert_BS_CARD_DATA(bs_data);
    console.log(2);
    console.log(bs_data);
    
  


    var form = {};
    var success_count = 0;
    var failed_count = 0;
    var result_list = [];
    
    console.log("bs_data.length");
    console.log(bs_data.length);
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

router.post('/specific_search', async function (req, res, next) {
    var queryString = {}  ;

    // var id = getContacts(email , "minimal");
    var queryString = {};
    var query_list = [];
    query_list = req.body.items;
    
    console.log(query_list);
    var depth =  req.body.depth;
    var search_text = "";
    for(var i = 0; query_list.length > i ; i++){
        var item = query_list[i];
        console.log(item);
        search_text += item.field + item.operator + "'" + item.value + "'";
    }
    queryString['search'] = search_text;
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

// time convert 테스트
router.get('/test2', async function (req, res, next) {
    //ex date = 2019-12-29 19:48:08
    //ex unix =  1577616544
    // console.log(utils.timeConverter("GET_UNIX", "2019-12-29 19:48:08"));
    console.log(utils.timeConverter("GET_DATE", 1577616544));
});

// eloqua api를 통한 create 나 update 시 유효한 이름을 찾기위함
router.get('/test3', async function (req, res, next) {
    var yesterday_Object = utils.yesterday_getDateTime();
    var today_Object = utils.today_getDateTime();
    console.log(yesterday_Object);
});

module.exports = router;