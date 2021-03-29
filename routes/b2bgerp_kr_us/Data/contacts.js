var express = require('express');
const { param } = require('../../common/history');
var router = express.Router();
var utils = require('../../common/utils');
var moment = require('moment-timezone');

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

	if (contacts_data != null){
		//Eloqua Contacts 조회

		//business_department ( AS , CLS , CM , ID , IT , Solar , Solution , Vertical )
		var request_data = Convert_B2BGERP_KR_DATA(contacts_data, business_name);

		res.json({ ContentList: request_data });
	}else{
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

router.post('/customObject', function (req, res, next) {
	var data = req.body;
	var queryString ="";
	b2bkr_eloqua.data.customObjects.data.get(queryString).then((result) => {
		console.log(result);
		res.json(result);
	}).catch((err) => {
		console.error(err.message);
		res.send(error);
	});
});



//커스텀 오브젝트 데이터 추가
router.post('/customObjectDataCreate', async function (req, res, next) {
	var req_data = req.body;
	var queryString ="";

	//해당 사용자 데이터 여부 확인
	var contact_data = await GetContactData(req_data.contactEmailAddr);

	if(contact_data && contact_data.total > 0){
    	//만약 기존 사용자 정보중 isSubscribed false이면 true로 변경 contact_data.elements[0].isSubscribed
		if( contact_data.elements[0].isSubscribed === 'false'){
			contact_data.elements[0].isSubscribed = true;
			await UpdateContacData(contact_data.elements[0]);
		}

		var customObjectCreateData = ConvertCustomObjectData(contact_data.elements[0], req_data);
		var result_data = await SendCreateCustomObjectData(customObjectCreateData);
		console.log(result_data.data);
		res.json(result_data.data);
  	}
	else{
		//사용자가 없을경우 사용자 추가
		var contact_data = await InsertContactData(req_data);

		//사용자 추가 후 CustomObjectData 추가
		if(contact_data.data){
			var customObjectCreateData = ConvertCustomObjectData(contact_data.data, req_data);
			var result_data = await SendCreateCustomObjectData(customObjectCreateData);
			console.log(result_data.data);
			res.json(result_data.data);
		}else{
			res.json({"Error" : "사용자 생성 오류"});
		}
	}
});

function KR_OBJECT_DATA_ENTITY() {
	//this.accessedAt = ""; read only
	//this.accountId = ""; read only
	this.contactId = "";
	//this.createdAt = ""; read only
	//this.createdBy = ""; read only
	//this.currentStatus = "";
	//this.customObjectRecordStatus = "";
	//this.depth = ""; read only
	//this.description = "";

	this.fieldValues = [];

	//this.folderId = ""; read only
	//this.id = ""; read only
	this.isMapped = "Yes";
	this.name = "TestName";
	//this.permissions = "";  read only
	//this.scheduledFor = ""; read only
	//this.sourceTemplateId = "";
	this.type = "CustomObjectData";
	//this.uniqueCode = "";
	//this.updatedAt = "";  read only
	//this.updatedBy = "";  read only
}

function ConvertCustomObjectData(_contact, _req_data){
	var contact = _contact;
	var convert_data_entity = new KR_OBJECT_DATA_ENTITY();
	convert_data_entity.contactId = contact.id;

	//LG전자 마케팅 정보 수신 동의 일자 id : 301
	convert_data_entity.fieldValues.push({ "id" : "301", "value" : moment().tz('Asia/Seoul').unix()}); //LG전자 마케팅 정보 수신 동의 일자	date	text
	convert_data_entity.fieldValues.push({ "id" : "300", "value" : moment().tz('Asia/Seoul').unix()}); //개인정보 국외 이전 동의 일자	date	text
	convert_data_entity.fieldValues.push({ "id" : "299", "value" : moment().tz('Asia/Seoul').unix()}); //개인정보 위탁 처리 동의 일자	date	text			
	convert_data_entity.fieldValues.push({ "id" : "298", "value" : moment().tz('Asia/Seoul').unix()}); //개인정보 수집 및 이용동의 일자	date	text			
	convert_data_entity.fieldValues.push({ "id" : "297", "value" : _req_data.dtlAddr}); //제품설치지역 시군구	text	text			
	convert_data_entity.fieldValues.push({ "id" : "296", "value" : _req_data.addr}); //제풍설치지역 도시	text	text			
	convert_data_entity.fieldValues.push({ "id" : "295", "value" : _req_data.dtlSector}); //상세업종	text	text			
	convert_data_entity.fieldValues.push({ "id" : "294", "value" : _req_data.sector}); //업종	text	text			
	convert_data_entity.fieldValues.push({ "id" : "293", "value" : _req_data.unifyId}); //통합회원 유니크 아이디	text	text		
	convert_data_entity.fieldValues.push({ "id" : "292", "value" : _req_data.mktRecYn == "Y" ? "Yes" : "No"}); //LG전자 마케팅 정보 수신 동의 여부	text	checkbox	Yes	No	No
	convert_data_entity.fieldValues.push({ "id" : "291", "value" : _req_data.tpiYn == "Y" ? "Yes" : "No"}); //개인정보 국외 이전 동의 여부	text	checkbox	Yes	No	No
	convert_data_entity.fieldValues.push({ "id" : "290", "value" : _req_data.pcYn == "Y" ? "Yes" : "No"}); //개인정보 위탁 처리 동의 여부	text	checkbox	Yes	No	No
	convert_data_entity.fieldValues.push({ "id" : "289", "value" : _req_data.ppYn == "Y" ? "Yes" : "No"}); //개인정보 수집 및 이용동의 여부	text	checkbox	Yes	No	No
	convert_data_entity.fieldValues.push({ "id" : "288", "value" : _req_data.typeName}); //타입 명	text	text			
	convert_data_entity.fieldValues.push({ "id" : "287", "value" : _req_data.dtlCategoryName}); //상세 카테고리 명	text	text			
	convert_data_entity.fieldValues.push({ "id" : "286", "value" : _req_data.categoryName}); //카테고리 명	text	text			
	convert_data_entity.fieldValues.push({ "id" : "285", "value" : _req_data.b2bBillToCode}); //b2b 전문점 코드	text	text			
	convert_data_entity.fieldValues.push({ "id" : "284", "value" : _req_data.sendCount}); //발송건수(1 하드코딩)	text	text			
	convert_data_entity.fieldValues.push({ "id" : "283", "value" : _req_data.productDesc}); //제품설명	text	text			
	convert_data_entity.fieldValues.push({ "id" : "282", "value" : _req_data.custRemark}); //고객요청사항	largeText	textArea			
	convert_data_entity.fieldValues.push({ "id" : "281", "value" : _req_data.modelCode}); //모델코드	text	text			
	convert_data_entity.fieldValues.push({ "id" : "280", "value" : _req_data.contactEmailAddr}); //담당자전자우편주소	text	text			
	convert_data_entity.fieldValues.push({ "id" : "279", "value" : _req_data.contactCellularNo}); //담당자이동전화번호	text	text			
	convert_data_entity.fieldValues.push({ "id" : "278", "value" : _req_data.contactPhoneNo}); //담당자전화번호	text	text			
	convert_data_entity.fieldValues.push({ "id" : "277", "value" : _req_data.contactName}); //담당자명	text	text			
	convert_data_entity.fieldValues.push({ "id" : "276", "value" : _req_data.emailAddr}); //전자우편주소	text	text			
	convert_data_entity.fieldValues.push({ "id" : "275", "value" : _req_data.phoneNo}); //전화번호	text	text			
	convert_data_entity.fieldValues.push({ "id" : "274", "value" : _req_data.detailAddr}); //상세주소	text	text			
	convert_data_entity.fieldValues.push({ "id" : "273", "value" : _req_data.baseAddr}); //기본주소	text	text			
	convert_data_entity.fieldValues.push({ "id" : "272", "value" : _req_data.postalCode}); //우편번호	text	text			
	convert_data_entity.fieldValues.push({ "id" : "271", "value" : _req_data.corpRegisterNo}); //법인등록번호	text	text			
	convert_data_entity.fieldValues.push({ "id" : "270", "value" : _req_data.bizRegisterNo}); //사업자등록번호	text	text			
	convert_data_entity.fieldValues.push({ "id" : "269", "value" : _req_data.customerName}); //고객명	text	text			
	convert_data_entity.fieldValues.push({ "id" : "268", "value" : _req_data.estimationSeqNo}); //견적일련번호	text	text			
	convert_data_entity.fieldValues.push({ "id" : "267", "value" : _req_data.estimationId}); //견적번호	text	text			

	return convert_data_entity;
}

//CustomObjectData 전송 함수
async function SendCreateCustomObjectData(_customObjectCreateData){
	var return_data = undefined;
	//LGE KR 사용자정의 객체 / LGEKR(한영본)_대표사이트B2B_온라인문의 id : 39
	await b2bkr_eloqua.data.customObjects.data.create(39,_customObjectCreateData).then((result) => {
		console.log(result);
		return_data = result;
	}).catch((err) => {
		console.error(err);
		console.error(err.message);
		return_data = err.message;
	});
	return return_data;
}

//연락처 조회 함수
async function GetContactData(_email){
	var queryString = {};
	var return_data = undefined;
	//queryString['search'] = _email;
	queryString.search = _email ;
	queryString.depth = "partial"; //minimal, partial, complete
	await b2bkr_eloqua.data.contacts.get(queryString).then((result) => { 
	if( result.status == 200 && result.data.total > 0)
		return_data = result.data;
	}).catch((err) => {
		return_data = undefined;
	});
	return return_data;
}

//연락처 추가 함수
async function InsertContactData(_req_data){
	var contact_data = {};
	contact_data.accountname = _req_data.customerName;
	contact_data.address1 = _req_data.baseAddr;
	contact_data.address2 = _req_data.detailAddr;
	contact_data.postalCode = _req_data.postalCode;
	contact_data.businessPhone = _req_data.phoneNo;
	contact_data.emailAddress = _req_data.contactEmailAddr;
	contact_data.mobilePhone = _req_data.contactCellularNo;
	contact_data.firstName = _req_data.contactName.substring(1,_req_data.contactName.length);
	contact_data.lastName = _req_data.contactName.substring(0,1);
  
	await b2bkr_eloqua.data.contacts.create( contact_data, ).then((result) => {
		console.log(result);
		return_data = result;
	}).catch((err) => {
		console.error(err);
		console.error(err.message);
		return_data = err.message;
	});
	return return_data;
}

//연락처 업데이트 함수
async function UpdateContacData(_contact){
	var contact = _contact;
	if(contact.accountName){
		contact.accountname = contact.accountName;
		delete contact.accountName; 
	}

	await b2bkr_eloqua.data.contacts.update( contact.id, contact ).then((result) => {
		console.log(result);
		return_data = result;
	}).catch((err) => {
		console.error(err);
		console.error(err.message);
		return_data = err.message;
	});
	return return_data;
}

//커스텀 오브젝트 데이터 조회
router.get('/customObjectDataSearch/:id', function (req, res, next) {
	var parentId = req.params.id;
	var queryString = "";
	//queryString.emailAddress = req.params.email;

	b2bkr_eloqua.data.customObjects.data.get(parentId,queryString).then((result) => {
		console.log(result.data);
		res.json(result.data);
	}).catch((err) => {
		console.error(err.message);
		res.send(error);
	});
});

//커스텀 오브젝트 조회
router.get('/customObjectSearch', function (req, res, next) {
	var queryString ="";
	b2bkr_eloqua.assets.customObjects.get(queryString).then((result) => {
		console.log(result.data);
		res.json(result.data);
	}).catch((err) => {
		console.error(err.message);
		res.json(false);
	});
});

//커스텀 오브젝트 조회 단건
router.get('/customObjectSearchOne/:id', function (req, res, next) {
	var id = req.params.id;
	var queryString ="";
	b2bkr_eloqua.assets.customObjects.getOne(id,queryString).then((result) => {
		console.log(result.data);
		res.json(result.data);
	}).catch((err) => {
		console.error(err.message);
		res.json(false);
	});
});
module.exports = router;
