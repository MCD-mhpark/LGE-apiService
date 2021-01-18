var express = require('express');
var router = express.Router();



/* Contacts */
//BANT 조건 Eloqua 조회 함수
async function get_b2bgerp_kr_bant_data() {
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

function B2B_GERP_KR_ENTITY(){
  this.INTERFACE_ID = "";           //인터페이스아이디
  this.ESTIMATION_ID = "";          //견적번호
  this.ESTIMATION_SEQ_NO = "";      //NUMBER		견적상세번호
  this.CUSTOMER_NAME = "";          //VARCHAR2(300)		고객명  ( 회사명 인듯 합니다. )
  this.BIZ_REGISTER_NO = "";        //VARCHAR2(20)		사업자등록번호
  this.CORP_REGISTER_NO = "";       //VARCHAR2(20)		법인등록번호
  this.POSTAL_CODE = "";            //VARCHAR2(20)		우편번호
  this.BASE_ADDR  = "";             //VARCHAR2(2000)		기본주소
  this.DETAIL_ADDR = "";            //VARCHAR2(2000)		상세주소
  this.PHONE_NO = "";               //VARCHAR2(30)		전화번호
  this.EMAIL_ADDR = "";             //VARCHAR2(256)		전자우편주소
  this.CONTACT_NAME = "";           //VARCHAR2(300)		담당자명
  this.CONTACT_PHONE_NO = "";       //VARCHAR2(30)		담당자전화번호
  this.CONTACT_CELLULAR_NO = "";    //VARCHAR2(30)		담당자이동전화번호
  this.CONTACT_EMAIL_ADDR = "";     //VARCHAR2(256)		담당자전자우편주소
  this.ESTIMATE_REGISTER_DATE = ""; //DATE		견적등록일
  this.ESTIMATE_UPDATE_DATE = "";   //DATE		견적수정일
  this.ESTIMATE_UPDATE_FLAG = "";   //VARCHAR2(1)		견적수정여부
  this.MODEL_CODE = "";             //VARCHAR2(30)		모델코드
  this.ITEM_QTY = "";               //NUMBER		품목수량
  this.REGISTER_DATE = "";          //DATE		등록일자
  this.LAST_UPDATE_DATE = "";       //DATE		최종수정일자
  this.UPDATE_TYPE_CODE = "";       //VARCHAR2(30)		변경구분(UPDATE/INSERT)
  this.RECEIVE_DATE = "";			      //DATE		수신일자
  this.PROCESSING_FLAG = "";	      //VARCHAR2(1)		처리여부
  this.PROCESSING_DATE = "";	      //DATE		처리일자
  this.PROCESS_CONTEXT = "";	      //VARCHAR2(256)		처리컨텍스트
  this.CUST_REMARK = "";			      //VARCHAR2(4000)		고객요청사항
  this.PRODUCT_DESC = "";			      //VARCHAR2(200)		제품설명
  this.ATTRIBUTE_1 = "";			      //VARCHAR2(500)		예비1
  this.ATTRIBUTE_2 = "";			      //VARCHAR2(500)		예비2
  this.ATTRIBUTE_3 = "";			      //VARCHAR2(500)		
  this.ATTRIBUTE_4 = "";			      //VARCHAR2(500)		
  this.ATTRIBUTE_5 = "";			      //VARCHAR2(500)		
  this.ATTRIBUTE_6 = "";			      //VARCHAR2(500)		
  this.ATTRIBUTE_7 = "";			      //VARCHAR2(500)		
  this.ATTRIBUTE_8 = "";			      //VARCHAR2(500)		
  this.ATTRIBUTE_9 = "";			      //VARCHAR2(500)		
  this.ATTRIBUTE_10	= "";		        //VARCHAR2(500)		
  this.ATTRIBUTE_11 = "";			      //VARCHAR2(500)		
  this.ATTRIBUTE_12 = "";			      //VARCHAR2(500)		
}

//Eloqua Data B2B GERP Global Mapping 데이터 생성
function Convert_B2BGERP_KR_DATA(contacts_data)
{
  var result_data = [];
  
  for( var i = 0; i < contacts_data.elements.length; i++)
  {
    var result_item = new B2B_GERP_KR_ENTITY();

    if( contacts_data.elements[i].accountName != undefined) result_item.ACCOUNT = contacts_data.elements[i].accountName;

    result_data.push(result_item);
  }

  return result_data;
}

router.get('/', async function (req, res, next) {

  //BANT기준 B2B GERP GLOBAL CONTACTS 조회
  var contacts_data = await get_b2bgerp_kr_bant_data();

  if( contacts_data != null )
  {
    //Eloqua Contacts 조회
    var request_data = Convert_B2BGERP_KR_DATA(contacts_data);
    
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
