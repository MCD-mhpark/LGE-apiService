var express = require('express');
var router = express.Router();

/* Contacts */

//BANT 조건 Eloqua 조회 함수
async function get_INTEGRATION_DB_bant_data() {
  //BANT 조건
  var queryString = {
    //search : 'emailAddress=' + emailAddress,
    depth: "complete",
    count: 1000,
    //page: 2,
    //MAX LIMIT 1000
    //limit: 1000
    count: 10
    //limit: 10
  }
  var contacts_data;

  await b2bgerp_eloqua.data.contacts.get(queryString).then((result) => {
    console.log(result.data);

    console.log("true");

    if (result.data.total && result.data.total > 0) {
      contacts_data = result.data;
      console.log(contacts_data);
    }
  }).catch((err) => {
    console.error(err.message);
    return null;
  });
  return contacts_data;
}

function INTEGRATION_DB_ENTITY(){
  this.INTERFACE_ID = "";               //PK	HQ , USSolar, USID
  this.PROSPECT_ID = "";                //apc14000350967, ilc14000349979 ( Eloqua Contact ID )
  this.FIRST_NAME = "";                 //이름
  this.LAST_NAME = "";                  //성
  this.EMAIL = "";                      //이메일
  this.ACCOUNT = "";                    //회사명
  this.LAST_ACTIVITY_AT = "";           //Date			( date type )  ( 참여 활동 날짜 Eloqua 확인 ) 
  this.CAMPAIGN = "";
  this.NOTES = "";                      //필드확인필요 ( ex ) therma V, accustorahe )
  this.SCORE = "";                      //숫자 MAT SCORE 계산 로직 (MAT 로직)
  this.GRADE = "";                      //A+, F, C+, C, C-, B- (MAT확인) 
  this.WEBSITE = "";                    //웹사이트
  this.JOB_TITLE = "";                  //타이틀 롤
  this.FUNCTION = "";                   
  this.COUNTRY = "";                    //국가
  this.ADDRESS_ONE = "";                //주소1
  this.ADDRESS_TWO = "";                //주소2
  this.CITY = "";                       //도시
  this.STATE = "";                      //주
  this.TERRITORY = "";                  //있음
  this.ZIP = "";                        //있음
  this.PHONE = "";                      //있음
  this.FAX = "";                        //있음
  this.SOURCE = "";                     //플랫폼 AND 액티비티 인지 확인필요  
  this.ANNUAL_REVENUE = "";             
  this.EMPLOYEES = "";                  //매핑정보 존재 여부 확인필요
  this.INDUSTRY = "";             
  this.DO_NOT_EMAIL = "";               //수신거부 이메일 - 국가별 사업부별 확인 필요
  this.DO_NOT_CALL = "";                //bool			수진거부 CALL -  국가별 사업부별 확인 필요 ex(true,false)
  this.YEARS_IN_BUSINESS = "";          
  this.COMMENTS = "";                   //매핑정보 존재 여부 확인필요
  this.SALUTATION = "";                 //미스터 , 미스 등등
  this.OPTED_OUT = "";              
  this.REFERRER = "";                   //유입경로 URL ( Eloqua Referrer ) 
  this.CREATED_DATE = "";               //고객정보 생성일자 ( Contacts 생성일자 )
  this.UPDATED_DATE = "";               //고객정보 수정일자 ( Contacts 수정일자 )
  this.ACCOUNT_TYPE = "";
  this.ATTENDANCE_RESPONSE = "";
  this.B2BNEWSLETTER = "";              //ex) yes, no, option03, y, 890 gramos
  this.B2BNEWSLETTER_BU = ""; 
  this.B2BNEWSLTTER_TEAM = "";
  this.BIC_VISIT = "";                  //description : eu_prospect    ex) yes, no
  this.BUDGET = "";                     //
  this.BUSINESS_UNIT_1 = "";            //lg division info                           ex) 110794
  this.BUSINESS_UNIT_2 = "";            //description : transfer out side    ex) yes, no
  this.COMPANY_TYPE = "";               //
  this.DB_ACQUISITION_DATE = "";        //
  this.EMAIL_SUBSCRIPTION = "";         //
  this.EMAIL_SUBSCRIPTION_DATE = "";
  this.ES_ID_TRANSPORTATION = "";       //date			description : transfer out side date    ex) 2019-02-15
  this.INDUSTRIES = "";
  this.INQUIRY_TYPE = "";
  this.LANGUAGE = "";
  this.MESSAGE = "";
  this.MOBILE = "";                     //ex) E*************************************   20%   
  this.PP_MODIFY_REASON = "";           //개인정보 정책
  this.PP_MODIFY_TYPE = "";             //ex) yes, es_bbdd juanma
  this.PP_SUBSCRIPTION = "";            
  this.PP_SUBSCRIPTION_DATE = "";
  this.PRODUCT_SOLUTION = "";
  this.PRODUCTS = "";
  this.PROSPECT_SOURCE = "";
  this.REGION = "";
  this.SALESPERSON_EMAIL = "";          //영업사원이메일 1%
  this.SALESPERSON_NAME = "";           //영업사원이름 1%
  this.STORYSET_DOWNLOAD = "";          //ex) treinamento comercial , treinamento tecnico
  this.STORYSET_EDUCATION = "";         //x
  this.STORYSET_FEEDBACK_EXPERIENCE = ""; //ex) nao, espacos publicos
  this.STORYSET_FEEDBACK_SUGGESTION = ""; //ex) mas tiempo, es correcto
  this.SUBSCRIPTION = "";
  this.SUBSIDIARY = "";
  this.TIMELINE = "";
  this.UK_AS_TSHIRTS_SIZE = "";         //x
  this.HQ_B2BMKT_SCORING_CATEGORY = ""; //x
  this.APPLIED_FLAG = "";               //x 큐리온 적용 여부
  this.APPLIED_DATE = "";               //x 큐리온
  this.TRANSFER_FLAG = "";              //Default N
  this.TRANSFERRED_DATE = "";           //Null
  this.BACK_TRANSFER_FLAG = "";         //Null
  this.BACK_TRANSFERRED_DATE = "";		  //Null
  this.SALESFORCE_ID = "";              //?	 ex) 00Q0I00012QbogUAC
}

//Eloqua Data B2B GERP Global Mapping 데이터 생성
function Convert_INTEGRATION_DB_DATA(contacts_data)
{
  var result_data = [];
  
  for( var i = 0; i < contacts_data.elements.length; i++)
  {
    var result_item = new INTEGRATION_DB_ENTITY();

    console.log(contacts_data.elements[i]);
    console.log(contacts_data.elements[i].accountName);

    if( contacts_data.elements[i].accountName != undefined) result_item.ACCOUNT = contacts_data.elements[i].accountName;

    result_data.push(result_item);
  }

  return result_data;
}

router.get('/', async function (req, res, next) {

  //BANT기준 B2B GERP GLOBAL CONTACTS 조회
  var contacts_data = await get_INTEGRATION_DB_bant_data();

  if( contacts_data != null )
  {
    //Eloqua Contacts 조회
    var request_data = Convert_INTEGRATION_DB_DATA(contacts_data);
    
    res.json(request_data);
  }
    
  //API Gateway 데이터 전송

  //Log
  //res.json(true);

});

router.get('/req_data', function (req, res, next) {
  var id = 941;
  b2bgerp_eloqua.data.contacts.getOne(id).then((result) => {
    console.log(result.data);
    httpRequest.sender("http://localhost:8001/b2bgerp_kr_us/contacts/req_data_yn", "POST" , result.data);
  }).catch((err) => {
    console.error(err.message);
  });
});

// 가상의 LG API GATEWAY의 
router.post('/req_data_yn', function (req, res, next) {
  console.log("call req_data_yn");

  console.log(req.body);
});

module.exports = router;
