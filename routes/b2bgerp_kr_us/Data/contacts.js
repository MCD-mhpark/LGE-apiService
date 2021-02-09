var express = require('express');
var router = express.Router();
var utils = require('../../common/utils');

/* Contacts */
//BANT 조건 Eloqua 조회 함수
async function get_b2bgerp_kr_bant_data(_business_name) {
  var business_name = _business_name;
  var status_bant = "";

  var contacts_data;
  var queryString = {}
  var queryText = "";

  switch(business_name)
  {
      case "AS":
        status_bant = "C_AS_Status1";
      break;
      case "IT":
        status_bant = "C_IT_Status1";
      break;
      case "ID":
        status_bant = "C_ID_Status1";
      break;
      case "Solar":
        status_bant = "C_Solar_Status1";
      break;
      case "CM":
        status_bant = "C_CM_Status1";
      break;
      case "CLS":
        status_bant = "C_CLS_Status1";
      break;
      case "Solution":
        status_bant = "C_Solution_Status1";
      case "Kr":
        status_bant = "";
      break;
  }

  var yesterday_Object = utils.yesterday_getDateTime();
  var yesterday_Object = utils.today_getDateTime();
  var queryText = "C_DateModified>"+"'" + yesterday_Object.start + " 00:00:01'"+ "C_DateModified<" + "'"+ yesterday_Object.end + " 23:59:59'"+ status_bant + "='MQL'";
  //yesterday_getUnixTime
  queryString['search'] = queryText;
  queryString['depth'] = "complete";
  //queryString['count'] = 10;
  
  await b2bgerp_eloqua.data.contacts.get(queryString).then((result) => {

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

function B2B_GERP_KR_ENTITY() {
  this.INTERFACE_ID = "";           //인터페이스아이디
  this.ESTIMATION_ID = "";          //견적번호
  this.ESTIMATION_SEQ_NO = "";      //NUMBER		견적상세번호
  this.CUSTOMER_NAME = "";          //VARCHAR2(300)		고객명  ( 회사명 인듯 합니다. )
  this.BIZ_REGISTER_NO = "";        //VARCHAR2(20)		사업자등록번호
  this.CORP_REGISTER_NO = "";       //VARCHAR2(20)		법인등록번호
  this.POSTAL_CODE = "";            //VARCHAR2(20)		우편번호
  this.BASE_ADDR = "";             //VARCHAR2(2000)		기본주소
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
  this.ATTRIBUTE_10 = "";		        //VARCHAR2(500)		
  this.ATTRIBUTE_11 = "";			      //VARCHAR2(500)		
  this.ATTRIBUTE_12 = "";			      //VARCHAR2(500)		
}

function GetCustomFiledValue(contacts_customfields, customfieldID) {

  var result_data = "";

  for (var fieled_index in contacts_customfields) {
    var fieldValue_id = contacts_customfields[fieled_index].id;
    var fieldValue_value = contacts_customfields[fieled_index].value;

    if (fieldValue_id == customfieldID) {
      if (fieldValue_value != undefined) {
        result_data = fieldValue_value;
        break;
      }
      else {
        result_data = "";
        break;
      }
    }
  }
  return result_data;
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

//business_department ( AS , CLS , CM , ID , IT , Solar , Solution )
//key ( Job Function , Business Unit , Seniority , Needs , TimeLine )
function GetBusiness_Department_data(fieldValues, business_department, key) {

  var result_data = "";
  switch (business_department) {
    case "AS":
      switch (key) {
        case "Job Function":
          //100323	AS_Authority2(Job Function)
          result_data = GetCustomFiledValue(fieldValues, 100323);
          break;
        case "Business Unit":
          // 100328	//Business Unit_AS
          result_data = GetCustomFiledValue(fieldValues, 100328);
          break;
        case "Seniority":
          // 100219	AS_Authority1(Seniority)  
          result_data = GetCustomFiledValue(fieldValues, 100219);
          break;
        case "Needs":
          // 100215	AS_Needs
          result_data = GetCustomFiledValue(fieldValues, 100215);
          break;
        case "TimeLine":
          // 100221	AS_TimeLine
          result_data = GetCustomFiledValue(fieldValues, 100221);
          break;
        case "Budget":
          // 100221	AS_TimeLine
          result_data = GetCustomFiledValue(fieldValues, 100220);
          break;
        case "Product_Category":
          // 100205	AS_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100205);
          break;
        case "Product_SubCategory":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Product_Model":
          // 필드확인 필요 
          result_data = "";
          break;
      }
      break;
    case "CLS":
      switch (key) {
        case "Job Function":
          // 100327	CLS_Authority2(Job Function)  
          result_data = GetCustomFiledValue(fieldValues, 100327);
          break;
        case "Business Unit":
          // 100329	//Business Unit_CLS
          result_data = GetCustomFiledValue(fieldValues, 100327);
          break;
        case "Seniority":
          // 100289	CLS_Authority1(Seniority)
          result_data = GetCustomFiledValue(fieldValues, 100289);
          break;
        case "Needs":
          // 100276	CLS_Needs
          result_data = GetCustomFiledValue(fieldValues, 100276);
          break;
        case "TimeLine":
          // 100278	CLS_TimeLine
          result_data = GetCustomFiledValue(fieldValues, 100278);
          break;
        case "Budget":
          // 100279	CLS_Budget
          result_data = GetCustomFiledValue(fieldValues, 100279);
          break;

        case "Product_Category":
          // 100277	CLS_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100277);
          break;
        case "Product_SubCategory":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Product_Model":
          // 필드확인 필요 
          result_data = "";
          break;
      }
      break;
    case "CM":
      switch (key) {
        case "Job Function":
          // 100325	CM_Authority2(Job Function)
          result_data = GetCustomFiledValue(fieldValues, 100325);
          break;
        case "Business Unit":
          // 100330	//Business Unit_CM
          result_data = GetCustomFiledValue(fieldValues, 100330);
          break;
        case "Seniority":
          // 100288	CM_Authority1(Seniority)
          result_data = GetCustomFiledValue(fieldValues, 100288);
          break;
        case "Needs":
          // 100282	CM_Needs
          result_data = GetCustomFiledValue(fieldValues, 100282);
          break;
        case "TimeLine":
          // 100284	CM_TimeLine  
          result_data = GetCustomFiledValue(fieldValues, 100284);
          break;
        case "Budget":
          // 100285	CM_Budget
          result_data = GetCustomFiledValue(fieldValues, 100285);
          break;
        case "Category":
          // 100283	CM_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100283);
          break;

        case "Product_Category":
          // 100283	CM_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100283);
          break;
        case "Product_SubCategory":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Product_Model":
          // 필드확인 필요 
          result_data = "";
          break;
      }
      break;
    case "ID":
      switch (key) {
        case "Job Function":
          // 100322	ID_Authority2(Job Function)
          result_data = GetCustomFiledValue(fieldValues, 100322);
          break;
        case "Business Unit":
          // 100331	//Business Unit_ID
          result_data = GetCustomFiledValue(fieldValues, 100331);
          break;
        case "Seniority":
          // 100262	ID_Authority1(Seniority)
          result_data = GetCustomFiledValue(fieldValues, 100262);
          break;
        case "Needs":
          // 100254	ID_Needs
          result_data = GetCustomFiledValue(fieldValues, 100254);
          break;
        case "TimeLine":
          // 100255	ID_TimeLine
          result_data = GetCustomFiledValue(fieldValues, 100255);
          break;
        case "Budget":
          // 100256	ID_Budget
          result_data = GetCustomFiledValue(fieldValues, 100256);
          break;
        case "Product_Category":
          // 100257	ID_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100257);
          break;
        case "Product_SubCategory":
          // 100258	ID_Product_Sub-Category
          result_data = GetCustomFiledValue(fieldValues, 100258);
          break;
        case "Product_Model":
          // 100259	ID_Product_ModelName
          result_data = GetCustomFiledValue(fieldValues, 100259);
          break;
      }
      break;
    case "IT":
      switch (key) {
        case "Job Function":
          // 100214	IT_Authority2(Job Function)
          result_data = GetCustomFiledValue(fieldValues, 100214);
          break;
        case "Business Unit":
          // 100332	//Business Unit_IT
          result_data = GetCustomFiledValue(fieldValues, 100332);
          break;
        case "Seniority":
          // 100269	IT_Authority1(Seniority)
          result_data = GetCustomFiledValue(fieldValues, 100269);
          break;
        case "Needs":
          // 100264	IT_Needs
          result_data = GetCustomFiledValue(fieldValues, 100264);
          break;
        case "TimeLine":
          // 100265	IT_TimeLine
          result_data = GetCustomFiledValue(fieldValues, 100265);
          break;
        case "Budget":
          // 100266	IT_Budget
          result_data = GetCustomFiledValue(fieldValues, 100266);
          break;
        case "Product_Category":
          // 100263	IT_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100263);
          break;
        case "Product_SubCategory":
          // 100296	IT_Product Subcategory
          result_data = GetCustomFiledValue(fieldValues, 100296);
          break;
        case "Product_Model":
          // 100306	IT_Product_ModelName
          result_data = GetCustomFiledValue(fieldValues, 100306);
          break;

      }
      break;
    case "Solar":
      switch (key) {
        case "Job Function":
          //100324	Solar_Authority2(Job Function)  
          result_data = GetCustomFiledValue(fieldValues, 100324);
          break;
        case "Business Unit":
          //100333	Business Unit_Solar
          result_data = GetCustomFiledValue(fieldValues, 100333);
          break;
        case "Seniority":
          // 100290	Solar_Authority1(Seniority)
          result_data = GetCustomFiledValue(fieldValues, 100290);
          break;
        case "Needs":
          // 100291	Solar_Needs
          result_data = GetCustomFiledValue(fieldValues, 100291);
          break;
        case "TimeLine":
          // 100272	Solar_TimeLine  
          result_data = GetCustomFiledValue(fieldValues, 100272);
          break;
        case "Budget":
          // 100273	Solar_Budget
          result_data = GetCustomFiledValue(fieldValues, 100266);
          break;

        case "Product_Category":
          // 100271	Solar_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100271);
          break;
        case "Product_SubCategory":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Product_Model":
          // 필드확인 필요 
          result_data = "";
          break;

      }
      break;
    case "Solution":
      switch (key) {
        case "Job Function":
          // 100321 Solution_Authority2(Job Function)  
          result_data = GetCustomFiledValue(fieldValues, 100321);
          break;
        case "Business Unit":
          //100335	Business Unit_Solution
          result_data = GetCustomFiledValue(fieldValues, 100335);
          break;
        case "Seniority":
          //100228	Solution_Authority1(Seniority)
          result_data = GetCustomFiledValue(fieldValues, 100228);
          break;
        case "Needs":
          //100222	Solution_Needs
          result_data = GetCustomFiledValue(fieldValues, 100222);
          break;
        case "TimeLine":
          //100223	Solution_Timeline
          result_data = GetCustomFiledValue(fieldValues, 100223);
          break;
        case "Budget":
          //100224	Solution_Budget
          result_data = GetCustomFiledValue(fieldValues, 100224);
          break;
        case "Product_Category":
          //100225	Solution_Product Category
          result_data = GetCustomFiledValue(fieldValues, 100225);
          break;
        case "Product_SubCategory":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Product_Model":
          // 필드확인 필요 
          result_data = "";
          break;
      }
      break;
  }
  return result_data;
}

//Eloqua Data B2B GERP Global Mapping 데이터 생성
function Convert_B2BGERP_KR_DATA(contacts_data, business_department) {
  var result_data = [];

  for (var i = 0; i < contacts_data.elements.length; i++) {
    try {
      var result_item = new B2B_GERP_KR_ENTITY();
      var FieldValues_data = contacts_data.elements[i].fieldValues;

      result_item.INTERFACE_ID = "ELOQUA_0004" // this.INTERFACE_ID = "ELOQUA_0004"
      result_item.ESTIMATION_ID = "";      //견적번호 X
      result_item.ESTIMATION_SEQ_NO = "";  //견적상세번호 X
      result_item.CUSTOMER_NAME = "";      //고객명 X
      result_item.BIZ_REGISTER_NO = "";    //사업자등록번호 X
      result_item.CORP_REGISTER_NO = "";   //법인등록번호 X
      result_item.POSTAL_CODE = GetDataValue(contacts_data.elements[i].postalCode); //우편번호
      result_item.BASE_ADDR = GetDataValue(contacts_data.elements[i].address1); //기본주소
      result_item.DETAIL_ADDR = GetDataValue(contacts_data.elements[i].address2) + " " + GetDataValue(contacts_data.elements[i].address3); //상세주소
      result_item.PHONE_NO = GetDataValue(contacts_data.elements[i].mobilePhone); //전화번호
      result_item.EMAIL_ADDR = GetDataValue(contacts_data.elements[i].emailAddress); //전자우편주소
      result_item.CONTACT_NAME = "";         //담당자명
      result_item.CONTACT_PHONE_NO = "";     //담당자 전화번호
      result_item.CONTACT_CELLULAR_NO = "";  //담당자 이동전화번호
      result_item.CONTACT_EMAIL_ADDR = "";   //담당자 전자우편주소
      result_item.ESTIMATE_REGISTER_DATE = ""; //견적등록일
      result_item.ESTIMATE_UPDATE_DATE = ""; //견적수정일
      result_item.ESTIMATE_UPDATE_FLAG = ""; //견적수정여부
      result_item.MODEL_CODE = "";           //모델코드
      result_item.ITEM_QTY = "";          //품목수량
      result_item.REGISTER_DATE = "";     //등록일자
      result_item.LAST_UPDATE_DATE = "";  //최종수정일자
      result_item.UPDATE_TYPE_CODE = "";  //변경구분
      result_item.RECEIVE_DATE = ""; //수신일자
      result_item.PROCESSING_FLAG = "";  //처리여부
      result_item.PROCESSING_DATE = "";  //처리일자
      result_item.PROCESS_CONTEXT = "";  //처리컨텍스트
      result_item.CUST_REMARK = "";  //고객요청사항
      result_item.CUST_REMARK = "";  //제품설명
      result_item.ATTRIBUTE_1 = "";  //예비1
      result_item.ATTRIBUTE_2 = "";  //예비2
      result_data.push(result_item);
    }
    catch (e) {
      console.log(e);
    }
  }
  return result_data;
}

router.get('/:businessName', async function (req, res, next) {
  //BANT기준 B2B GERP GLOBAL CONTACTS 조회
  var business_name = req.params.businessName;
  //business_department ( AS , CLS , CM , ID , IT , Solar , Solution, Kr)

  var contacts_data = await get_b2bgerp_kr_bant_data(business_name);

  if (contacts_data != null) {
    //Eloqua Contacts 조회

    //business_department ( AS , CLS , CM , ID , IT , Solar , Solution , Vertical )
    var request_data = Convert_B2BGERP_KR_DATA(contacts_data, business_name);

    res.json({ ContentList: request_data });
  }
  else
  {
    res.json(false);
  }
  //API Gateway 데이터 전송
  //Log
  //res.json(true);

});

router.get('/req_data', function (req, res, next) {
  var id = 941;
  b2bgerp_eloqua.data.contacts.getOne(id).then((result) => {
    console.log(result.data);
    httpRequest.sender("http://localhost:8001/b2bgerp_kr_us/contacts/req_data_yn", "POST", result.data);
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
