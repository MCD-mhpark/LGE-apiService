const { json } = require('express');
var express = require('express');
var router = express.Router();
var converters = require('../../common/converters');
var utils = require('../../common/utils');
var fs 		= require("mz/fs");
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

    // console.log(queryString);
    var contacts_data ;
    await bscard_eloqua.data.contacts.get(queryString).then((result) => { 
        // console.log(result.data);
        // console.log(result.data.total);
        
        if(result.data.total && result.data.total > 0 ){
            contacts_data = result.data;
            // console.log(contacts_data);
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
        // console.log(result.data);
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


async function origin_mappedContacts(bs_data, depth){
    
    var queryString = {};
    var emailString = "?";
    for(var i = 0 ; bs_data.length > i ; i++ ){
        if(bs_data.length > 1 ) emailString += "emailAddress='" + bs_data[i].emailAddress + "'";
        else emailString += "emailAddress=" + bs_data[i].email + "";
    }
    

    queryString['search'] = emailString;
    queryString['depth'] = depth ? depth : "";
    console.log(queryString);

    await bscard_eloqua.data.contacts.get(queryString).then((result) => { 
        // console.log(result.data);
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

function GetDataValue(contacts_fieldvalue) {
    try {
      if (contacts_fieldvalue != undefined) {
        return contacts_fieldvalue;
      }
      else {
        return "";
      }
    }
    catch (e) {
      console.log(e);
      return "";
    }
  }



//이메일 배열 값으로 여러 contacts id를 조회
router.post('/search_all', async function (req, res, next) {
    // emails 예제 ["jtlim1@goldenplanet.co.kr" , "jtlim2@goldenplanet.co.kr" .. ]
    var email_list =  req.body.email_list;
    var depth = req.body.depth;
    var contacts_data = await getContacts(email_list , depth );

    var convert_data = await Convert_BS_CARD_DATA_SEARCH(contacts_data);

    // if(req.body.fileRecord){
    //     fs.writeFile(__dirname + "/request_search_all_80-125"  + ".txt", JSON.stringify(contacts_data), 'utf8', function(error){ 
    //         if(error) {
    //             console.log(err);
    //         }else{
    //             console.log('write end') ;
    //         }
            
    //     });
    // }

    if(convert_data && convert_data.total > 0) res.json(convert_data);
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

router.post('/search_origin', function (req, res, next) {
    
     
    var queryString = {};
    var emailString = "";
    var email_list = [];
    var depth = req.body.depth;
    if(req.body.email_list){
        email_list = req.body.email_list;
        emailString += "?";
    } 
    for(var i = 0 ; email_list.length > i ; i++ ){
        emailString += "emailAddress='" + email_list[i] + "'";
    }
    queryString['search'] = emailString ;
    queryString['depth'] = depth ? depth : "";

    console.log(queryString);
    
    bscard_eloqua.data.contacts.get( queryString).then((result) => {
        console.log(result.data);
        res.json(result.data);
        // res.json(true);
    }).catch((err) => {
        console.error(err);
        res.json(false);
    });
});


function BS_CARD_SEARCH_ENTITY(){          
                                    // 숫자 + 영문 조합이면 Customfield , 영문만 있을 경우 BasicField
    this.userId = "";               // salsePerson 값
    this.userCode = "";             // 100196 Subsidiary 
    this.product = "";              // 100229 Business Unit
    this.firstName = "";            // firstName
    this.lastName = "";             // lastName
    this.company = "";              // accountname 
    this.rank = "";                 // 100292 Job Title
    this.hp = "";                   // mobilePhone
    this.tel = "";                  // businessPhone
    this.fax = "";                  // fax
    this.addr1 = "";                // address1
    this.addr2 = "";                // address2
    this.email = "";                // emailAddress
    this.homepage = "";             // 100252 Website
    this.etc1 = "";                 // No Field
    this.mailingDate = "";          // No Field
    this.subscriptionDate = "";     // No Field
    this.campaignName = "";         // No Field
    this.campaignDate = "";         // No Field
    this.customerProduct = "";      // No Field
    this.country = "";              // country
    this.krMkt = "";                // No Field
    this.updateDate = "";           // No Field

   
}

function BS_CARD_INS_UPD_ENTITY() {

    this.id = "";
    this.salesPerson = "";          // 판매원 ID
    this.firstName = "";            // 이름
    this.lastName = "";		        // 성
    this.accountName = "";          // 회사명
    this.mobilePhone = "";          // 핸드폰 번호
    this.businessPhone = "";        // 비지니스용 연락처
    this.fax = "";                  // 팩스번호
    this.address1 = "";             // 주소1
    this.address2 = "";             // 주소2
    this.emailAddress = "";         // 이메일

    this.etc1 = "";                 // No Field
    this.mailingDate = "";          // No Field
    this.subscriptionDate = "";     // No Field
    this.campaignName = "";         // No Field
    this.campaignDate = "";         // No Field
    this.customerProduct = "";      // No Field
    this.country = "";              // country
    this.krMkt = "";                // No Field
    this.updateDate = "";           // No Field
   

    this.fieldValues = [];      // Custom Field List 
    
    
  }

function getBuniessUnit(fieldValues){
    let Business_Unit = "";
    if(fieldValues){
        for(var j =0 ; fieldValues.length > j ; j++){
            let id = fieldValues[j].id ;
            let value = fieldValues[j].value ;
        
            if( id == '100229' ) {
                console.log(id);
                Business_Unit = value;
            }
        }
    }
    
    return Business_Unit;
}

async function Convert_BS_CARD_DATA_SEARCH(body_data){
    

    var result_data = {};
    var result_list = [];
    
    if(body_data){
        for(var i = 0 ; body_data.elements.length > i ; i++){
            // 명함앱의 필드중 엘로콰에서 기본필드를 명함앱으로 역매핑

            var dataObject = {};
            var items = body_data.elements[i];
            var fieldValues = items.fieldValues;
            
            
            dataObject.id = GetDataValue(body_data.elements[i].id);
            dataObject.userId = GetDataValue(body_data.elements[i].salesPerson);
            dataObject.firstName = GetDataValue(body_data.elements[i].firstName);
            dataObject.lastName = GetDataValue(body_data.elements[i].lastName);
            dataObject.company = GetDataValue(body_data.elements[i].accountName);
            dataObject.hp = GetDataValue(body_data.elements[i].mobilePhone);
            dataObject.tel = GetDataValue(body_data.elements[i].businessPhone);
            dataObject.fax = GetDataValue(body_data.elements[i].fax);
            dataObject.addr1 = GetDataValue(body_data.elements[i].address1);
            dataObject.addr2 = GetDataValue(body_data.elements[i].address2);
            dataObject.email = GetDataValue(body_data.elements[i].emailAddress);
            let country = GetDataValue(body_data.elements[i].country);
            if( GetDataValue(body_data.elements[i].country) === 'UAE' ) country = 'U.A.E';
            dataObject.country = country;
            dataObject.updateDate = GetDataValue(utils.timeConverter("GET_DATE" , body_data.elements[i].updatedAt));
       
 
         
            var krMkt = "";
            console.log(fieldValues);
            let Business_Unit = await getBuniessUnit(fieldValues);

            if(Business_Unit) krMkt = "N";
            else krMkt = "Y";

            console.log("Business_Unit : " + Business_Unit);
            console.log("krMkt : " + krMkt);

            dataObject.krMkt = krMkt;
            // console.log(fieldValues.length);
            if(fieldValues){
                for(var k =0 ; fieldValues.length > k ; k++){
                    // console.log(fieldValues[j].id);
                    var id = fieldValues[k].id ;
                    var value = fieldValues[k].value ;

                    // 한영본 데이터 조회
                    if(krMkt == 'Y'){
                        switch(id){
                            case "100365" : 
                                dataObject.etc1 = GetDataValue(value);
                                break;
                            case "100196" : 
                                if(value == 'N/A') value = value.replace("N/A" , "");
                                dataObject.userCode = GetDataValue(value ? "LGE" + value : null );
                                break;
                            case "100229" : dataObject.product = GetDataValue(value); break;
                            case "100292" : dataObject.rank = GetDataValue(value); break;
                            case "100252" : dataObject.homepage = GetDataValue(value) ; break;
                            case "100203" : 
                                if(GetDataValue(value)) {
                                    dataObject.campaignName = GetDataValue(value).split("|")[0];
                                    dataObject.campaignDate = GetDataValue(value).split("|")[1];
                                }
                                break;
                            case "100319" : dataObject.mailingDate = utils.timeConverter("GET_DATE" , GetDataValue(value)) ; break;
                            case "100320" : dataObject.subscriptionDate = utils.timeConverter("GET_DATE" , GetDataValue(value)) ; break;
                            case "100311" : dataObject.customerProduct =  GetDataValue(value) ; break;
                          
                        }  
                    }else{
                        switch(id){
                            // dataObject.mailingDate = GetDataValue("Eloqua Not Make Field");
                            // dataObject.subscriptionDate = GetDataValue("Eloqua Not Make Field");
                            // dataObject.campaignName = GetDataValue("Eloqua Not Make Field");
                            // dataObject.campaignDate = GetDataValue("Eloqua Not Make Field");
                            // dataObject.customerProduct = GetDataValue("Eloqua Not Make Field");
                            // dataObject.country = GetDataValue(body_data.elements[i].country);
                            // dataObject.krMkt = GetDataValue("Eloqua Not Make Field");
                            // dataObject.updateDate = GetDataValue("Eloqua Not Make Field");
                            case "100365" : 
                                dataObject.etc1 = GetDataValue(value);
                                break;
                            case "100196" : 
                                if(value == 'N/A') value = value.replace("N/A" , "");
                                dataObject.userCode = GetDataValue(value ? "LGE" + value : null );
                                break;
                            case "100229" : dataObject.product = GetDataValue(value); break;
                            case "100292" : dataObject.rank = GetDataValue(value); break;
                            case "100252" : dataObject.homepage = GetDataValue(value) ; break;
                            case "100203" : 
                                if(GetDataValue(value)) {
                                    dataObject.campaignName = GetDataValue(value).split("|")[0];
                                    dataObject.campaignDate = GetDataValue(value).split("|")[1];
                                }
                                break;
                            
                            case "100200" : dataObject.mailingDate = utils.timeConverter("GET_DATE" , GetDataValue(value)) ; break;
                            case "100199" : dataObject.subscriptionDate = utils.timeConverter("GET_DATE" , GetDataValue(value)) ; break;
                            case "100366" : dataObject.customerProduct =  GetDataValue(value) ; break;
                            
                            
                        }
                    }
                      
                }        
                // delete items.fieldValues;
                result_list.push(dataObject);
            
            }
            
            result_data = {"elements" : result_list };
            result_data.page = body_data.page;
            result_data.pageSize = body_data.pageSize;
            result_data.total = body_data.total;
        }
    }

    
    return result_data;
}

function Convert_BS_CARD_DATA(body_data , status) {

    var items = body_data;
    var result_data = [];

    for(var i = 0 ; items.length > i ; i++){

        var bs_card_data = new BS_CARD_INS_UPD_ENTITY();
        var item = items[i];

        try
        {
            bs_card_data.id = item.id;              // update 와 delete 의 데이터 처리를 위해 Eloqua 의 id값
            bs_card_data.salesPerson = item.userId; //"userId": "jbpark",
    
     		
        
			
            
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
            
            if(status == 'update') bs_card_data.isSubscribed = true;
            bs_card_data.fieldValues.push( { "id": "100252", "value": item.homepage });
            bs_card_data.fieldValues.push( { "id": "100292", "value": item.rank });
            bs_card_data.fieldValues.push( { "id": "100202", "value": "LBCS" });
            
            
            bs_card_data.country = item.country; // "country": "Netherlands Antilles",
        
            // LBCS_memo || etc1 || 100365
            bs_card_data.fieldValues.push( { "id": "100365", "value": item.etc1  });

            // Marketing Event || Campagin Name_ Campagin Date 조합 || 100203
            bs_card_data.fieldValues.push( { "id": "100203", "value": item.campaignName + "|" + item.campaignDate  });

            // product |  Business Unit || 100229
            bs_card_data.fieldValues.push({ "id": "100229", "value": item.product }); 
            
            
            if(item.krMkt == 'Y'){
                

                if(status === "create"){
                    //들어온 값이 없어도 자동으로 업데이트 해야하는 동의 여부 및 동의 날짜 필드
                    // KR_Privacy Policy_Optin || 한영본 메일 발송 동의 여부 || 100318
                    bs_card_data.fieldValues.push( { "id": "100318", "value": "Yes" });
                    // KR_Privacy Policy_Optin_Date || 한영본 메일 발송 동의 여부 날짜 || 100319
                    bs_card_data.fieldValues.push( { "id": "100319", "value": utils.timeConverter("GET_UNIX" , item.mailingDate) });
     
                    // KR_Privacy Policy_Collection and Usage || 한영본 개인정보 수집 동의 여부 || 100315
                    bs_card_data.fieldValues.push( { "id": "100315", "value": "Yes" });
                    // KR_Privacy Policy_Collection and Usage_AgreedDate || 한영본 개인정보 수집 동의 날짜 || 100320
                    bs_card_data.fieldValues.push( { "id": "100320", "value": utils.timeConverter("GET_UNIX" , item.subscriptionDate) });
                    // KR_Privacy Policy_Consignment of PI || (현재 동의여부 필드만 있고, 데이트 관련 필드 없음) || 100316
                    bs_card_data.fieldValues.push( { "id": "100316", "value": "Yes" });
                    // KR_Privacy Policy_Transfer PI Aborad || (현재 동의여부 필드만 있고, 데이트 관련 필드 없음) || 100317
                    bs_card_data.fieldValues.push( { "id": "100317", "value": "Yes" });
                }
                //100196 Subsidiary custom field//"userCode": "LGEVU"
                // krMkt Y인 경우 Subsidiary를 KR로 찍고 N인 경우 Global 이기에 Country 값을 봐도 되기 떄문에 빈값으로 찍는다.
                bs_card_data.fieldValues.push( { "id": "100196", "value": "KR" });

              
				// KR_Product Category || 한영본 customer product || 100311
				bs_card_data.fieldValues.push( { "id": "100311", "value": item.customerProduct });

            }else{


                if(status === "create"){
                    // DirectMarketing_EM_TXT_SNS || 글로벌 메일 발송 동의 여부 || 100211
                    bs_card_data.fieldValues.push( { "id": "100211", "value": "Yes" });
                    // DirectMarketing_EM_TXT_SNS_AgreedDate || 글로벌 메일 발송 동의 날짜 || 100200
                    bs_card_data.fieldValues.push( { "id": "100200", "value": utils.timeConverter("GET_UNIX" , item.mailingDate) });
                    // Privacy Policy_Agreed || 개인정보 이용 동의 여부 || 100213 
                    bs_card_data.fieldValues.push( { "id": "100213", "value": "Yes" });
                    // Privacy Policy_AgreedDate || 개인정보 이용 동의 날짜 || 100199
                    bs_card_data.fieldValues.push( { "id": "100199", "value": utils.timeConverter("GET_UNIX" , item.subscriptionDate) });
                    // TransferOutsideCountry || 개인정보 국외이전 동의 여부 || 100210
                    bs_card_data.fieldValues.push( { "id": "100210", "value": "Yes" });
                    // TransferOutsideCountry_AgreedDate || 개인정보 국외이전 동의 날짜 || 100208
                    bs_card_data.fieldValues.push( { "id": "100208", "value": utils.today_getOneUnixTime() });
                }
                //100196 Subsidiary custom field//"userCode": "LGEVU"
                // krMkt Y인 경우 Subsidiary를 KR로 찍고 N인 경우 Global 이기에 Country 값을 봐도 되기 떄문에 빈값으로 찍는다.
                bs_card_data.fieldValues.push( { "id": "100196", "value": "" } );


				// LBCS_customerProduct || Global customer product || 100366
				bs_card_data.fieldValues.push( { "id": "100366", "value": item.customerProduct } );
                
            }

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
    var data = Convert_BS_CARD_DATA(req.body , "create");

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
            // console.log(data[i].fieldValues);
            console.log(err);
            // console.log(err.response.status);
            // console.log(err.response.statusText);
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

    bs_data =  Convert_BS_CARD_DATA(bs_data , "update");
    // console.log(2);
    // console.log(bs_data);
    
  


    var form = {};
    var success_count = 0;
    var failed_count = 0;
    var result_list = [];
    
    // console.log("bs_data.length");
    // console.log(bs_data.length);
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

    console.log("total count : " + bs_data.length + "  ::: success_count : " + success_count + "  ::: failed_count : " + failed_count );
    form.total = bs_data.length;
    form.success_count = success_count;
    form.failed_count = failed_count;
    form.result_list = result_list;
 
    res.json(form);

});


router.post('/origin_update/', async function (req, res, next) {

  
    console.log("origin_update_call");
    // console.log(req.body);
    req.body = [{"type":"Contact","currentStatus":"Awaiting action","id":"163994","createdAt":"1610117261","depth":"complete","name":"neha.sidhwani@lge.com","updatedAt":"1617149119","accountName":"LG","city":"Delhi","country":"India","emailAddress":"neha.sidhwani@lge.com","emailFormatPreference":"unspecified","fieldValues":[{"type":"FieldValue","id":"100005"},{"type":"FieldValue","id":"100017","value":"Ms"},{"type":"FieldValue","id":"100023"},{"type":"FieldValue","id":"100024"},{"type":"FieldValue","id":"100032","value":"CLGEL000000163994"},{"type":"FieldValue","id":"100033"},{"type":"FieldValue","id":"100034"},{"type":"FieldValue","id":"100035"},{"type":"FieldValue","id":"100036"},{"type":"FieldValue","id":"100041"},{"type":"FieldValue","id":"100043"},{"type":"FieldValue","id":"100044"},{"type":"FieldValue","id":"100045"},{"type":"FieldValue","id":"100046"},{"type":"FieldValue","id":"100047"},{"type":"FieldValue","id":"100048"},{"type":"FieldValue","id":"100049"},{"type":"FieldValue","id":"100051"},{"type":"FieldValue","id":"100065"},{"type":"FieldValue","id":"100066"},{"type":"FieldValue","id":"100068"},{"type":"FieldValue","id":"100069","value":"Asia"},{"type":"FieldValue","id":"100072"},{"type":"FieldValue","id":"100081"},{"type":"FieldValue","id":"100171","value":"lge.com"},{"type":"FieldValue","id":"100172","value":"Neha Sidhwani"},{"type":"FieldValue","id":"100174"},{"type":"FieldValue","id":"100175"},{"type":"FieldValue","id":"100176"},{"type":"FieldValue","id":"100177"},{"type":"FieldValue","id":"100178"},{"type":"FieldValue","id":"100179"},{"type":"FieldValue","id":"100180"},{"type":"FieldValue","id":"100184"},{"type":"FieldValue","id":"100187"},{"type":"FieldValue","id":"100188"},{"type":"FieldValue","id":"100189"},{"type":"FieldValue","id":"100190"},{"type":"FieldValue","id":"100191"},{"type":"FieldValue","id":"100192"},{"type":"FieldValue","id":"100193"},{"type":"FieldValue","id":"100194","value":"NehaSidhwaniL8QNOD"},{"type":"FieldValue","id":"100195","value":"Marketer"},{"type":"FieldValue","id":"100196","value":"IL"},{"type":"FieldValue","id":"100197","value":"ID"},{"type":"FieldValue","id":"100199","value":"1617103061"},{"type":"FieldValue","id":"100200","value":"1617103061"},{"type":"FieldValue","id":"100201","value":"1617103061"},{"type":"FieldValue","id":"100202","value":"LG.com"},{"type":"FieldValue","id":"100203","value":"ID_IL_LG.com_I2B_Dev"},{"type":"FieldValue","id":"100205"},{"type":"FieldValue","id":"100206"},{"type":"FieldValue","id":"100208","value":"1617103061"},{"type":"FieldValue","id":"100209","value":"jhkjh"},{"type":"FieldValue","id":"100210","value":"Yes"},{"type":"FieldValue","id":"100211","value":"Yes"},{"type":"FieldValue","id":"100212","value":"Yes"},{"type":"FieldValue","id":"100213","value":"Yes"},{"type":"FieldValue","id":"100214"},{"type":"FieldValue","id":"100215"},{"type":"FieldValue","id":"100216"},{"type":"FieldValue","id":"100219"},{"type":"FieldValue","id":"100220"},{"type":"FieldValue","id":"100221"},{"type":"FieldValue","id":"100222"},{"type":"FieldValue","id":"100223"},{"type":"FieldValue","id":"100224"},{"type":"FieldValue","id":"100225"},{"type":"FieldValue","id":"100226"},{"type":"FieldValue","id":"100227"},{"type":"FieldValue","id":"100228"},{"type":"FieldValue","id":"100229","value":"ID"},{"type":"FieldValue","id":"100230"},{"type":"FieldValue","id":"100231"},{"type":"FieldValue","id":"100232"},{"type":"FieldValue","id":"100233"},{"type":"FieldValue","id":"100234","value":"Others"},{"type":"FieldValue","id":"100235"},{"type":"FieldValue","id":"100236"},{"type":"FieldValue","id":"100237"},{"type":"FieldValue","id":"100238","value":"Sales & Marketing "},{"type":"FieldValue","id":"100239","value":"1"},{"type":"FieldValue","id":"100240"},{"type":"FieldValue","id":"100241"},{"type":"FieldValue","id":"100242","value":"Product understanding"},{"type":"FieldValue","id":"100243"},{"type":"FieldValue","id":"100244"},{"type":"FieldValue","id":"100245"},{"type":"FieldValue","id":"100246"},{"type":"FieldValue","id":"100247","value":"1585096509"},{"type":"FieldValue","id":"100248"},{"type":"FieldValue","id":"100249"},{"type":"FieldValue","id":"100250","value":"LG.com Inquiry to Buy 2020"},{"type":"FieldValue","id":"100251"},{"type":"FieldValue","id":"100252"},{"type":"FieldValue","id":"100253"},{"type":"FieldValue","id":"100254","value":"Usage or technical consultation"},{"type":"FieldValue","id":"100255","value":"3 Months ~ 6 Months"},{"type":"FieldValue","id":"100256","value":"$100,000 ~ $500,000"},{"type":"FieldValue","id":"100257","value":"SMART TV SIGNAGE"},{"type":"FieldValue","id":"100258"},{"type":"FieldValue","id":"100259"},{"type":"FieldValue","id":"100260","value":"System Integrator"},{"type":"FieldValue","id":"100261","value":"Education"},{"type":"FieldValue","id":"100262","value":"C-level Executive"},{"type":"FieldValue","id":"100263"},{"type":"FieldValue","id":"100264"},{"type":"FieldValue","id":"100265"},{"type":"FieldValue","id":"100266"},{"type":"FieldValue","id":"100267"},{"type":"FieldValue","id":"100268"},{"type":"FieldValue","id":"100269"},{"type":"FieldValue","id":"100271"},{"type":"FieldValue","id":"100272"},{"type":"FieldValue","id":"100273"},{"type":"FieldValue","id":"100274"},{"type":"FieldValue","id":"100275"},{"type":"FieldValue","id":"100276"},{"type":"FieldValue","id":"100277"},{"type":"FieldValue","id":"100278"},{"type":"FieldValue","id":"100279"},{"type":"FieldValue","id":"100280"},{"type":"FieldValue","id":"100281"},{"type":"FieldValue","id":"100282"},{"type":"FieldValue","id":"100283"},{"type":"FieldValue","id":"100284"},{"type":"FieldValue","id":"100285"},{"type":"FieldValue","id":"100286"},{"type":"FieldValue","id":"100287"},{"type":"FieldValue","id":"100288"},{"type":"FieldValue","id":"100289"},{"type":"FieldValue","id":"100290"},{"type":"FieldValue","id":"100291"},{"type":"FieldValue","id":"100292","value":"Manager"},{"type":"FieldValue","id":"100293"},{"type":"FieldValue","id":"100294"},{"type":"FieldValue","id":"100295","value":"India_ID"},{"type":"FieldValue","id":"100296"},{"type":"FieldValue","id":"100301"},{"type":"FieldValue","id":"100302"},{"type":"FieldValue","id":"100303"},{"type":"FieldValue","id":"100304"},{"type":"FieldValue","id":"100305","value":"Yes"},{"type":"FieldValue","id":"100306"},{"type":"FieldValue","id":"100307"},{"type":"FieldValue","id":"100309","value":"<ID_2021-03-30 07:17:41.000_jhkjh> <ID_2021-03-30 07:17:41.000_jhkjh> <ID_2021-02-24 02:03:58.000_Product Quote> <ID_2021-01-22 00:00:00.000_Requesting a quote for TR3BF;Know on TR3BF;Technical query;BHMNBJHJBN;HGHVNV;Need quote;Need quote for TR3BF;ABC;Quote><<ID_2020-12-10 00:00:00.000_Requesting a quote for TR3BF;Know on TR3BF;Technical query;BHMNBJHJBN;HGHVNV;Need quote;Need quote for TR3BF;ABC;Quote><>>"},{"type":"FieldValue","id":"100311"},{"type":"FieldValue","id":"100315"},{"type":"FieldValue","id":"100316"},{"type":"FieldValue","id":"100317"},{"type":"FieldValue","id":"100318"},{"type":"FieldValue","id":"100319"},{"type":"FieldValue","id":"100320"},{"type":"FieldValue","id":"100321"},{"type":"FieldValue","id":"100322","value":"Legal"},{"type":"FieldValue","id":"100323"},{"type":"FieldValue","id":"100324"},{"type":"FieldValue","id":"100325"},{"type":"FieldValue","id":"100326","value":"ID_IL_LG.com_I2B_Dev , ID_IL_LG.com_I2B_Dev , ID_IL_LG.com_I2B_Dev , IL_ID_BUSINESSSOLUTIONS_2020NEW , IL_ID_BUSINESSSOLUTIONS_2020NEW , "},{"type":"FieldValue","id":"100327"},{"type":"FieldValue","id":"100328"},{"type":"FieldValue","id":"100329"},{"type":"FieldValue","id":"100330"},{"type":"FieldValue","id":"100331","value":"Y"},{"type":"FieldValue","id":"100332"},{"type":"FieldValue","id":"100333"},{"type":"FieldValue","id":"100334","value":"Yes"},{"type":"FieldValue","id":"100335"},{"type":"FieldValue","id":"100336","value":"Contact"},{"type":"FieldValue","id":"100337","value":"MQL"},{"type":"FieldValue","id":"100338","value":"Contact"},{"type":"FieldValue","id":"100339","value":"Contact"},{"type":"FieldValue","id":"100340"},{"type":"FieldValue","id":"100341","value":"Contact"},{"type":"FieldValue","id":"100342","value":"Contact"},{"type":"FieldValue","id":"100343","value":"Contact"},{"type":"FieldValue","id":"100344","value":"IL_ID_Internal_B2B, IL_ID_B2B Team Contact_Mar20 , LED Customers in India, IL_ID_B2B_TopManagement, IL_ID_B2B_MAY FORM 1_LIST, IL_ID_B2B_AIO LED Screen_Opened_May2, HQ_B2BMKT_Prospect MQL Identifier, IL_ID_B2B_Healthcare_Form Submissions_May 1, IL_ID_B2B_QSR_Opened_1, IL_ID_B2B_AIO LED Screen Red Dot Design Award_Opened_June1, IL_ID_130 AIO SCHEME_JUNE20_Opened1, IL_ID_TDC_Opened_1, IL_ID_B2B_Transparent OLED_Opened 1, IL_ID_B2B_Video wall_opened_May20, IL_ID_TR3BF_OPENED_JUNE 2020, IL_ID_AIO_CORPORATE_OPENED, IL_ID_Video Wall Opened_June, ES_CRM_PPCCAccepted, IL_ID_LSAA_Announcement_opened, IL_ID_ALL INDIA SCHOOL_IDB_OPENED, IL_ID_TEST LIST_2020, IL_ID_TEST LIST 3, IL_ID_TEST LIST 4, IL_ID_TEST LIST (Neha), IL_ID_SELF TEST LIST_25 JULY, DG_ID_DoNotEmail , IL_ID_TR3BF_AUG 2020, IL_ID_TR3BF_AUG_OPENED, IL_ID_LSAA_Training Thank you EDM_Opened_Aug 2020, IL_ID_LG.com Inquiry to Buy_2020, IL_ID_Infographic series_Opened, IL_ID_IDB_Gujarat Campaign_Form Submissions, ES_B2B - Dm_agreement, Buyer Persona - End User, IL_ID_LG MAGNIT_PROMO LIST, IL_ID_PARDOT_Inquiries received, HQ_ID_integrated_all_HQ_included, ES_Exclusion_lg"},{"type":"FieldValue","id":"100345"},{"type":"FieldValue","id":"100346"},{"type":"FieldValue","id":"100347"},{"type":"FieldValue","id":"100348"},{"type":"FieldValue","id":"100349"},{"type":"FieldValue","id":"100350"},{"type":"FieldValue","id":"100351"},{"type":"FieldValue","id":"100352"},{"type":"FieldValue","id":"100353"},{"type":"FieldValue","id":"100354"},{"type":"FieldValue","id":"100355"},{"type":"FieldValue","id":"100356"},{"type":"FieldValue","id":"100357"},{"type":"FieldValue","id":"100358"},{"type":"FieldValue","id":"100359"},{"type":"FieldValue","id":"100360"},{"type":"FieldValue","id":"100361"},{"type":"FieldValue","id":"100362"},{"type":"FieldValue","id":"100363"},{"type":"FieldValue","id":"100364"},{"type":"FieldValue","id":"100365"},{"type":"FieldValue","id":"100366"}],"firstName":"Neha ","isBounceback":"false","isSubscribed":"true","lastName":"Sidhwani","mobilePhone":"nbnmbnm","province":"Delhi","subscriptionDate":"1614060611"},{"type":"Contact","currentStatus":"Awaiting action","id":"300440","createdAt":"1610117320","depth":"complete","name":"robin.wong@lge.com","updatedAt":"1617149366","accountName":"LGEHK","address1":"6/F, Manhattan Place, 23 Wang Tai Rd., Kowloon Bay","country":"Hong Kong","emailAddress":"robin.wong@lge.com","emailFormatPreference":"unspecified","fieldValues":[{"type":"FieldValue","id":"100005"},{"type":"FieldValue","id":"100017","value":"Mr"},{"type":"FieldValue","id":"100023"},{"type":"FieldValue","id":"100024"},{"type":"FieldValue","id":"100032","value":"CLGEL000000300440"},{"type":"FieldValue","id":"100033"},{"type":"FieldValue","id":"100034"},{"type":"FieldValue","id":"100035"},{"type":"FieldValue","id":"100036"},{"type":"FieldValue","id":"100041"},{"type":"FieldValue","id":"100043"},{"type":"FieldValue","id":"100044"},{"type":"FieldValue","id":"100045"},{"type":"FieldValue","id":"100046"},{"type":"FieldValue","id":"100047"},{"type":"FieldValue","id":"100048"},{"type":"FieldValue","id":"100049"},{"type":"FieldValue","id":"100051"},{"type":"FieldValue","id":"100065"},{"type":"FieldValue","id":"100066"},{"type":"FieldValue","id":"100068"},{"type":"FieldValue","id":"100069","value":"Asia"},{"type":"FieldValue","id":"100072"},{"type":"FieldValue","id":"100081"},{"type":"FieldValue","id":"100171","value":"lge.com"},{"type":"FieldValue","id":"100172","value":"robin wong"},{"type":"FieldValue","id":"100174"},{"type":"FieldValue","id":"100175"},{"type":"FieldValue","id":"100176"},{"type":"FieldValue","id":"100177"},{"type":"FieldValue","id":"100178"},{"type":"FieldValue","id":"100179"},{"type":"FieldValue","id":"100180"},{"type":"FieldValue","id":"100184"},{"type":"FieldValue","id":"100187"},{"type":"FieldValue","id":"100188"},{"type":"FieldValue","id":"100189"},{"type":"FieldValue","id":"100190"},{"type":"FieldValue","id":"100191"},{"type":"FieldValue","id":"100192"},{"type":"FieldValue","id":"100193"},{"type":"FieldValue","id":"100194","value":"ROBINWONGL8MZHO"},{"type":"FieldValue","id":"100195","value":"Marketer"},{"type":"FieldValue","id":"100196","value":"HK"},{"type":"FieldValue","id":"100197","value":"ID"},{"type":"FieldValue","id":"100199","value":"1617072405"},{"type":"FieldValue","id":"100200","value":"1617072405"},{"type":"FieldValue","id":"100201","value":"1617072405"},{"type":"FieldValue","id":"100202","value":"LG.com"},{"type":"FieldValue","id":"100203","value":"ID_HK_LG.com_I2B_Eng_Dev"},{"type":"FieldValue","id":"100205"},{"type":"FieldValue","id":"100206"},{"type":"FieldValue","id":"100208","value":"1617072405"},{"type":"FieldValue","id":"100209","value":"testing"},{"type":"FieldValue","id":"100210","value":"Yes"},{"type":"FieldValue","id":"100211","value":"Yes"},{"type":"FieldValue","id":"100212","value":"Yes"},{"type":"FieldValue","id":"100213","value":"Yes"},{"type":"FieldValue","id":"100214"},{"type":"FieldValue","id":"100215"},{"type":"FieldValue","id":"100216"},{"type":"FieldValue","id":"100219"},{"type":"FieldValue","id":"100220"},{"type":"FieldValue","id":"100221"},{"type":"FieldValue","id":"100222"},{"type":"FieldValue","id":"100223"},{"type":"FieldValue","id":"100224"},{"type":"FieldValue","id":"100225"},{"type":"FieldValue","id":"100226"},{"type":"FieldValue","id":"100227"},{"type":"FieldValue","id":"100228"},{"type":"FieldValue","id":"100229","value":"ID"},{"type":"FieldValue","id":"100230"},{"type":"FieldValue","id":"100231"},{"type":"FieldValue","id":"100232"},{"type":"FieldValue","id":"100233"},{"type":"FieldValue","id":"100234"},{"type":"FieldValue","id":"100235"},{"type":"FieldValue","id":"100236"},{"type":"FieldValue","id":"100237"},{"type":"FieldValue","id":"100238"},{"type":"FieldValue","id":"100239"},{"type":"FieldValue","id":"100240"},{"type":"FieldValue","id":"100241"},{"type":"FieldValue","id":"100242"},{"type":"FieldValue","id":"100243"},{"type":"FieldValue","id":"100244"},{"type":"FieldValue","id":"100245"},{"type":"FieldValue","id":"100246"},{"type":"FieldValue","id":"100247","value":"1578589620"},{"type":"FieldValue","id":"100248"},{"type":"FieldValue","id":"100249"},{"type":"FieldValue","id":"100250","value":"Business Card,"},{"type":"FieldValue","id":"100251"},{"type":"FieldValue","id":"100252"},{"type":"FieldValue","id":"100253"},{"type":"FieldValue","id":"100254","value":"Quotation or purchase consultation"},{"type":"FieldValue","id":"100255","value":"Less than 3 Months"},{"type":"FieldValue","id":"100256","value":"Less than $100,000"},{"type":"FieldValue","id":"100257","value":"Standard Signage"},{"type":"FieldValue","id":"100258","value":"UH5F Series"},{"type":"FieldValue","id":"100259","value":"49UH5F-B"},{"type":"FieldValue","id":"100260","value":"Other"},{"type":"FieldValue","id":"100261"},{"type":"FieldValue","id":"100262"},{"type":"FieldValue","id":"100263"},{"type":"FieldValue","id":"100264"},{"type":"FieldValue","id":"100265"},{"type":"FieldValue","id":"100266"},{"type":"FieldValue","id":"100267"},{"type":"FieldValue","id":"100268"},{"type":"FieldValue","id":"100269"},{"type":"FieldValue","id":"100271"},{"type":"FieldValue","id":"100272"},{"type":"FieldValue","id":"100273"},{"type":"FieldValue","id":"100274"},{"type":"FieldValue","id":"100275"},{"type":"FieldValue","id":"100276"},{"type":"FieldValue","id":"100277"},{"type":"FieldValue","id":"100278"},{"type":"FieldValue","id":"100279"},{"type":"FieldValue","id":"100280"},{"type":"FieldValue","id":"100281"},{"type":"FieldValue","id":"100282"},{"type":"FieldValue","id":"100283"},{"type":"FieldValue","id":"100284"},{"type":"FieldValue","id":"100285"},{"type":"FieldValue","id":"100286"},{"type":"FieldValue","id":"100287"},{"type":"FieldValue","id":"100288"},{"type":"FieldValue","id":"100289"},{"type":"FieldValue","id":"100290"},{"type":"FieldValue","id":"100291"},{"type":"FieldValue","id":"100292","value":"Supervisor"},{"type":"FieldValue","id":"100293"},{"type":"FieldValue","id":"100294"},{"type":"FieldValue","id":"100295","value":"Hong Kong_ID"},{"type":"FieldValue","id":"100296"},{"type":"FieldValue","id":"100301"},{"type":"FieldValue","id":"100302"},{"type":"FieldValue","id":"100303"},{"type":"FieldValue","id":"100304"},{"type":"FieldValue","id":"100305","value":"Yes"},{"type":"FieldValue","id":"100306"},{"type":"FieldValue","id":"100307"},{"type":"FieldValue","id":"100309","value":"<ID_2021-03-29 22:46:45.000_testing> <ID_2021-03-18 22:45:42.000_testing the form> <ID_2021-03-18 22:45:42.000_testing the form> <ID_2021-03-15 05:57:34.000_This is going to test the Inquiry to Buy function, please reply to robin.wong if you receive this inquiry.> "},{"type":"FieldValue","id":"100311"},{"type":"FieldValue","id":"100315"},{"type":"FieldValue","id":"100316"},{"type":"FieldValue","id":"100317"},{"type":"FieldValue","id":"100318"},{"type":"FieldValue","id":"100319"},{"type":"FieldValue","id":"100320"},{"type":"FieldValue","id":"100321"},{"type":"FieldValue","id":"100322","value":"Marketing"},{"type":"FieldValue","id":"100323"},{"type":"FieldValue","id":"100324"},{"type":"FieldValue","id":"100325"},{"type":"FieldValue","id":"100326","value":"ID_HK_LG.com_I2B_Eng_Dev , ID_HK_LG.com_I2B_Eng_Dev , ID_HK_LG.com_I2B_Eng_Dev , ID_HK_LG.com_I2B_Eng_Dev , HK_B2BMKT_Internal test , "},{"type":"FieldValue","id":"100327"},{"type":"FieldValue","id":"100328"},{"type":"FieldValue","id":"100329"},{"type":"FieldValue","id":"100330"},{"type":"FieldValue","id":"100331","value":"Y"},{"type":"FieldValue","id":"100332","value":"Y"},{"type":"FieldValue","id":"100333"},{"type":"FieldValue","id":"100334"},{"type":"FieldValue","id":"100335"},{"type":"FieldValue","id":"100336","value":"Contact"},{"type":"FieldValue","id":"100337","value":"MQL"},{"type":"FieldValue","id":"100338","value":"Contact"},{"type":"FieldValue","id":"100339","value":"Contact"},{"type":"FieldValue","id":"100340"},{"type":"FieldValue","id":"100341","value":"Contact"},{"type":"FieldValue","id":"100342","value":"Contact"},{"type":"FieldValue","id":"100343","value":"Contact"},{"type":"FieldValue","id":"100344","value":"HK_ID_[OLD]BusinessCard Input (last update: Jan 2020), HK_ID_MAT Activation (1st eDM), HK_ID_Internal Test (Full), ES_B2B - PP_subscription, ES_B2B - PP_subscription - Politica de privacidad - 25-09-2020, ES_Exclusion_lg"},{"type":"FieldValue","id":"100345"},{"type":"FieldValue","id":"100346"},{"type":"FieldValue","id":"100347"},{"type":"FieldValue","id":"100348"},{"type":"FieldValue","id":"100349"},{"type":"FieldValue","id":"100350"},{"type":"FieldValue","id":"100351"},{"type":"FieldValue","id":"100352"},{"type":"FieldValue","id":"100353"},{"type":"FieldValue","id":"100354"},{"type":"FieldValue","id":"100355"},{"type":"FieldValue","id":"100356"},{"type":"FieldValue","id":"100357"},{"type":"FieldValue","id":"100358"},{"type":"FieldValue","id":"100359"},{"type":"FieldValue","id":"100360"},{"type":"FieldValue","id":"100361"},{"type":"FieldValue","id":"100362"},{"type":"FieldValue","id":"100363"},{"type":"FieldValue","id":"100364"},{"type":"FieldValue","id":"100365"},{"type":"FieldValue","id":"100366"}],"firstName":"robin","isBounceback":"false","isSubscribed":"true","lastName":"wong","subscriptionDate":"1612256656"},{"type":"Contact","currentStatus":"Awaiting action","id":"529893","createdAt":"1617068511","depth":"complete","name":"ricardo.codesseira@gmail.com","updatedAt":"1617149301","accountName":"Ok dmt Lda","country":"Portugal","emailAddress":"ricardo.codesseira@gmail.com","emailFormatPreference":"unspecified","fieldValues":[{"type":"FieldValue","id":"100005"},{"type":"FieldValue","id":"100017"},{"type":"FieldValue","id":"100023"},{"type":"FieldValue","id":"100024"},{"type":"FieldValue","id":"100032","value":"CLGEL000000529893"},{"type":"FieldValue","id":"100033"},{"type":"FieldValue","id":"100034"},{"type":"FieldValue","id":"100035"},{"type":"FieldValue","id":"100036"},{"type":"FieldValue","id":"100041"},{"type":"FieldValue","id":"100043"},{"type":"FieldValue","id":"100044"},{"type":"FieldValue","id":"100045"},{"type":"FieldValue","id":"100046"},{"type":"FieldValue","id":"100047"},{"type":"FieldValue","id":"100048"},{"type":"FieldValue","id":"100049"},{"type":"FieldValue","id":"100051"},{"type":"FieldValue","id":"100065"},{"type":"FieldValue","id":"100066"},{"type":"FieldValue","id":"100068"},{"type":"FieldValue","id":"100069","value":"Europe"},{"type":"FieldValue","id":"100072"},{"type":"FieldValue","id":"100081"},{"type":"FieldValue","id":"100171","value":"gmail.com"},{"type":"FieldValue","id":"100172","value":"Fernandes Ricardo"},{"type":"FieldValue","id":"100174"},{"type":"FieldValue","id":"100175"},{"type":"FieldValue","id":"100176"},{"type":"FieldValue","id":"100177"},{"type":"FieldValue","id":"100178"},{"type":"FieldValue","id":"100179"},{"type":"FieldValue","id":"100180"},{"type":"FieldValue","id":"100184"},{"type":"FieldValue","id":"100187"},{"type":"FieldValue","id":"100188"},{"type":"FieldValue","id":"100189"},{"type":"FieldValue","id":"100190"},{"type":"FieldValue","id":"100191"},{"type":"FieldValue","id":"100192"},{"type":"FieldValue","id":"100193"},{"type":"FieldValue","id":"100194","value":"FernandesRicardoL8RJU3"},{"type":"FieldValue","id":"100195"},{"type":"FieldValue","id":"100196","value":"PT"},{"type":"FieldValue","id":"100197"},{"type":"FieldValue","id":"100199","value":"1617068510"},{"type":"FieldValue","id":"100200","value":"1617068510"},{"type":"FieldValue","id":"100201","value":"1617068510"},{"type":"FieldValue","id":"100202","value":"C-display"},{"type":"FieldValue","id":"100203","value":"ID_HQ_Cdisplay_I2B"},{"type":"FieldValue","id":"100205"},{"type":"FieldValue","id":"100206"},{"type":"FieldValue","id":"100208","value":"1617068510"},{"type":"FieldValue","id":"100209","value":"I´m organising the openning of a 26 keys boutique hotel in the North Portugal. Could you please let me know the costs for 26 units."},{"type":"FieldValue","id":"100210","value":"Yes"},{"type":"FieldValue","id":"100211","value":"Yes"},{"type":"FieldValue","id":"100212","value":"Yes"},{"type":"FieldValue","id":"100213","value":"Yes"},{"type":"FieldValue","id":"100214"},{"type":"FieldValue","id":"100215"},{"type":"FieldValue","id":"100216"},{"type":"FieldValue","id":"100219"},{"type":"FieldValue","id":"100220"},{"type":"FieldValue","id":"100221"},{"type":"FieldValue","id":"100222"},{"type":"FieldValue","id":"100223"},{"type":"FieldValue","id":"100224"},{"type":"FieldValue","id":"100225"},{"type":"FieldValue","id":"100226"},{"type":"FieldValue","id":"100227"},{"type":"FieldValue","id":"100228"},{"type":"FieldValue","id":"100229","value":"ID"},{"type":"FieldValue","id":"100230"},{"type":"FieldValue","id":"100231"},{"type":"FieldValue","id":"100232"},{"type":"FieldValue","id":"100233"},{"type":"FieldValue","id":"100234"},{"type":"FieldValue","id":"100235"},{"type":"FieldValue","id":"100236"},{"type":"FieldValue","id":"100237"},{"type":"FieldValue","id":"100238"},{"type":"FieldValue","id":"100239"},{"type":"FieldValue","id":"100240"},{"type":"FieldValue","id":"100241"},{"type":"FieldValue","id":"100242"},{"type":"FieldValue","id":"100243"},{"type":"FieldValue","id":"100244"},{"type":"FieldValue","id":"100245"},{"type":"FieldValue","id":"100246"},{"type":"FieldValue","id":"100247","value":"1617068460"},{"type":"FieldValue","id":"100248"},{"type":"FieldValue","id":"100249"},{"type":"FieldValue","id":"100250"},{"type":"FieldValue","id":"100251"},{"type":"FieldValue","id":"100252"},{"type":"FieldValue","id":"100253"},{"type":"FieldValue","id":"100254","value":"Quotation or purchase consultation"},{"type":"FieldValue","id":"100255","value":"9 Months ~ 1 year"},{"type":"FieldValue","id":"100256","value":"Less than $100,000"},{"type":"FieldValue","id":"100257","value":"Hotel TV"},{"type":"FieldValue","id":"100258","value":"US760H Series"},{"type":"FieldValue","id":"100259","value":"75US760H (EU)"},{"type":"FieldValue","id":"100260","value":"End-user"},{"type":"FieldValue","id":"100261","value":"Hospitality"},{"type":"FieldValue","id":"100262","value":"C-level Executive"},{"type":"FieldValue","id":"100263"},{"type":"FieldValue","id":"100264"},{"type":"FieldValue","id":"100265"},{"type":"FieldValue","id":"100266"},{"type":"FieldValue","id":"100267"},{"type":"FieldValue","id":"100268"},{"type":"FieldValue","id":"100269"},{"type":"FieldValue","id":"100271"},{"type":"FieldValue","id":"100272"},{"type":"FieldValue","id":"100273"},{"type":"FieldValue","id":"100274"},{"type":"FieldValue","id":"100275"},{"type":"FieldValue","id":"100276"},{"type":"FieldValue","id":"100277"},{"type":"FieldValue","id":"100278"},{"type":"FieldValue","id":"100279"},{"type":"FieldValue","id":"100280"},{"type":"FieldValue","id":"100281"},{"type":"FieldValue","id":"100282"},{"type":"FieldValue","id":"100283"},{"type":"FieldValue","id":"100284"},{"type":"FieldValue","id":"100285"},{"type":"FieldValue","id":"100286"},{"type":"FieldValue","id":"100287"},{"type":"FieldValue","id":"100288"},{"type":"FieldValue","id":"100289"},{"type":"FieldValue","id":"100290"},{"type":"FieldValue","id":"100291"},{"type":"FieldValue","id":"100292"},{"type":"FieldValue","id":"100293"},{"type":"FieldValue","id":"100294"},{"type":"FieldValue","id":"100295","value":"Portugal_ID"},{"type":"FieldValue","id":"100296"},{"type":"FieldValue","id":"100301"},{"type":"FieldValue","id":"100302"},{"type":"FieldValue","id":"100303"},{"type":"FieldValue","id":"100304"},{"type":"FieldValue","id":"100305","value":"No"},{"type":"FieldValue","id":"100306"},{"type":"FieldValue","id":"100307"},{"type":"FieldValue","id":"100309","value":"<ID_2021-03-29 21:41:50.000_I´m organising the openning of a 26 keys boutique hotel in the North Portugal. Could you please let me know the costs for 26 units.> <ID_2021-03-29 21:41:50.000_I´m organising the openning of a 26 keys boutique hotel in the North Portugal. Could you please let me know the costs for 26 units.> "},{"type":"FieldValue","id":"100311"},{"type":"FieldValue","id":"100315","value":"No"},{"type":"FieldValue","id":"100316","value":"No"},{"type":"FieldValue","id":"100317","value":"No"},{"type":"FieldValue","id":"100318","value":"No"},{"type":"FieldValue","id":"100319"},{"type":"FieldValue","id":"100320"},{"type":"FieldValue","id":"100321"},{"type":"FieldValue","id":"100322","value":"Program and Project Management"},{"type":"FieldValue","id":"100323"},{"type":"FieldValue","id":"100324"},{"type":"FieldValue","id":"100325"},{"type":"FieldValue","id":"100326","value":"ID_HQ_Cdisplay_I2B , ID_HQ_Cdisplay_I2B , "},{"type":"FieldValue","id":"100327"},{"type":"FieldValue","id":"100328"},{"type":"FieldValue","id":"100329"},{"type":"FieldValue","id":"100330"},{"type":"FieldValue","id":"100331","value":"Y"},{"type":"FieldValue","id":"100332"},{"type":"FieldValue","id":"100333"},{"type":"FieldValue","id":"100334"},{"type":"FieldValue","id":"100335"},{"type":"FieldValue","id":"100336","value":"Contact"},{"type":"FieldValue","id":"100337","value":"MQL"},{"type":"FieldValue","id":"100338","value":"Contact"},{"type":"FieldValue","id":"100339","value":"Contact"},{"type":"FieldValue","id":"100340"},{"type":"FieldValue","id":"100341","value":"Contact"},{"type":"FieldValue","id":"100342","value":"Contact"},{"type":"FieldValue","id":"100343","value":"Contact"},{"type":"FieldValue","id":"100344"},{"type":"FieldValue","id":"100345"},{"type":"FieldValue","id":"100346","value":"Hotel / Resort / Casino"},{"type":"FieldValue","id":"100347"},{"type":"FieldValue","id":"100348"},{"type":"FieldValue","id":"100349"},{"type":"FieldValue","id":"100350"},{"type":"FieldValue","id":"100351"},{"type":"FieldValue","id":"100352"},{"type":"FieldValue","id":"100353"},{"type":"FieldValue","id":"100354"},{"type":"FieldValue","id":"100355"},{"type":"FieldValue","id":"100356"},{"type":"FieldValue","id":"100357"},{"type":"FieldValue","id":"100358"},{"type":"FieldValue","id":"100359"},{"type":"FieldValue","id":"100360"},{"type":"FieldValue","id":"100361"},{"type":"FieldValue","id":"100362"},{"type":"FieldValue","id":"100363","value":"No"},{"type":"FieldValue","id":"100364"},{"type":"FieldValue","id":"100365"},{"type":"FieldValue","id":"100366"}],"firstName":"Fernandes","isBounceback":"false","isSubscribed":"true","lastName":"Ricardo","subscriptionDate":"1617068511"},{"type":"Contact","currentStatus":"Awaiting action","id":"530141","createdAt":"1617089371","depth":"complete","name":"tonyjoseph393@gmail.com","updatedAt":"1617149230","accountName":"Qzolve ","city":"Riyadh","country":"Saudi Arabia","emailAddress":"tonyjoseph393@gmail.com","emailFormatPreference":"unspecified","fieldValues":[{"type":"FieldValue","id":"100005"},{"type":"FieldValue","id":"100017"},{"type":"FieldValue","id":"100023"},{"type":"FieldValue","id":"100024"},{"type":"FieldValue","id":"100032","value":"CLGEL000000530141"},{"type":"FieldValue","id":"100033"},{"type":"FieldValue","id":"100034"},{"type":"FieldValue","id":"100035"},{"type":"FieldValue","id":"100036"},{"type":"FieldValue","id":"100041"},{"type":"FieldValue","id":"100043"},{"type":"FieldValue","id":"100044"},{"type":"FieldValue","id":"100045"},{"type":"FieldValue","id":"100046"},{"type":"FieldValue","id":"100047"},{"type":"FieldValue","id":"100048"},{"type":"FieldValue","id":"100049"},{"type":"FieldValue","id":"100051"},{"type":"FieldValue","id":"100065"},{"type":"FieldValue","id":"100066"},{"type":"FieldValue","id":"100068"},{"type":"FieldValue","id":"100069","value":"Middle East & Africa"},{"type":"FieldValue","id":"100072"},{"type":"FieldValue","id":"100081"},{"type":"FieldValue","id":"100171","value":"gmail.com"},{"type":"FieldValue","id":"100172","value":"Tony Joseph"},{"type":"FieldValue","id":"100174"},{"type":"FieldValue","id":"100175"},{"type":"FieldValue","id":"100176"},{"type":"FieldValue","id":"100177"},{"type":"FieldValue","id":"100178"},{"type":"FieldValue","id":"100179"},{"type":"FieldValue","id":"100180"},{"type":"FieldValue","id":"100184"},{"type":"FieldValue","id":"100187"},{"type":"FieldValue","id":"100188"},{"type":"FieldValue","id":"100189"},{"type":"FieldValue","id":"100190"},{"type":"FieldValue","id":"100191"},{"type":"FieldValue","id":"100192"},{"type":"FieldValue","id":"100193"},{"type":"FieldValue","id":"100194","value":"TonyJosephL8RD24"},{"type":"FieldValue","id":"100195"},{"type":"FieldValue","id":"100196","value":"SB"},{"type":"FieldValue","id":"100197"},{"type":"FieldValue","id":"100199","value":"1617089370"},{"type":"FieldValue","id":"100200","value":"1617089370"},{"type":"FieldValue","id":"100201","value":"1617089370"},{"type":"FieldValue","id":"100202","value":"LG.com"},{"type":"FieldValue","id":"100203","value":"ID_HQ_LG.com_I2B"},{"type":"FieldValue","id":"100205"},{"type":"FieldValue","id":"100206"},{"type":"FieldValue","id":"100208","value":"1617089370"},{"type":"FieldValue","id":"100209","value":"i need 100 lg poe android tablet in riyadh.\r\nCall me at +966597519716\r\nEmail: tonyjoseph393@gmail.com"},{"type":"FieldValue","id":"100210","value":"Yes"},{"type":"FieldValue","id":"100211","value":"Yes"},{"type":"FieldValue","id":"100212","value":"Yes"},{"type":"FieldValue","id":"100213","value":"Yes"},{"type":"FieldValue","id":"100214"},{"type":"FieldValue","id":"100215"},{"type":"FieldValue","id":"100216"},{"type":"FieldValue","id":"100219"},{"type":"FieldValue","id":"100220"},{"type":"FieldValue","id":"100221"},{"type":"FieldValue","id":"100222"},{"type":"FieldValue","id":"100223"},{"type":"FieldValue","id":"100224"},{"type":"FieldValue","id":"100225"},{"type":"FieldValue","id":"100226"},{"type":"FieldValue","id":"100227"},{"type":"FieldValue","id":"100228"},{"type":"FieldValue","id":"100229","value":"ID"},{"type":"FieldValue","id":"100230"},{"type":"FieldValue","id":"100231"},{"type":"FieldValue","id":"100232"},{"type":"FieldValue","id":"100233"},{"type":"FieldValue","id":"100234"},{"type":"FieldValue","id":"100235"},{"type":"FieldValue","id":"100236"},{"type":"FieldValue","id":"100237"},{"type":"FieldValue","id":"100238"},{"type":"FieldValue","id":"100239"},{"type":"FieldValue","id":"100240"},{"type":"FieldValue","id":"100241"},{"type":"FieldValue","id":"100242"},{"type":"FieldValue","id":"100243"},{"type":"FieldValue","id":"100244"},{"type":"FieldValue","id":"100245"},{"type":"FieldValue","id":"100246"},{"type":"FieldValue","id":"100247","value":"1617089340"},{"type":"FieldValue","id":"100248"},{"type":"FieldValue","id":"100249"},{"type":"FieldValue","id":"100250"},{"type":"FieldValue","id":"100251"},{"type":"FieldValue","id":"100252"},{"type":"FieldValue","id":"100253"},{"type":"FieldValue","id":"100254","value":"Quotation or purchase consultation"},{"type":"FieldValue","id":"100255"},{"type":"FieldValue","id":"100256","value":"Less than $100,000"},{"type":"FieldValue","id":"100257","value":"LED Signage"},{"type":"FieldValue","id":"100258"},{"type":"FieldValue","id":"100259"},{"type":"FieldValue","id":"100260","value":"System Integrator"},{"type":"FieldValue","id":"100261"},{"type":"FieldValue","id":"100262"},{"type":"FieldValue","id":"100263"},{"type":"FieldValue","id":"100264"},{"type":"FieldValue","id":"100265"},{"type":"FieldValue","id":"100266"},{"type":"FieldValue","id":"100267"},{"type":"FieldValue","id":"100268"},{"type":"FieldValue","id":"100269"},{"type":"FieldValue","id":"100271"},{"type":"FieldValue","id":"100272"},{"type":"FieldValue","id":"100273"},{"type":"FieldValue","id":"100274"},{"type":"FieldValue","id":"100275"},{"type":"FieldValue","id":"100276"},{"type":"FieldValue","id":"100277"},{"type":"FieldValue","id":"100278"},{"type":"FieldValue","id":"100279"},{"type":"FieldValue","id":"100280"},{"type":"FieldValue","id":"100281"},{"type":"FieldValue","id":"100282"},{"type":"FieldValue","id":"100283"},{"type":"FieldValue","id":"100284"},{"type":"FieldValue","id":"100285"},{"type":"FieldValue","id":"100286"},{"type":"FieldValue","id":"100287"},{"type":"FieldValue","id":"100288"},{"type":"FieldValue","id":"100289"},{"type":"FieldValue","id":"100290"},{"type":"FieldValue","id":"100291"},{"type":"FieldValue","id":"100292"},{"type":"FieldValue","id":"100293"},{"type":"FieldValue","id":"100294"},{"type":"FieldValue","id":"100295","value":"Saudi Arabia_ID"},{"type":"FieldValue","id":"100296"},{"type":"FieldValue","id":"100301"},{"type":"FieldValue","id":"100302"},{"type":"FieldValue","id":"100303"},{"type":"FieldValue","id":"100304"},{"type":"FieldValue","id":"100305","value":"Yes"},{"type":"FieldValue","id":"100306"},{"type":"FieldValue","id":"100307"},{"type":"FieldValue","id":"100309","value":"<ID_2021-03-30 03:29:30.000_i need 100 lg poe android tablet in riyadh.\r\nCall me at +966597519716\r\nEmail: tonyjoseph393@gmail.com> <ID_2021-03-30 03:29:30.000_i need 100 lg poe android tablet in riyadh.\r\nCall me at +966597519716\r\nEmail: tonyjoseph393@gmail.com> "},{"type":"FieldValue","id":"100311"},{"type":"FieldValue","id":"100315","value":"No"},{"type":"FieldValue","id":"100316","value":"No"},{"type":"FieldValue","id":"100317","value":"No"},{"type":"FieldValue","id":"100318","value":"No"},{"type":"FieldValue","id":"100319"},{"type":"FieldValue","id":"100320"},{"type":"FieldValue","id":"100321"},{"type":"FieldValue","id":"100322","value":"Engineering"},{"type":"FieldValue","id":"100323"},{"type":"FieldValue","id":"100324"},{"type":"FieldValue","id":"100325"},{"type":"FieldValue","id":"100326","value":"ID_HQ_LG.com_I2B , ID_HQ_LG.com_I2B , "},{"type":"FieldValue","id":"100327"},{"type":"FieldValue","id":"100328"},{"type":"FieldValue","id":"100329"},{"type":"FieldValue","id":"100330"},{"type":"FieldValue","id":"100331","value":"Y"},{"type":"FieldValue","id":"100332"},{"type":"FieldValue","id":"100333"},{"type":"FieldValue","id":"100334"},{"type":"FieldValue","id":"100335"},{"type":"FieldValue","id":"100336","value":"Contact"},{"type":"FieldValue","id":"100337","value":"MQL"},{"type":"FieldValue","id":"100338","value":"Contact"},{"type":"FieldValue","id":"100339","value":"Contact"},{"type":"FieldValue","id":"100340"},{"type":"FieldValue","id":"100341","value":"Contact"},{"type":"FieldValue","id":"100342","value":"Contact"},{"type":"FieldValue","id":"100343","value":"Contact"},{"type":"FieldValue","id":"100344"},{"type":"FieldValue","id":"100345"},{"type":"FieldValue","id":"100346"},{"type":"FieldValue","id":"100347"},{"type":"FieldValue","id":"100348"},{"type":"FieldValue","id":"100349"},{"type":"FieldValue","id":"100350"},{"type":"FieldValue","id":"100351"},{"type":"FieldValue","id":"100352"},{"type":"FieldValue","id":"100353"},{"type":"FieldValue","id":"100354"},{"type":"FieldValue","id":"100355"},{"type":"FieldValue","id":"100356"},{"type":"FieldValue","id":"100357"},{"type":"FieldValue","id":"100358"},{"type":"FieldValue","id":"100359"},{"type":"FieldValue","id":"100360"},{"type":"FieldValue","id":"100361"},{"type":"FieldValue","id":"100362"},{"type":"FieldValue","id":"100363","value":"No"},{"type":"FieldValue","id":"100364"},{"type":"FieldValue","id":"100365"},{"type":"FieldValue","id":"100366"}],"firstName":"Tony ","isBounceback":"false","isSubscribed":"true","lastName":"Joseph","mobilePhone":"966507519716","subscriptionDate":"1617089371"},{"type":"Contact","currentStatus":"Awaiting action","id":"530167","createdAt":"1617098820","depth":"complete","name":"achim@bildwerk.tv","updatedAt":"1617149323","accountName":"BILDWERK OG","city":"Vienna","country":"Austria","emailAddress":"achim@bildwerk.tv","emailFormatPreference":"unspecified","fieldValues":[{"type":"FieldValue","id":"100005"},{"type":"FieldValue","id":"100017"},{"type":"FieldValue","id":"100023"},{"type":"FieldValue","id":"100024"},{"type":"FieldValue","id":"100032","value":"CLGEL000000530167"},{"type":"FieldValue","id":"100033"},{"type":"FieldValue","id":"100034"},{"type":"FieldValue","id":"100035"},{"type":"FieldValue","id":"100036"},{"type":"FieldValue","id":"100041"},{"type":"FieldValue","id":"100043"},{"type":"FieldValue","id":"100044"},{"type":"FieldValue","id":"100045"},{"type":"FieldValue","id":"100046"},{"type":"FieldValue","id":"100047"},{"type":"FieldValue","id":"100048"},{"type":"FieldValue","id":"100049"},{"type":"FieldValue","id":"100051"},{"type":"FieldValue","id":"100065"},{"type":"FieldValue","id":"100066"},{"type":"FieldValue","id":"100068"},{"type":"FieldValue","id":"100069","value":"Europe"},{"type":"FieldValue","id":"100072"},{"type":"FieldValue","id":"100081"},{"type":"FieldValue","id":"100171","value":"bildwerk.tv"},{"type":"FieldValue","id":"100172","value":"Achim Stromberger"},{"type":"FieldValue","id":"100174"},{"type":"FieldValue","id":"100175"},{"type":"FieldValue","id":"100176"},{"type":"FieldValue","id":"100177"},{"type":"FieldValue","id":"100178"},{"type":"FieldValue","id":"100179"},{"type":"FieldValue","id":"100180"},{"type":"FieldValue","id":"100184"},{"type":"FieldValue","id":"100187"},{"type":"FieldValue","id":"100188"},{"type":"FieldValue","id":"100189"},{"type":"FieldValue","id":"100190"},{"type":"FieldValue","id":"100191"},{"type":"FieldValue","id":"100192"},{"type":"FieldValue","id":"100193"},{"type":"FieldValue","id":"100194","value":"AchimStrombergerL8RD2T"},{"type":"FieldValue","id":"100195"},{"type":"FieldValue","id":"100196","value":"AG"},{"type":"FieldValue","id":"100197"},{"type":"FieldValue","id":"100199","value":"1617098820"},{"type":"FieldValue","id":"100200","value":"1617098820"},{"type":"FieldValue","id":"100201","value":"1617098820"},{"type":"FieldValue","id":"100202","value":"LG.com"},{"type":"FieldValue","id":"100203","value":"ID_HQ_LG.com_I2B"},{"type":"FieldValue","id":"100205"},{"type":"FieldValue","id":"100206"},{"type":"FieldValue","id":"100208","value":"1617098820"},{"type":"FieldValue","id":"100209","value":"Hello, we are a spatial design studio based in vienna. I am head of the design department and interested in realizing a project with curved oleds. 12 to 15pcs 55\" or similar. Maybe also one additional piece of transparent oled. I have seen your producs on fairs and on the web, but I find no reseller that has them avialable. Please contact me if and when these devices could be available to buy for us.\r\n\r\nKind regards, Achim"},{"type":"FieldValue","id":"100210","value":"Yes"},{"type":"FieldValue","id":"100211","value":"Yes"},{"type":"FieldValue","id":"100212","value":"Yes"},{"type":"FieldValue","id":"100213","value":"Yes"},{"type":"FieldValue","id":"100214"},{"type":"FieldValue","id":"100215"},{"type":"FieldValue","id":"100216"},{"type":"FieldValue","id":"100219"},{"type":"FieldValue","id":"100220"},{"type":"FieldValue","id":"100221"},{"type":"FieldValue","id":"100222"},{"type":"FieldValue","id":"100223"},{"type":"FieldValue","id":"100224"},{"type":"FieldValue","id":"100225"},{"type":"FieldValue","id":"100226"},{"type":"FieldValue","id":"100227"},{"type":"FieldValue","id":"100228"},{"type":"FieldValue","id":"100229","value":"ID"},{"type":"FieldValue","id":"100230"},{"type":"FieldValue","id":"100231"},{"type":"FieldValue","id":"100232"},{"type":"FieldValue","id":"100233"},{"type":"FieldValue","id":"100234"},{"type":"FieldValue","id":"100235"},{"type":"FieldValue","id":"100236"},{"type":"FieldValue","id":"100237"},{"type":"FieldValue","id":"100238"},{"type":"FieldValue","id":"100239"},{"type":"FieldValue","id":"100240"},{"type":"FieldValue","id":"100241"},{"type":"FieldValue","id":"100242"},{"type":"FieldValue","id":"100243"},{"type":"FieldValue","id":"100244"},{"type":"FieldValue","id":"100245"},{"type":"FieldValue","id":"100246"},{"type":"FieldValue","id":"100247","value":"1617098820"},{"type":"FieldValue","id":"100248"},{"type":"FieldValue","id":"100249"},{"type":"FieldValue","id":"100250"},{"type":"FieldValue","id":"100251"},{"type":"FieldValue","id":"100252"},{"type":"FieldValue","id":"100253"},{"type":"FieldValue","id":"100254","value":"Quotation or purchase consultation"},{"type":"FieldValue","id":"100255","value":"6 Months ~ 9 Months"},{"type":"FieldValue","id":"100256","value":"Less than $100,000"},{"type":"FieldValue","id":"100257","value":"OLED Signage"},{"type":"FieldValue","id":"100258","value":"Curvable OLED Sigange"},{"type":"FieldValue","id":"100259"},{"type":"FieldValue","id":"100260","value":"Architect/Consultant"},{"type":"FieldValue","id":"100261","value":"Corporate"},{"type":"FieldValue","id":"100262"},{"type":"FieldValue","id":"100263"},{"type":"FieldValue","id":"100264"},{"type":"FieldValue","id":"100265"},{"type":"FieldValue","id":"100266"},{"type":"FieldValue","id":"100267"},{"type":"FieldValue","id":"100268"},{"type":"FieldValue","id":"100269"},{"type":"FieldValue","id":"100271"},{"type":"FieldValue","id":"100272"},{"type":"FieldValue","id":"100273"},{"type":"FieldValue","id":"100274"},{"type":"FieldValue","id":"100275"},{"type":"FieldValue","id":"100276"},{"type":"FieldValue","id":"100277"},{"type":"FieldValue","id":"100278"},{"type":"FieldValue","id":"100279"},{"type":"FieldValue","id":"100280"},{"type":"FieldValue","id":"100281"},{"type":"FieldValue","id":"100282"},{"type":"FieldValue","id":"100283"},{"type":"FieldValue","id":"100284"},{"type":"FieldValue","id":"100285"},{"type":"FieldValue","id":"100286"},{"type":"FieldValue","id":"100287"},{"type":"FieldValue","id":"100288"},{"type":"FieldValue","id":"100289"},{"type":"FieldValue","id":"100290"},{"type":"FieldValue","id":"100291"},{"type":"FieldValue","id":"100292"},{"type":"FieldValue","id":"100293"},{"type":"FieldValue","id":"100294"},{"type":"FieldValue","id":"100295","value":"Austria_ID"},{"type":"FieldValue","id":"100296"},{"type":"FieldValue","id":"100301"},{"type":"FieldValue","id":"100302"},{"type":"FieldValue","id":"100303"},{"type":"FieldValue","id":"100304"},{"type":"FieldValue","id":"100305","value":"Yes"},{"type":"FieldValue","id":"100306"},{"type":"FieldValue","id":"100307"},{"type":"FieldValue","id":"100309","value":"<ID_2021-03-30 06:07:00.000_Hello, we are a spatial design studio based in vienna. I am head of the design department and interested in realizing a project with curved oleds. 12 to 15pcs 55\" or similar. Maybe also one additional piece of transparent oled. I have seen your producs on fairs and on the web, but I find no reseller that has them avialable. Please contact me if and when these devices could be available to buy for us.\r\n\r\nKind regards, Achim> <ID_2021-03-30 06:07:00.000_Hello, we are a spatial design studio based in vienna. I am head of the design department and interested in realizing a project with curved oleds. 12 to 15pcs 55\" or similar. Maybe also one additional piece of transparent oled. I have seen your producs on fairs and on the web, but I find no reseller that has them avialable. Please contact me if and when these devices could be available to buy for us.\r\n\r\nKind regards, Achim> "},{"type":"FieldValue","id":"100311"},{"type":"FieldValue","id":"100315","value":"No"},{"type":"FieldValue","id":"100316","value":"No"},{"type":"FieldValue","id":"100317","value":"No"},{"type":"FieldValue","id":"100318","value":"No"},{"type":"FieldValue","id":"100319"},{"type":"FieldValue","id":"100320"},{"type":"FieldValue","id":"100321"},{"type":"FieldValue","id":"100322","value":"Arts and Design"},{"type":"FieldValue","id":"100323"},{"type":"FieldValue","id":"100324"},{"type":"FieldValue","id":"100325"},{"type":"FieldValue","id":"100326","value":"ID_HQ_LG.com_I2B , ID_HQ_LG.com_I2B , "},{"type":"FieldValue","id":"100327"},{"type":"FieldValue","id":"100328"},{"type":"FieldValue","id":"100329"},{"type":"FieldValue","id":"100330"},{"type":"FieldValue","id":"100331","value":"Y"},{"type":"FieldValue","id":"100332"},{"type":"FieldValue","id":"100333"},{"type":"FieldValue","id":"100334"},{"type":"FieldValue","id":"100335"},{"type":"FieldValue","id":"100336","value":"Contact"},{"type":"FieldValue","id":"100337","value":"MQL"},{"type":"FieldValue","id":"100338","value":"Contact"},{"type":"FieldValue","id":"100339","value":"Contact"},{"type":"FieldValue","id":"100340"},{"type":"FieldValue","id":"100341","value":"Contact"},{"type":"FieldValue","id":"100342","value":"Contact"},{"type":"FieldValue","id":"100343","value":"Contact"},{"type":"FieldValue","id":"100344"},{"type":"FieldValue","id":"100345","value":"Client interaction venue/space"},{"type":"FieldValue","id":"100346"},{"type":"FieldValue","id":"100347"},{"type":"FieldValue","id":"100348"},{"type":"FieldValue","id":"100349"},{"type":"FieldValue","id":"100350"},{"type":"FieldValue","id":"100351"},{"type":"FieldValue","id":"100352"},{"type":"FieldValue","id":"100353"},{"type":"FieldValue","id":"100354"},{"type":"FieldValue","id":"100355"},{"type":"FieldValue","id":"100356"},{"type":"FieldValue","id":"100357"},{"type":"FieldValue","id":"100358"},{"type":"FieldValue","id":"100359"},{"type":"FieldValue","id":"100360"},{"type":"FieldValue","id":"100361"},{"type":"FieldValue","id":"100362"},{"type":"FieldValue","id":"100363","value":"No"},{"type":"FieldValue","id":"100364"},{"type":"FieldValue","id":"100365"},{"type":"FieldValue","id":"100366"}],"firstName":"Achim","isBounceback":"false","isSubscribed":"true","lastName":"Stromberger","mobilePhone":"00436608172803","subscriptionDate":"1617098820"},{"type":"Contact","currentStatus":"Awaiting action","id":"530236","createdAt":"1617112772","depth":"complete","name":"jose.esquivel@ccoc.mil.co","updatedAt":"1617149301","accountName":"fuerzas militares","city":"bogota","country":"Colombia","emailAddress":"jose.esquivel@ccoc.mil.co","emailFormatPreference":"unspecified","fieldValues":[{"type":"FieldValue","id":"100005"},{"type":"FieldValue","id":"100017"},{"type":"FieldValue","id":"100023"},{"type":"FieldValue","id":"100024"},{"type":"FieldValue","id":"100032","value":"CLGEL000000530236"},{"type":"FieldValue","id":"100033"},{"type":"FieldValue","id":"100034"},{"type":"FieldValue","id":"100035"},{"type":"FieldValue","id":"100036"},{"type":"FieldValue","id":"100041"},{"type":"FieldValue","id":"100043"},{"type":"FieldValue","id":"100044"},{"type":"FieldValue","id":"100045"},{"type":"FieldValue","id":"100046"},{"type":"FieldValue","id":"100047"},{"type":"FieldValue","id":"100048"},{"type":"FieldValue","id":"100049"},{"type":"FieldValue","id":"100051"},{"type":"FieldValue","id":"100065"},{"type":"FieldValue","id":"100066"},{"type":"FieldValue","id":"100068"},{"type":"FieldValue","id":"100069","value":"Latin America and the Caribbean"},{"type":"FieldValue","id":"100072"},{"type":"FieldValue","id":"100081"},{"type":"FieldValue","id":"100171","value":"ccoc.mil.co"},{"type":"FieldValue","id":"100172","value":"jose esquivel"},{"type":"FieldValue","id":"100174"},{"type":"FieldValue","id":"100175"},{"type":"FieldValue","id":"100176"},{"type":"FieldValue","id":"100177"},{"type":"FieldValue","id":"100178"},{"type":"FieldValue","id":"100179"},{"type":"FieldValue","id":"100180"},{"type":"FieldValue","id":"100184"},{"type":"FieldValue","id":"100187"},{"type":"FieldValue","id":"100188"},{"type":"FieldValue","id":"100189"},{"type":"FieldValue","id":"100190"},{"type":"FieldValue","id":"100191"},{"type":"FieldValue","id":"100192"},{"type":"FieldValue","id":"100193"},{"type":"FieldValue","id":"100194","value":"joseesquivelL8RD4A"},{"type":"FieldValue","id":"100195"},{"type":"FieldValue","id":"100196","value":"CB"},{"type":"FieldValue","id":"100197"},{"type":"FieldValue","id":"100199","value":"1617112771"},{"type":"FieldValue","id":"100200","value":"1617112771"},{"type":"FieldValue","id":"100201","value":"1617112771"},{"type":"FieldValue","id":"100202","value":"LG.com"},{"type":"FieldValue","id":"100203","value":"ID_HQ_LG.com_I2B"},{"type":"FieldValue","id":"100205"},{"type":"FieldValue","id":"100206"},{"type":"FieldValue","id":"100208","value":"1617112771"},{"type":"FieldValue","id":"100209","value":"requerimos la compra de un video wall"},{"type":"FieldValue","id":"100210","value":"Yes"},{"type":"FieldValue","id":"100211","value":"Yes"},{"type":"FieldValue","id":"100212","value":"Yes"},{"type":"FieldValue","id":"100213","value":"Yes"},{"type":"FieldValue","id":"100214"},{"type":"FieldValue","id":"100215"},{"type":"FieldValue","id":"100216"},{"type":"FieldValue","id":"100219"},{"type":"FieldValue","id":"100220"},{"type":"FieldValue","id":"100221"},{"type":"FieldValue","id":"100222"},{"type":"FieldValue","id":"100223"},{"type":"FieldValue","id":"100224"},{"type":"FieldValue","id":"100225"},{"type":"FieldValue","id":"100226"},{"type":"FieldValue","id":"100227"},{"type":"FieldValue","id":"100228"},{"type":"FieldValue","id":"100229","value":"ID"},{"type":"FieldValue","id":"100230"},{"type":"FieldValue","id":"100231"},{"type":"FieldValue","id":"100232"},{"type":"FieldValue","id":"100233"},{"type":"FieldValue","id":"100234"},{"type":"FieldValue","id":"100235"},{"type":"FieldValue","id":"100236"},{"type":"FieldValue","id":"100237"},{"type":"FieldValue","id":"100238"},{"type":"FieldValue","id":"100239"},{"type":"FieldValue","id":"100240"},{"type":"FieldValue","id":"100241"},{"type":"FieldValue","id":"100242"},{"type":"FieldValue","id":"100243"},{"type":"FieldValue","id":"100244"},{"type":"FieldValue","id":"100245"},{"type":"FieldValue","id":"100246"},{"type":"FieldValue","id":"100247"},{"type":"FieldValue","id":"100248"},{"type":"FieldValue","id":"100249"},{"type":"FieldValue","id":"100250"},{"type":"FieldValue","id":"100251"},{"type":"FieldValue","id":"100252"},{"type":"FieldValue","id":"100253"},{"type":"FieldValue","id":"100254","value":"Quotation or purchase consultation"},{"type":"FieldValue","id":"100255","value":"N/A"},{"type":"FieldValue","id":"100256"},{"type":"FieldValue","id":"100257","value":"Video Wall Signage"},{"type":"FieldValue","id":"100258","value":"Ultra Narrow Bezel Video Wall"},{"type":"FieldValue","id":"100259","value":"55LV77D"},{"type":"FieldValue","id":"100260","value":"End-user"},{"type":"FieldValue","id":"100261","value":"Government Department"},{"type":"FieldValue","id":"100262","value":"Other"},{"type":"FieldValue","id":"100263"},{"type":"FieldValue","id":"100264"},{"type":"FieldValue","id":"100265"},{"type":"FieldValue","id":"100266"},{"type":"FieldValue","id":"100267"},{"type":"FieldValue","id":"100268"},{"type":"FieldValue","id":"100269"},{"type":"FieldValue","id":"100271"},{"type":"FieldValue","id":"100272"},{"type":"FieldValue","id":"100273"},{"type":"FieldValue","id":"100274"},{"type":"FieldValue","id":"100275"},{"type":"FieldValue","id":"100276"},{"type":"FieldValue","id":"100277"},{"type":"FieldValue","id":"100278"},{"type":"FieldValue","id":"100279"},{"type":"FieldValue","id":"100280"},{"type":"FieldValue","id":"100281"},{"type":"FieldValue","id":"100282"},{"type":"FieldValue","id":"100283"},{"type":"FieldValue","id":"100284"},{"type":"FieldValue","id":"100285"},{"type":"FieldValue","id":"100286"},{"type":"FieldValue","id":"100287"},{"type":"FieldValue","id":"100288"},{"type":"FieldValue","id":"100289"},{"type":"FieldValue","id":"100290"},{"type":"FieldValue","id":"100291"},{"type":"FieldValue","id":"100292"},{"type":"FieldValue","id":"100293"},{"type":"FieldValue","id":"100294"},{"type":"FieldValue","id":"100295","value":"Colombia_ID"},{"type":"FieldValue","id":"100296"},{"type":"FieldValue","id":"100301"},{"type":"FieldValue","id":"100302"},{"type":"FieldValue","id":"100303"},{"type":"FieldValue","id":"100304"},{"type":"FieldValue","id":"100305","value":"Yes"},{"type":"FieldValue","id":"100306"},{"type":"FieldValue","id":"100307"},{"type":"FieldValue","id":"100309","value":"<ID_2021-03-30 09:59:31.000_requerimos la compra de un video wall> <ID_2021-03-30 09:59:31.000_requerimos la compra de un video wall> "},{"type":"FieldValue","id":"100311"},{"type":"FieldValue","id":"100315","value":"No"},{"type":"FieldValue","id":"100316","value":"No"},{"type":"FieldValue","id":"100317","value":"No"},{"type":"FieldValue","id":"100318","value":"No"},{"type":"FieldValue","id":"100319"},{"type":"FieldValue","id":"100320"},{"type":"FieldValue","id":"100321"},{"type":"FieldValue","id":"100322","value":"Military and Protective Services"},{"type":"FieldValue","id":"100323"},{"type":"FieldValue","id":"100324"},{"type":"FieldValue","id":"100325"},{"type":"FieldValue","id":"100326","value":"ID_HQ_LG.com_I2B , ID_HQ_LG.com_I2B , "},{"type":"FieldValue","id":"100327"},{"type":"FieldValue","id":"100328"},{"type":"FieldValue","id":"100329"},{"type":"FieldValue","id":"100330"},{"type":"FieldValue","id":"100331","value":"Y"},{"type":"FieldValue","id":"100332"},{"type":"FieldValue","id":"100333"},{"type":"FieldValue","id":"100334"},{"type":"FieldValue","id":"100335"},{"type":"FieldValue","id":"100336","value":"Contact"},{"type":"FieldValue","id":"100337","value":"MQL"},{"type":"FieldValue","id":"100338","value":"Contact"},{"type":"FieldValue","id":"100339","value":"Contact"},{"type":"FieldValue","id":"100340"},{"type":"FieldValue","id":"100341","value":"Contact"},{"type":"FieldValue","id":"100342","value":"Contact"},{"type":"FieldValue","id":"100343","value":"Contact"},{"type":"FieldValue","id":"100344"},{"type":"FieldValue","id":"100345","value":"Military"},{"type":"FieldValue","id":"100346"},{"type":"FieldValue","id":"100347"},{"type":"FieldValue","id":"100348"},{"type":"FieldValue","id":"100349"},{"type":"FieldValue","id":"100350"},{"type":"FieldValue","id":"100351"},{"type":"FieldValue","id":"100352"},{"type":"FieldValue","id":"100353"},{"type":"FieldValue","id":"100354"},{"type":"FieldValue","id":"100355"},{"type":"FieldValue","id":"100356"},{"type":"FieldValue","id":"100357"},{"type":"FieldValue","id":"100358"},{"type":"FieldValue","id":"100359"},{"type":"FieldValue","id":"100360"},{"type":"FieldValue","id":"100361"},{"type":"FieldValue","id":"100362"},{"type":"FieldValue","id":"100363","value":"No"},{"type":"FieldValue","id":"100364"},{"type":"FieldValue","id":"100365"},{"type":"FieldValue","id":"100366"}],"firstName":"jose","isBounceback":"false","isSubscribed":"true","lastName":"esquivel","mobilePhone":"3203946230","subscriptionDate":"1617112772"},{"type":"Contact","currentStatus":"Awaiting action","id":"530238","createdAt":"1617114213","depth":"complete","name":"asha.k@gmail.com","updatedAt":"1617149153","accountName":"own business","country":"Jordan","emailAddress":"asha.k@gmail.com","emailFormatPreference":"unspecified","fieldValues":[{"type":"FieldValue","id":"100005"},{"type":"FieldValue","id":"100017"},{"type":"FieldValue","id":"100023"},{"type":"FieldValue","id":"100024"},{"type":"FieldValue","id":"100032","value":"CLGEL000000530238"},{"type":"FieldValue","id":"100033"},{"type":"FieldValue","id":"100034"},{"type":"FieldValue","id":"100035"},{"type":"FieldValue","id":"100036"},{"type":"FieldValue","id":"100041"},{"type":"FieldValue","id":"100043"},{"type":"FieldValue","id":"100044"},{"type":"FieldValue","id":"100045"},{"type":"FieldValue","id":"100046"},{"type":"FieldValue","id":"100047"},{"type":"FieldValue","id":"100048"},{"type":"FieldValue","id":"100049"},{"type":"FieldValue","id":"100051"},{"type":"FieldValue","id":"100065"},{"type":"FieldValue","id":"100066"},{"type":"FieldValue","id":"100068"},{"type":"FieldValue","id":"100069","value":"Middle East & Africa"},{"type":"FieldValue","id":"100072"},{"type":"FieldValue","id":"100081"},{"type":"FieldValue","id":"100171","value":"gmail.com"},{"type":"FieldValue","id":"100172","value":"Asha Kapoor"},{"type":"FieldValue","id":"100174"},{"type":"FieldValue","id":"100175"},{"type":"FieldValue","id":"100176"},{"type":"FieldValue","id":"100177"},{"type":"FieldValue","id":"100178"},{"type":"FieldValue","id":"100179"},{"type":"FieldValue","id":"100180"},{"type":"FieldValue","id":"100184"},{"type":"FieldValue","id":"100187"},{"type":"FieldValue","id":"100188"},{"type":"FieldValue","id":"100189"},{"type":"FieldValue","id":"100190"},{"type":"FieldValue","id":"100191"},{"type":"FieldValue","id":"100192"},{"type":"FieldValue","id":"100193"},{"type":"FieldValue","id":"100194","value":"AshaKapoorL8RD4H"},{"type":"FieldValue","id":"100195"},{"type":"FieldValue","id":"100196","value":"LF"},{"type":"FieldValue","id":"100197"},{"type":"FieldValue","id":"100199","value":"1617114213"},{"type":"FieldValue","id":"100200","value":"1617114213"},{"type":"FieldValue","id":"100201","value":"1617114213"},{"type":"FieldValue","id":"100202","value":"C-display"},{"type":"FieldValue","id":"100203","value":"ID_HQ_Cdisplay_I2B"},{"type":"FieldValue","id":"100205"},{"type":"FieldValue","id":"100206"},{"type":"FieldValue","id":"100208","value":"1617114213"},{"type":"FieldValue","id":"100209","value":"interested for our personal business. how much is the price range for 1 unit?"},{"type":"FieldValue","id":"100210","value":"Yes"},{"type":"FieldValue","id":"100211","value":"Yes"},{"type":"FieldValue","id":"100212","value":"Yes"},{"type":"FieldValue","id":"100213","value":"Yes"},{"type":"FieldValue","id":"100214"},{"type":"FieldValue","id":"100215"},{"type":"FieldValue","id":"100216"},{"type":"FieldValue","id":"100219"},{"type":"FieldValue","id":"100220"},{"type":"FieldValue","id":"100221"},{"type":"FieldValue","id":"100222"},{"type":"FieldValue","id":"100223"},{"type":"FieldValue","id":"100224"},{"type":"FieldValue","id":"100225"},{"type":"FieldValue","id":"100226"},{"type":"FieldValue","id":"100227"},{"type":"FieldValue","id":"100228"},{"type":"FieldValue","id":"100229","value":"ID"},{"type":"FieldValue","id":"100230"},{"type":"FieldValue","id":"100231"},{"type":"FieldValue","id":"100232"},{"type":"FieldValue","id":"100233"},{"type":"FieldValue","id":"100234"},{"type":"FieldValue","id":"100235"},{"type":"FieldValue","id":"100236"},{"type":"FieldValue","id":"100237"},{"type":"FieldValue","id":"100238"},{"type":"FieldValue","id":"100239"},{"type":"FieldValue","id":"100240"},{"type":"FieldValue","id":"100241"},{"type":"FieldValue","id":"100242"},{"type":"FieldValue","id":"100243"},{"type":"FieldValue","id":"100244"},{"type":"FieldValue","id":"100245"},{"type":"FieldValue","id":"100246"},{"type":"FieldValue","id":"100247"},{"type":"FieldValue","id":"100248"},{"type":"FieldValue","id":"100249"},{"type":"FieldValue","id":"100250"},{"type":"FieldValue","id":"100251"},{"type":"FieldValue","id":"100252"},{"type":"FieldValue","id":"100253"},{"type":"FieldValue","id":"100254","value":"Quotation or purchase consultation"},{"type":"FieldValue","id":"100255","value":"3 Months ~ 6 Months"},{"type":"FieldValue","id":"100256"},{"type":"FieldValue","id":"100257","value":"OLED Signage"},{"type":"FieldValue","id":"100258","value":"Curvable OLED Signage"},{"type":"FieldValue","id":"100259","value":"55EF5G-P"},{"type":"FieldValue","id":"100260","value":"End-user"},{"type":"FieldValue","id":"100261"},{"type":"FieldValue","id":"100262","value":"Manager"},{"type":"FieldValue","id":"100263"},{"type":"FieldValue","id":"100264"},{"type":"FieldValue","id":"100265"},{"type":"FieldValue","id":"100266"},{"type":"FieldValue","id":"100267"},{"type":"FieldValue","id":"100268"},{"type":"FieldValue","id":"100269"},{"type":"FieldValue","id":"100271"},{"type":"FieldValue","id":"100272"},{"type":"FieldValue","id":"100273"},{"type":"FieldValue","id":"100274"},{"type":"FieldValue","id":"100275"},{"type":"FieldValue","id":"100276"},{"type":"FieldValue","id":"100277"},{"type":"FieldValue","id":"100278"},{"type":"FieldValue","id":"100279"},{"type":"FieldValue","id":"100280"},{"type":"FieldValue","id":"100281"},{"type":"FieldValue","id":"100282"},{"type":"FieldValue","id":"100283"},{"type":"FieldValue","id":"100284"},{"type":"FieldValue","id":"100285"},{"type":"FieldValue","id":"100286"},{"type":"FieldValue","id":"100287"},{"type":"FieldValue","id":"100288"},{"type":"FieldValue","id":"100289"},{"type":"FieldValue","id":"100290"},{"type":"FieldValue","id":"100291"},{"type":"FieldValue","id":"100292"},{"type":"FieldValue","id":"100293"},{"type":"FieldValue","id":"100294"},{"type":"FieldValue","id":"100295","value":"Jordan_ID"},{"type":"FieldValue","id":"100296"},{"type":"FieldValue","id":"100301"},{"type":"FieldValue","id":"100302"},{"type":"FieldValue","id":"100303"},{"type":"FieldValue","id":"100304"},{"type":"FieldValue","id":"100305","value":"No"},{"type":"FieldValue","id":"100306"},{"type":"FieldValue","id":"100307"},{"type":"FieldValue","id":"100309","value":"<ID_2021-03-30 10:23:33.000_interested for our personal business. how much is the price range for 1 unit?> <ID_2021-03-30 10:23:33.000_interested for our personal business. how much is the price range for 1 unit?> "},{"type":"FieldValue","id":"100311"},{"type":"FieldValue","id":"100315","value":"No"},{"type":"FieldValue","id":"100316","value":"No"},{"type":"FieldValue","id":"100317","value":"No"},{"type":"FieldValue","id":"100318","value":"No"},{"type":"FieldValue","id":"100319"},{"type":"FieldValue","id":"100320"},{"type":"FieldValue","id":"100321"},{"type":"FieldValue","id":"100322","value":"Consulting"},{"type":"FieldValue","id":"100323"},{"type":"FieldValue","id":"100324"},{"type":"FieldValue","id":"100325"},{"type":"FieldValue","id":"100326","value":"ID_HQ_Cdisplay_I2B , ID_HQ_Cdisplay_I2B , "},{"type":"FieldValue","id":"100327"},{"type":"FieldValue","id":"100328"},{"type":"FieldValue","id":"100329"},{"type":"FieldValue","id":"100330"},{"type":"FieldValue","id":"100331","value":"Y"},{"type":"FieldValue","id":"100332"},{"type":"FieldValue","id":"100333"},{"type":"FieldValue","id":"100334"},{"type":"FieldValue","id":"100335"},{"type":"FieldValue","id":"100336","value":"Contact"},{"type":"FieldValue","id":"100337","value":"MQL"},{"type":"FieldValue","id":"100338","value":"Contact"},{"type":"FieldValue","id":"100339","value":"Contact"},{"type":"FieldValue","id":"100340"},{"type":"FieldValue","id":"100341","value":"Contact"},{"type":"FieldValue","id":"100342","value":"Contact"},{"type":"FieldValue","id":"100343","value":"Contact"},{"type":"FieldValue","id":"100344"},{"type":"FieldValue","id":"100345"},{"type":"FieldValue","id":"100346"},{"type":"FieldValue","id":"100347"},{"type":"FieldValue","id":"100348"},{"type":"FieldValue","id":"100349"},{"type":"FieldValue","id":"100350"},{"type":"FieldValue","id":"100351"},{"type":"FieldValue","id":"100352"},{"type":"FieldValue","id":"100353"},{"type":"FieldValue","id":"100354"},{"type":"FieldValue","id":"100355"},{"type":"FieldValue","id":"100356"},{"type":"FieldValue","id":"100357"},{"type":"FieldValue","id":"100358"},{"type":"FieldValue","id":"100359"},{"type":"FieldValue","id":"100360"},{"type":"FieldValue","id":"100361"},{"type":"FieldValue","id":"100362"},{"type":"FieldValue","id":"100363","value":"No"},{"type":"FieldValue","id":"100364"},{"type":"FieldValue","id":"100365"},{"type":"FieldValue","id":"100366"}],"firstName":"Asha","isBounceback":"false","isSubscribed":"true","lastName":"Kapoor","subscriptionDate":"1617114213"},{"type":"Contact","currentStatus":"Awaiting action","id":"530277","createdAt":"1617134240","depth":"complete","name":"jerry.wengert@rcsinnovations.com","updatedAt":"1617149189","accountName":"RCS Innovations ","country":"Canada","emailAddress":"jerry.wengert@rcsinnovations.com","emailFormatPreference":"unspecified","fieldValues":[{"type":"FieldValue","id":"100005"},{"type":"FieldValue","id":"100017"},{"type":"FieldValue","id":"100023"},{"type":"FieldValue","id":"100024"},{"type":"FieldValue","id":"100032","value":"CLGEL000000530277"},{"type":"FieldValue","id":"100033"},{"type":"FieldValue","id":"100034"},{"type":"FieldValue","id":"100035"},{"type":"FieldValue","id":"100036"},{"type":"FieldValue","id":"100041"},{"type":"FieldValue","id":"100043"},{"type":"FieldValue","id":"100044"},{"type":"FieldValue","id":"100045"},{"type":"FieldValue","id":"100046"},{"type":"FieldValue","id":"100047"},{"type":"FieldValue","id":"100048"},{"type":"FieldValue","id":"100049"},{"type":"FieldValue","id":"100051"},{"type":"FieldValue","id":"100065"},{"type":"FieldValue","id":"100066"},{"type":"FieldValue","id":"100068"},{"type":"FieldValue","id":"100069","value":"North America"},{"type":"FieldValue","id":"100072"},{"type":"FieldValue","id":"100081"},{"type":"FieldValue","id":"100171","value":"rcsinnovations.com"},{"type":"FieldValue","id":"100172","value":"Jerry Wengert"},{"type":"FieldValue","id":"100174"},{"type":"FieldValue","id":"100175"},{"type":"FieldValue","id":"100176"},{"type":"FieldValue","id":"100177"},{"type":"FieldValue","id":"100178"},{"type":"FieldValue","id":"100179"},{"type":"FieldValue","id":"100180"},{"type":"FieldValue","id":"100184"},{"type":"FieldValue","id":"100187"},{"type":"FieldValue","id":"100188"},{"type":"FieldValue","id":"100189"},{"type":"FieldValue","id":"100190"},{"type":"FieldValue","id":"100191"},{"type":"FieldValue","id":"100192"},{"type":"FieldValue","id":"100193"},{"type":"FieldValue","id":"100194","value":"JerryWengertL8RDKE"},{"type":"FieldValue","id":"100195"},{"type":"FieldValue","id":"100196","value":"CI"},{"type":"FieldValue","id":"100197"},{"type":"FieldValue","id":"100199","value":"1617134240"},{"type":"FieldValue","id":"100200","value":"1617134240"},{"type":"FieldValue","id":"100201","value":"1617134240"},{"type":"FieldValue","id":"100202","value":"C-display"},{"type":"FieldValue","id":"100203","value":"ID_HQ_Cdisplay_I2B"},{"type":"FieldValue","id":"100205"},{"type":"FieldValue","id":"100206"},{"type":"FieldValue","id":"100208","value":"1617134240"},{"type":"FieldValue","id":"100209","value":"We are interested in learning more about using Transparent OLED Signage for retail applications. What are the smallest sizes available and what is the rough pricing expectations for quantities of 500 to 1000 at a time? We are also interest in ease of programing and potential AR applications. Thank you! "},{"type":"FieldValue","id":"100210","value":"Yes"},{"type":"FieldValue","id":"100211","value":"Yes"},{"type":"FieldValue","id":"100212","value":"Yes"},{"type":"FieldValue","id":"100213","value":"Yes"},{"type":"FieldValue","id":"100214"},{"type":"FieldValue","id":"100215"},{"type":"FieldValue","id":"100216"},{"type":"FieldValue","id":"100219"},{"type":"FieldValue","id":"100220"},{"type":"FieldValue","id":"100221"},{"type":"FieldValue","id":"100222"},{"type":"FieldValue","id":"100223"},{"type":"FieldValue","id":"100224"},{"type":"FieldValue","id":"100225"},{"type":"FieldValue","id":"100226"},{"type":"FieldValue","id":"100227"},{"type":"FieldValue","id":"100228"},{"type":"FieldValue","id":"100229","value":"ID"},{"type":"FieldValue","id":"100230"},{"type":"FieldValue","id":"100231"},{"type":"FieldValue","id":"100232"},{"type":"FieldValue","id":"100233"},{"type":"FieldValue","id":"100234"},{"type":"FieldValue","id":"100235"},{"type":"FieldValue","id":"100236"},{"type":"FieldValue","id":"100237"},{"type":"FieldValue","id":"100238"},{"type":"FieldValue","id":"100239"},{"type":"FieldValue","id":"100240"},{"type":"FieldValue","id":"100241"},{"type":"FieldValue","id":"100242"},{"type":"FieldValue","id":"100243"},{"type":"FieldValue","id":"100244"},{"type":"FieldValue","id":"100245"},{"type":"FieldValue","id":"100246"},{"type":"FieldValue","id":"100247"},{"type":"FieldValue","id":"100248"},{"type":"FieldValue","id":"100249"},{"type":"FieldValue","id":"100250"},{"type":"FieldValue","id":"100251"},{"type":"FieldValue","id":"100252"},{"type":"FieldValue","id":"100253"},{"type":"FieldValue","id":"100254","value":"Quotation or purchase consultation"},{"type":"FieldValue","id":"100255","value":"Less than 3 Months"},{"type":"FieldValue","id":"100256","value":"Less than $100,000"},{"type":"FieldValue","id":"100257","value":"OLED Signage"},{"type":"FieldValue","id":"100258","value":"Transparent OLED Signage"},{"type":"FieldValue","id":"100259"},{"type":"FieldValue","id":"100260","value":"Reseller"},{"type":"FieldValue","id":"100261","value":"Retail"},{"type":"FieldValue","id":"100262","value":"Vice President"},{"type":"FieldValue","id":"100263"},{"type":"FieldValue","id":"100264"},{"type":"FieldValue","id":"100265"},{"type":"FieldValue","id":"100266"},{"type":"FieldValue","id":"100267"},{"type":"FieldValue","id":"100268"},{"type":"FieldValue","id":"100269"},{"type":"FieldValue","id":"100271"},{"type":"FieldValue","id":"100272"},{"type":"FieldValue","id":"100273"},{"type":"FieldValue","id":"100274"},{"type":"FieldValue","id":"100275"},{"type":"FieldValue","id":"100276"},{"type":"FieldValue","id":"100277"},{"type":"FieldValue","id":"100278"},{"type":"FieldValue","id":"100279"},{"type":"FieldValue","id":"100280"},{"type":"FieldValue","id":"100281"},{"type":"FieldValue","id":"100282"},{"type":"FieldValue","id":"100283"},{"type":"FieldValue","id":"100284"},{"type":"FieldValue","id":"100285"},{"type":"FieldValue","id":"100286"},{"type":"FieldValue","id":"100287"},{"type":"FieldValue","id":"100288"},{"type":"FieldValue","id":"100289"},{"type":"FieldValue","id":"100290"},{"type":"FieldValue","id":"100291"},{"type":"FieldValue","id":"100292"},{"type":"FieldValue","id":"100293"},{"type":"FieldValue","id":"100294"},{"type":"FieldValue","id":"100295","value":"Canada_ID"},{"type":"FieldValue","id":"100296"},{"type":"FieldValue","id":"100301"},{"type":"FieldValue","id":"100302"},{"type":"FieldValue","id":"100303"},{"type":"FieldValue","id":"100304"},{"type":"FieldValue","id":"100305","value":"No"},{"type":"FieldValue","id":"100306"},{"type":"FieldValue","id":"100307"},{"type":"FieldValue","id":"100309","value":"<ID_2021-03-30 15:57:20.000_We are interested in learning more about using Transparent OLED Signage for retail applications. What are the smallest sizes available and what is the rough pricing expectations for quantities of 500 to 1000 at a time? We are also interest in ease of programing and potential AR applications. Thank you! > <ID_2021-03-30 15:57:20.000_We are interested in learning more about using Transparent OLED Signage for retail applications. What are the smallest sizes available and what is the rough pricing expectations for quantities of 500 to 1000 at a time? We are also interest in ease of programing and potential AR applications. Thank you! > "},{"type":"FieldValue","id":"100311"},{"type":"FieldValue","id":"100315","value":"No"},{"type":"FieldValue","id":"100316","value":"No"},{"type":"FieldValue","id":"100317","value":"No"},{"type":"FieldValue","id":"100318","value":"No"},{"type":"FieldValue","id":"100319"},{"type":"FieldValue","id":"100320"},{"type":"FieldValue","id":"100321"},{"type":"FieldValue","id":"100322","value":"Sales"},{"type":"FieldValue","id":"100323"},{"type":"FieldValue","id":"100324"},{"type":"FieldValue","id":"100325"},{"type":"FieldValue","id":"100326","value":"ID_HQ_Cdisplay_I2B , ID_HQ_Cdisplay_I2B , "},{"type":"FieldValue","id":"100327"},{"type":"FieldValue","id":"100328"},{"type":"FieldValue","id":"100329"},{"type":"FieldValue","id":"100330"},{"type":"FieldValue","id":"100331","value":"Y"},{"type":"FieldValue","id":"100332"},{"type":"FieldValue","id":"100333"},{"type":"FieldValue","id":"100334"},{"type":"FieldValue","id":"100335"},{"type":"FieldValue","id":"100336","value":"Contact"},{"type":"FieldValue","id":"100337","value":"MQL"},{"type":"FieldValue","id":"100338","value":"Contact"},{"type":"FieldValue","id":"100339","value":"Contact"},{"type":"FieldValue","id":"100340"},{"type":"FieldValue","id":"100341","value":"Contact"},{"type":"FieldValue","id":"100342","value":"Contact"},{"type":"FieldValue","id":"100343","value":"Contact"},{"type":"FieldValue","id":"100344"},{"type":"FieldValue","id":"100345"},{"type":"FieldValue","id":"100346","value":"Other Stores"},{"type":"FieldValue","id":"100347"},{"type":"FieldValue","id":"100348"},{"type":"FieldValue","id":"100349"},{"type":"FieldValue","id":"100350"},{"type":"FieldValue","id":"100351"},{"type":"FieldValue","id":"100352"},{"type":"FieldValue","id":"100353"},{"type":"FieldValue","id":"100354"},{"type":"FieldValue","id":"100355"},{"type":"FieldValue","id":"100356"},{"type":"FieldValue","id":"100357"},{"type":"FieldValue","id":"100358"},{"type":"FieldValue","id":"100359"},{"type":"FieldValue","id":"100360"},{"type":"FieldValue","id":"100361"},{"type":"FieldValue","id":"100362"},{"type":"FieldValue","id":"100363","value":"No"},{"type":"FieldValue","id":"100364"},{"type":"FieldValue","id":"100365"},{"type":"FieldValue","id":"100366"}],"firstName":"Jerry","isBounceback":"false","isSubscribed":"true","lastName":"Wengert","mobilePhone":"9728000914","subscriptionDate":"1617134240"},{"type":"Contact","currentStatus":"Awaiting action","id":"530282","createdAt":"1617135897","depth":"complete","name":"ronanodonoghue@icloud.com","updatedAt":"1617149301","accountName":"Granary Dental","city":"Cork ","country":"Ireland","emailAddress":"ronanodonoghue@icloud.com","emailFormatPreference":"unspecified","fieldValues":[{"type":"FieldValue","id":"100005"},{"type":"FieldValue","id":"100017"},{"type":"FieldValue","id":"100023"},{"type":"FieldValue","id":"100024"},{"type":"FieldValue","id":"100032","value":"CLGEL000000530282"},{"type":"FieldValue","id":"100033"},{"type":"FieldValue","id":"100034"},{"type":"FieldValue","id":"100035"},{"type":"FieldValue","id":"100036"},{"type":"FieldValue","id":"100041"},{"type":"FieldValue","id":"100043"},{"type":"FieldValue","id":"100044"},{"type":"FieldValue","id":"100045"},{"type":"FieldValue","id":"100046"},{"type":"FieldValue","id":"100047"},{"type":"FieldValue","id":"100048"},{"type":"FieldValue","id":"100049"},{"type":"FieldValue","id":"100051"},{"type":"FieldValue","id":"100065"},{"type":"FieldValue","id":"100066"},{"type":"FieldValue","id":"100068"},{"type":"FieldValue","id":"100069","value":"Europe"},{"type":"FieldValue","id":"100072"},{"type":"FieldValue","id":"100081"},{"type":"FieldValue","id":"100171","value":"icloud.com"},{"type":"FieldValue","id":"100172","value":"Ronan O Donoghue"},{"type":"FieldValue","id":"100174"},{"type":"FieldValue","id":"100175"},{"type":"FieldValue","id":"100176"},{"type":"FieldValue","id":"100177"},{"type":"FieldValue","id":"100178"},{"type":"FieldValue","id":"100179"},{"type":"FieldValue","id":"100180"},{"type":"FieldValue","id":"100184"},{"type":"FieldValue","id":"100187"},{"type":"FieldValue","id":"100188"},{"type":"FieldValue","id":"100189"},{"type":"FieldValue","id":"100190"},{"type":"FieldValue","id":"100191"},{"type":"FieldValue","id":"100192"},{"type":"FieldValue","id":"100193"},{"type":"FieldValue","id":"100194","value":"RonanODonoghueL8RDML"},{"type":"FieldValue","id":"100195"},{"type":"FieldValue","id":"100196","value":"UK"},{"type":"FieldValue","id":"100197"},{"type":"FieldValue","id":"100199","value":"1617135897"},{"type":"FieldValue","id":"100200","value":"1617135897"},{"type":"FieldValue","id":"100201","value":"1617135897"},{"type":"FieldValue","id":"100202","value":"LG.com"},{"type":"FieldValue","id":"100203","value":"ID_HQ_LG.com_I2B"},{"type":"FieldValue","id":"100205"},{"type":"FieldValue","id":"100206"},{"type":"FieldValue","id":"100208","value":"1617135897"},{"type":"FieldValue","id":"100209","value":"Need tv to replace 42ly540h"},{"type":"FieldValue","id":"100210","value":"Yes"},{"type":"FieldValue","id":"100211","value":"Yes"},{"type":"FieldValue","id":"100212","value":"Yes"},{"type":"FieldValue","id":"100213","value":"Yes"},{"type":"FieldValue","id":"100214"},{"type":"FieldValue","id":"100215"},{"type":"FieldValue","id":"100216"},{"type":"FieldValue","id":"100219"},{"type":"FieldValue","id":"100220"},{"type":"FieldValue","id":"100221"},{"type":"FieldValue","id":"100222"},{"type":"FieldValue","id":"100223"},{"type":"FieldValue","id":"100224"},{"type":"FieldValue","id":"100225"},{"type":"FieldValue","id":"100226"},{"type":"FieldValue","id":"100227"},{"type":"FieldValue","id":"100228"},{"type":"FieldValue","id":"100229","value":"ID"},{"type":"FieldValue","id":"100230"},{"type":"FieldValue","id":"100231"},{"type":"FieldValue","id":"100232"},{"type":"FieldValue","id":"100233"},{"type":"FieldValue","id":"100234"},{"type":"FieldValue","id":"100235"},{"type":"FieldValue","id":"100236"},{"type":"FieldValue","id":"100237"},{"type":"FieldValue","id":"100238"},{"type":"FieldValue","id":"100239"},{"type":"FieldValue","id":"100240"},{"type":"FieldValue","id":"100241"},{"type":"FieldValue","id":"100242"},{"type":"FieldValue","id":"100243"},{"type":"FieldValue","id":"100244"},{"type":"FieldValue","id":"100245"},{"type":"FieldValue","id":"100246"},{"type":"FieldValue","id":"100247"},{"type":"FieldValue","id":"100248"},{"type":"FieldValue","id":"100249"},{"type":"FieldValue","id":"100250"},{"type":"FieldValue","id":"100251"},{"type":"FieldValue","id":"100252"},{"type":"FieldValue","id":"100253"},{"type":"FieldValue","id":"100254","value":"Quotation or purchase consultation"},{"type":"FieldValue","id":"100255","value":"N/A"},{"type":"FieldValue","id":"100256","value":"N/A"},{"type":"FieldValue","id":"100257","value":"Hotel TV"},{"type":"FieldValue","id":"100258"},{"type":"FieldValue","id":"100259"},{"type":"FieldValue","id":"100260","value":"Architect/Consultant"},{"type":"FieldValue","id":"100261","value":"Special purpose"},{"type":"FieldValue","id":"100262"},{"type":"FieldValue","id":"100263"},{"type":"FieldValue","id":"100264"},{"type":"FieldValue","id":"100265"},{"type":"FieldValue","id":"100266"},{"type":"FieldValue","id":"100267"},{"type":"FieldValue","id":"100268"},{"type":"FieldValue","id":"100269"},{"type":"FieldValue","id":"100271"},{"type":"FieldValue","id":"100272"},{"type":"FieldValue","id":"100273"},{"type":"FieldValue","id":"100274"},{"type":"FieldValue","id":"100275"},{"type":"FieldValue","id":"100276"},{"type":"FieldValue","id":"100277"},{"type":"FieldValue","id":"100278"},{"type":"FieldValue","id":"100279"},{"type":"FieldValue","id":"100280"},{"type":"FieldValue","id":"100281"},{"type":"FieldValue","id":"100282"},{"type":"FieldValue","id":"100283"},{"type":"FieldValue","id":"100284"},{"type":"FieldValue","id":"100285"},{"type":"FieldValue","id":"100286"},{"type":"FieldValue","id":"100287"},{"type":"FieldValue","id":"100288"},{"type":"FieldValue","id":"100289"},{"type":"FieldValue","id":"100290"},{"type":"FieldValue","id":"100291"},{"type":"FieldValue","id":"100292"},{"type":"FieldValue","id":"100293"},{"type":"FieldValue","id":"100294"},{"type":"FieldValue","id":"100295","value":"Ireland_ID"},{"type":"FieldValue","id":"100296"},{"type":"FieldValue","id":"100301"},{"type":"FieldValue","id":"100302"},{"type":"FieldValue","id":"100303"},{"type":"FieldValue","id":"100304"},{"type":"FieldValue","id":"100305","value":"Yes"},{"type":"FieldValue","id":"100306"},{"type":"FieldValue","id":"100307"},{"type":"FieldValue","id":"100309","value":"<ID_2021-03-30 16:24:57.000_Need tv to replace 42ly540h> <ID_2021-03-30 16:24:57.000_Need tv to replace 42ly540h> "},{"type":"FieldValue","id":"100311"},{"type":"FieldValue","id":"100315","value":"No"},{"type":"FieldValue","id":"100316","value":"No"},{"type":"FieldValue","id":"100317","value":"No"},{"type":"FieldValue","id":"100318","value":"No"},{"type":"FieldValue","id":"100319"},{"type":"FieldValue","id":"100320"},{"type":"FieldValue","id":"100321"},{"type":"FieldValue","id":"100322","value":"Administrative"},{"type":"FieldValue","id":"100323"},{"type":"FieldValue","id":"100324"},{"type":"FieldValue","id":"100325"},{"type":"FieldValue","id":"100326","value":"ID_HQ_LG.com_I2B , ID_HQ_LG.com_I2B , "},{"type":"FieldValue","id":"100327"},{"type":"FieldValue","id":"100328"},{"type":"FieldValue","id":"100329"},{"type":"FieldValue","id":"100330"},{"type":"FieldValue","id":"100331","value":"Y"},{"type":"FieldValue","id":"100332"},{"type":"FieldValue","id":"100333"},{"type":"FieldValue","id":"100334"},{"type":"FieldValue","id":"100335"},{"type":"FieldValue","id":"100336","value":"Contact"},{"type":"FieldValue","id":"100337","value":"MQL"},{"type":"FieldValue","id":"100338","value":"Contact"},{"type":"FieldValue","id":"100339","value":"Contact"},{"type":"FieldValue","id":"100340"},{"type":"FieldValue","id":"100341","value":"Contact"},{"type":"FieldValue","id":"100342","value":"Contact"},{"type":"FieldValue","id":"100343","value":"Contact"},{"type":"FieldValue","id":"100344"},{"type":"FieldValue","id":"100345"},{"type":"FieldValue","id":"100346"},{"type":"FieldValue","id":"100347"},{"type":"FieldValue","id":"100348"},{"type":"FieldValue","id":"100349"},{"type":"FieldValue","id":"100350"},{"type":"FieldValue","id":"100351"},{"type":"FieldValue","id":"100352"},{"type":"FieldValue","id":"100353"},{"type":"FieldValue","id":"100354"},{"type":"FieldValue","id":"100355"},{"type":"FieldValue","id":"100356"},{"type":"FieldValue","id":"100357"},{"type":"FieldValue","id":"100358"},{"type":"FieldValue","id":"100359"},{"type":"FieldValue","id":"100360"},{"type":"FieldValue","id":"100361"},{"type":"FieldValue","id":"100362"},{"type":"FieldValue","id":"100363","value":"No"},{"type":"FieldValue","id":"100364"},{"type":"FieldValue","id":"100365"},{"type":"FieldValue","id":"100366"}],"firstName":"Ronan","isBounceback":"false","isSubscribed":"true","lastName":"O Donoghue ","mobilePhone":"00353877451745","subscriptionDate":"1617135897"},{"type":"Contact","currentStatus":"Awaiting action","id":"530289","createdAt":"1617144408","depth":"complete","name":"jellyfishmedia@mail.com","updatedAt":"1617149373","accountName":"jellyfish media limited","city":"Toronto","country":"Canada","emailAddress":"jellyfishmedia@mail.com","emailFormatPreference":"unspecified","fieldValues":[{"type":"FieldValue","id":"100005"},{"type":"FieldValue","id":"100017"},{"type":"FieldValue","id":"100023"},{"type":"FieldValue","id":"100024"},{"type":"FieldValue","id":"100032","value":"CLGEL000000530289"},{"type":"FieldValue","id":"100033"},{"type":"FieldValue","id":"100034"},{"type":"FieldValue","id":"100035"},{"type":"FieldValue","id":"100036"},{"type":"FieldValue","id":"100041"},{"type":"FieldValue","id":"100043"},{"type":"FieldValue","id":"100044"},{"type":"FieldValue","id":"100045"},{"type":"FieldValue","id":"100046"},{"type":"FieldValue","id":"100047"},{"type":"FieldValue","id":"100048"},{"type":"FieldValue","id":"100049"},{"type":"FieldValue","id":"100051"},{"type":"FieldValue","id":"100065"},{"type":"FieldValue","id":"100066"},{"type":"FieldValue","id":"100068"},{"type":"FieldValue","id":"100069","value":"North America"},{"type":"FieldValue","id":"100072"},{"type":"FieldValue","id":"100081"},{"type":"FieldValue","id":"100171","value":"mail.com"},{"type":"FieldValue","id":"100172","value":"Danny Tate"},{"type":"FieldValue","id":"100174"},{"type":"FieldValue","id":"100175"},{"type":"FieldValue","id":"100176"},{"type":"FieldValue","id":"100177"},{"type":"FieldValue","id":"100178"},{"type":"FieldValue","id":"100179"},{"type":"FieldValue","id":"100180"},{"type":"FieldValue","id":"100184"},{"type":"FieldValue","id":"100187"},{"type":"FieldValue","id":"100188"},{"type":"FieldValue","id":"100189"},{"type":"FieldValue","id":"100190"},{"type":"FieldValue","id":"100191"},{"type":"FieldValue","id":"100192"},{"type":"FieldValue","id":"100193"},{"type":"FieldValue","id":"100194","value":"DannyTateL8RDM3"},{"type":"FieldValue","id":"100195"},{"type":"FieldValue","id":"100196","value":"CI"},{"type":"FieldValue","id":"100197"},{"type":"FieldValue","id":"100199","value":"1617144408"},{"type":"FieldValue","id":"100200","value":"1617144408"},{"type":"FieldValue","id":"100201","value":"1617144408"},{"type":"FieldValue","id":"100202","value":"LG.com"},{"type":"FieldValue","id":"100203","value":"ID_HQ_LG.com_I2B"},{"type":"FieldValue","id":"100205"},{"type":"FieldValue","id":"100206"},{"type":"FieldValue","id":"100208","value":"1617144408"},{"type":"FieldValue","id":"100209","value":"Hello,\r\nI'm looking to shoot a TV show where I can hide cameras behind screens that can be made to look like pictures on the wall.\r\nI'm wondering if these would be a good solution. The camera would be in a dark environment beyond the set. Do you think these OLED signs would be appropriate for use?\r\nDo you have larger sizes available as well? We would be looking for multiple but in the first instance one to do some lighting and camera tests with.\r\nThank you for your time\r\n"},{"type":"FieldValue","id":"100210","value":"Yes"},{"type":"FieldValue","id":"100211","value":"No"},{"type":"FieldValue","id":"100212","value":"No"},{"type":"FieldValue","id":"100213","value":"Yes"},{"type":"FieldValue","id":"100214"},{"type":"FieldValue","id":"100215"},{"type":"FieldValue","id":"100216"},{"type":"FieldValue","id":"100219"},{"type":"FieldValue","id":"100220"},{"type":"FieldValue","id":"100221"},{"type":"FieldValue","id":"100222"},{"type":"FieldValue","id":"100223"},{"type":"FieldValue","id":"100224"},{"type":"FieldValue","id":"100225"},{"type":"FieldValue","id":"100226"},{"type":"FieldValue","id":"100227"},{"type":"FieldValue","id":"100228"},{"type":"FieldValue","id":"100229","value":"ID"},{"type":"FieldValue","id":"100230"},{"type":"FieldValue","id":"100231"},{"type":"FieldValue","id":"100232"},{"type":"FieldValue","id":"100233"},{"type":"FieldValue","id":"100234"},{"type":"FieldValue","id":"100235"},{"type":"FieldValue","id":"100236"},{"type":"FieldValue","id":"100237"},{"type":"FieldValue","id":"100238"},{"type":"FieldValue","id":"100239"},{"type":"FieldValue","id":"100240"},{"type":"FieldValue","id":"100241"},{"type":"FieldValue","id":"100242"},{"type":"FieldValue","id":"100243"},{"type":"FieldValue","id":"100244"},{"type":"FieldValue","id":"100245"},{"type":"FieldValue","id":"100246"},{"type":"FieldValue","id":"100247"},{"type":"FieldValue","id":"100248"},{"type":"FieldValue","id":"100249"},{"type":"FieldValue","id":"100250"},{"type":"FieldValue","id":"100251"},{"type":"FieldValue","id":"100252"},{"type":"FieldValue","id":"100253"},{"type":"FieldValue","id":"100254","value":"Usage or technical consultation"},{"type":"FieldValue","id":"100255","value":"Less than 3 Months"},{"type":"FieldValue","id":"100256","value":"Less than $100,000"},{"type":"FieldValue","id":"100257","value":"OLED Signage"},{"type":"FieldValue","id":"100258","value":"Transparent OLED Sigange"},{"type":"FieldValue","id":"100259"},{"type":"FieldValue","id":"100260","value":"Architect/Consultant"},{"type":"FieldValue","id":"100261","value":"Special purpose"},{"type":"FieldValue","id":"100262","value":"Director"},{"type":"FieldValue","id":"100263"},{"type":"FieldValue","id":"100264"},{"type":"FieldValue","id":"100265"},{"type":"FieldValue","id":"100266"},{"type":"FieldValue","id":"100267"},{"type":"FieldValue","id":"100268"},{"type":"FieldValue","id":"100269"},{"type":"FieldValue","id":"100271"},{"type":"FieldValue","id":"100272"},{"type":"FieldValue","id":"100273"},{"type":"FieldValue","id":"100274"},{"type":"FieldValue","id":"100275"},{"type":"FieldValue","id":"100276"},{"type":"FieldValue","id":"100277"},{"type":"FieldValue","id":"100278"},{"type":"FieldValue","id":"100279"},{"type":"FieldValue","id":"100280"},{"type":"FieldValue","id":"100281"},{"type":"FieldValue","id":"100282"},{"type":"FieldValue","id":"100283"},{"type":"FieldValue","id":"100284"},{"type":"FieldValue","id":"100285"},{"type":"FieldValue","id":"100286"},{"type":"FieldValue","id":"100287"},{"type":"FieldValue","id":"100288"},{"type":"FieldValue","id":"100289"},{"type":"FieldValue","id":"100290"},{"type":"FieldValue","id":"100291"},{"type":"FieldValue","id":"100292"},{"type":"FieldValue","id":"100293"},{"type":"FieldValue","id":"100294"},{"type":"FieldValue","id":"100295","value":"Canada_ID"},{"type":"FieldValue","id":"100296"},{"type":"FieldValue","id":"100301"},{"type":"FieldValue","id":"100302"},{"type":"FieldValue","id":"100303"},{"type":"FieldValue","id":"100304"},{"type":"FieldValue","id":"100305"},{"type":"FieldValue","id":"100306"},{"type":"FieldValue","id":"100307"},{"type":"FieldValue","id":"100309","value":"<ID_2021-03-30 18:46:48.000_Hello,\r\nI'm looking to shoot a TV show where I can hide cameras behind screens that can be made to look like pictures on the wall.\r\nI'm wondering if these would be a good solution. The camera would be in a dark environment beyond the set. Do you think these OLED signs would be appropriate for use?\r\nDo you have larger sizes available as well? We would be looking for multiple but in the first instance one to do some lighting and camera tests with.\r\nThank you for your time\r\n> <ID_2021-03-30 18:46:48.000_Hello,\r\nI'm looking to shoot a TV show where I can hide cameras behind screens that can be made to look like pictures on the wall.\r\nI'm wondering if these would be a good solution. The camera would be in a dark environment beyond the set. Do you think these OLED signs would be appropriate for use?\r\nDo you have larger sizes available as well? We would be looking for multiple but in the first instance one to do some lighting and camera tests with.\r\nThank you for your time\r\n> "},{"type":"FieldValue","id":"100311"},{"type":"FieldValue","id":"100315","value":"No"},{"type":"FieldValue","id":"100316","value":"No"},{"type":"FieldValue","id":"100317","value":"No"},{"type":"FieldValue","id":"100318","value":"No"},{"type":"FieldValue","id":"100319"},{"type":"FieldValue","id":"100320"},{"type":"FieldValue","id":"100321"},{"type":"FieldValue","id":"100322","value":"Media and Communication"},{"type":"FieldValue","id":"100323"},{"type":"FieldValue","id":"100324"},{"type":"FieldValue","id":"100325"},{"type":"FieldValue","id":"100326","value":"ID_HQ_LG.com_I2B , ID_HQ_LG.com_I2B , "},{"type":"FieldValue","id":"100327"},{"type":"FieldValue","id":"100328"},{"type":"FieldValue","id":"100329"},{"type":"FieldValue","id":"100330"},{"type":"FieldValue","id":"100331","value":"Y"},{"type":"FieldValue","id":"100332"},{"type":"FieldValue","id":"100333"},{"type":"FieldValue","id":"100334"},{"type":"FieldValue","id":"100335"},{"type":"FieldValue","id":"100336","value":"Contact"},{"type":"FieldValue","id":"100337","value":"MQL"},{"type":"FieldValue","id":"100338","value":"Contact"},{"type":"FieldValue","id":"100339","value":"Contact"},{"type":"FieldValue","id":"100340"},{"type":"FieldValue","id":"100341","value":"Contact"},{"type":"FieldValue","id":"100342","value":"Contact"},{"type":"FieldValue","id":"100343","value":"Contact"},{"type":"FieldValue","id":"100344"},{"type":"FieldValue","id":"100345","value":"Others"},{"type":"FieldValue","id":"100346"},{"type":"FieldValue","id":"100347"},{"type":"FieldValue","id":"100348"},{"type":"FieldValue","id":"100349"},{"type":"FieldValue","id":"100350"},{"type":"FieldValue","id":"100351"},{"type":"FieldValue","id":"100352"},{"type":"FieldValue","id":"100353"},{"type":"FieldValue","id":"100354"},{"type":"FieldValue","id":"100355"},{"type":"FieldValue","id":"100356"},{"type":"FieldValue","id":"100357"},{"type":"FieldValue","id":"100358"},{"type":"FieldValue","id":"100359"},{"type":"FieldValue","id":"100360"},{"type":"FieldValue","id":"100361"},{"type":"FieldValue","id":"100362"},{"type":"FieldValue","id":"100363","value":"No"},{"type":"FieldValue","id":"100364"},{"type":"FieldValue","id":"100365"},{"type":"FieldValue","id":"100366"}],"firstName":"Danny","isBounceback":"false","isSubscribed":"true","lastName":"Tate","mobilePhone":"16476744429","subscriptionDate":"1617144408"}]
    var bs_data = req.body;
    // console.log(1);
    // console.log(bs_data);

    // console.log(2);
    // console.log(bs_data);
    
  
    

    var form = {};
    var success_count = 0;
    var failed_count = 0;
    var result_list = [];
    
    // console.log("bs_data.length");
    // console.log(bs_data.length);
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

    console.log("total count : " + bs_data.length + "  ::: success_count : " + success_count + "  ::: failed_count : " + failed_count );
    form.total = bs_data.length;
    form.success_count = success_count;
    form.failed_count = failed_count;
    form.result_list = result_list;
 
    res.json(form);

});

router.delete('/delete', async function (req, res, next) {
    var email_list = [];
    email_list = req.body.email_list
    
    console.log(email_list);

    var delete_data = [];
    for(var i = 0 ; email_list.length > i; i++){
        delete_data.push({
            email : email_list[i]
        })
    }
    
    delete_data = await mappedContacts(delete_data , "partial");
    console.log(delete_data);
    
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

    console.log("total count : " + delete_data.length + "  ::: success_count : " + success_count + "  ::: failed_count : " + failed_count );
    form.total = delete_data.length;
    form.success_count = success_count;
    form.failed_count = failed_count;
    form.result_list = result_list;
 
    res.json(form);
    
});

router.post('/specific_search', async function (req, res, next) {
    

    
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

// eloqua api를 통해 테스트용 데이터를 한꺼번에 지우기 위한 기능(최대 천건 가능)
router.post('/multi_delete', async function (req, res, next) { 
    var email_list = req.body.email_list; 
    var search_data = []; 
    
    
    // console.log(search_data);
    var search_list = await getContacts(email_list , "minimal");
    console.log("search_list");
    console.log(search_list);

    var delete_data = search_list.elements;
    console.log(delete_data);
  
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

module.exports = router;