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
            dataObject.country = GetDataValue(body_data.elements[i].country);
            dataObject.updateDate = GetDataValue(utils.timeConverter("GET_DATE" , body_data.elements[i].updatedAt));
       
 
         
            var krMkt = "";
            console.log(fieldValues);
            let Business_Unit = await getBuniessUnit(fieldValues);

            if(Business_Unit) krMkt = "N";
            else krMkt = "Y";

            console.log("Business_Unit : " + Business_Unit);
            console.log("krMkt : " + krMkt);
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

function Convert_BS_CARD_DATA(body_data) {

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
        
            bs_card_data.fieldValues.push( { "id": "100252", "value": item.homepage });
            bs_card_data.fieldValues.push( { "id": "100292", "value": item.rank });
            bs_card_data.fieldValues.push( { "id": "100202", "value": "LBCS" });
            
            
        
            //"mailingDate": "2021-01-30 19:10:15", | Eloqua 필드 없음
            bs_card_data.subscriptionDate = utils.timeConverter("GET_UNIX",  item.subscriptionDate); //"subscriptionDate": "2021-01-30 19:11:22",
            
            //"campaignName": "",  | Eloqua 필드 없음
            //"campaignDate": "2031-01-01 00:00:00", | Eloqua 필드 없음
            //"customerProduct": "as", | 박진범 이사님 Product 값이 AS , ID , IT , CLS , CM , Solor , Solution 값이 전부 인지 확인 필요 
            //"krMkt": "N", | Eloqua 필드값 확인 필요 | Eloqua 필드 없음


            // KR_Privacy Policy_Optin || 한영본 메일 발송 동의 여부 || 100318
            
            bs_card_data.country = item.country; // "country": "Netherlands Antilles",
        
            // LBCS_memo || etc1 || 100365
            bs_card_data.fieldValues.push( { "id": "100365", "value": item.etc1  });

            // Marketing Event || Campagin Name_ Campagin Date 조합 || 100203
            bs_card_data.fieldValues.push( { "id": "100203", "value": item.campaignName + "|" + item.campaignDate  });

            // product |  Business Unit || 100229
            bs_card_data.fieldValues.push({ "id": "100229", "value": item.product }); 
            
            if(item.krMkt == 'Y'){
                
                //들어온 값이 없어도 자동으로 업데이트 해야하는 동의 여부 및 동의 날짜 필드
                // KR_Privacy Policy_Optin || 한영본 메일 발송 동의 여부 || 100318
				bs_card_data.fieldValues.push( { "id": "100318", "value": "Yes" });
                // KR_Privacy Policy_Optin_Date || 한영본 메일 발송 동의 여부 날짜 || 100319
				bs_card_data.fieldValues.push( { "id": "100319", "value": utils.timeConverter("GET_UNIX" , item.mailingDate) });
                console.log(utils.timeConverter("GET_UNIX" , item.mailingDate));
                console.log(utils.timeConverter("GET_UNIX" , item.subscriptionDate));
                // KR_Privacy Policy_Collection and Usage || 한영본 개인정보 수집 동의 여부 || 100315
				bs_card_data.fieldValues.push( { "id": "100315", "value": "Yes" });
                // KR_Privacy Policy_Collection and Usage_AgreedDate || 한영본 개인정보 수집 동의 날짜 || 100320
				bs_card_data.fieldValues.push( { "id": "100320", "value": utils.timeConverter("GET_UNIX" , item.subscriptionDate) });
                // KR_Privacy Policy_Consignment of PI || (현재 동의여부 필드만 있고, 데이트 관련 필드 없음) || 100316
				bs_card_data.fieldValues.push( { "id": "100316", "value": "Yes" });
                // KR_Privacy Policy_Transfer PI Aborad || (현재 동의여부 필드만 있고, 데이트 관련 필드 없음) || 100317
				bs_card_data.fieldValues.push( { "id": "100317", "value": "Yes" });

                //100196 Subsidiary custom field//"userCode": "LGEVU"
                // krMkt Y인 경우 Subsidiary를 KR로 찍고 N인 경우 Global 이기에 Country 값을 봐도 되기 떄문에 빈값으로 찍는다.
                bs_card_data.fieldValues.push( { "id": "100196", "value": "KR" });

              
				// KR_Product Category || 한영본 customer product || 100311
				bs_card_data.fieldValues.push( { "id": "100311", "value": item.customerProduct });

            }else{

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

    bs_data =  Convert_BS_CARD_DATA(bs_data);
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

    console.log("total count : " + bs_data.length + "  ::: success_count : " + success_count + "  ::: failed_count : " + success_count );
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