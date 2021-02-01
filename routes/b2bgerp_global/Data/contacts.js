var moment = require('moment');
var express = require('express');
var router = express.Router();
var httpRequest = require('../../common/httpRequest');
var utils = require('../../common/utils');
const { param } = require('../../common/history');

/* Contacts */

//BANT 조건 Eloqua 조회 함수
async function get_b2bgerp_global_bant_data(_business_name) {
  //BANT 조건 : Status - Contact / Pre-lead / MQL

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
      break;
  }

  

  var queryText = "?search=" + status_bant + "='MQL'";
  //금일 날짜 00시 00분 01초 , 23시 59분 59초 값 얻어오기

  //조회날짜 Create , Update
  // 필요할 경우 사용, 오늘 날짜와 start , end time unix 값을 key로 반환
  //var today_Object =  utils.today_getUnixTime();
  // var yesterday_Object = utils.yesterday_getUnixTime();
  // queryText += "createdAt>'" + yesterday_Object.start +"'createdAt<'"+ yesterday_Object.end + "'";
  // queryText += "updatedAt>'" + yesterday_Object.start +"'updatedAt<'"+ yesterday_Object.end + "'";
  
  var yesterday_Object = utils.today_getUnixTime();
  queryText += "createdAt>'" + yesterday_Object.start +"'createdAt<'"+ yesterday_Object.end + "'";
  queryText += "updatedAt>'" + yesterday_Object.start +"'updatedAt<'"+ yesterday_Object.end + "'";

  // Test Code 한줄
  // queryText = "emailAddress='hso_Test@goldenplanet.co.kr'"
  queryString['search'] = queryText;
  queryString['depth'] = "complete";
  queryString['count'] = 10;

  await b2bgerp_eloqua.data.contacts.get(queryString).then((result) => {

    if (result.data.total && result.data.total > 0) {
      contacts_data = result.data;
      console.log(result.data);
    }
  }).catch((err) => {
    console.error(err.message);
    return null;
  });
  return contacts_data;
}

function B2B_GERP_GLOBAL_ENTITY() {
  this.INTERFACE_ID = "ELOQUA_0003",
    this.LEAD_NAME = "";        //리드네임 [MQL]Subsidiary_BU_Platform&Activity_Register Date+Hour 값을 조합
  this.SITE_NAME = "";				//사이트네임
  this.LEAD_SOURCE_NAME = "";	//리드소스 네임 Platform&Activity 필드 매핑
  this.LEAD_SOURCE_TYPE = "11";//default 11 ? Eloqua에서 넘어오는 값이면 By Marketing, 영업인원이 수기입할 경우 By Sales로 지정
  this.ENTRY_TYPE = "L"      //default L
  this.ACCOUNT = "";          //회사
  this.CONTACT_POINT = "";    //Contact Point는 Eloqua 필드 중 -> Customer Name/Email/Phone No. 를 연결 시켜 매핑 필요
  this.CORPORATION = "";      //법인정보
  this.OWNER = "";            //데이터 없음
  this.ADDRESS = "";          //현업확인 Address1 + Address2 + Address3
  this.DESCRIPTION = "";      //설명 Comments, message, inquiry-to-buy-message 필드 중 하나
  this.ATTRIBUTE_1 = "";      //엘로코아 CONTACT ID
  this.ATTRIBUTE_2 = "";      //PRODUCT LV1의 BU 별 Budget
  this.ATTRIBUTE_3 = "";      //픽리스트 eloqua 확인 
  this.ATTRIBUTE_4 = "";      //이메일
  this.ATTRIBUTE_5 = "";      //전화번호
  this.ATTRIBUTE_6 = "";      //확인필요
  this.ATTRIBUTE_7 = "";      //지역 - 국가 eloqua filed 정보
  this.ATTRIBUTE_8 = "";      //넷중 하나 또는 4개의 필드 정보 합 ( 확인 필요 )
  this.ATTRIBUTE_9 = "";      //Job Function
  this.ATTRIBUTE_10 = "";     //데이터 없음
  this.ATTRIBUTE_11 = "";     //사업부코드( 코드마스터 필요 ) 예) HE    LGE 앞자리 빼는지 확인 필요
  this.ATTRIBUTE_12 = "";     //Seniority
  this.ATTRIBUTE_13 = "";     //PRODUCT LV1의 BU 별 Needs
  this.ATTRIBUTE_14 = "";     //PRODUCT LV1의 BU 별 Timeline
  this.ATTRIBUTE_15 = "";     //Marketing Event
  this.ATTRIBUTE_16 = "";     //Privacy Policy YN
  this.ATTRIBUTE_17 = "";     //Privacy Policy Date
  this.ATTRIBUTE_18 = "";     //TransferOutside EEA YN
  this.ATTRIBUTE_19 = "";     //TransferOutside EEA Date
  this.ATTRIBUTE_20 = "";     //ELOQUA 내 Product 1
  this.ATTRIBUTE_21 = "";     //ELOQUA 내 Product 2 없을경우 NULL
  this.ATTRIBUTE_22 = "";     //ELOQUA 내 Product 3 없을경우 NULL
  this.ATTRIBUTE_23 = "";     //Vertical Type B2B GERP Global Code mapping
  this.REGISTER_DATE = "";    //어떤 날짜 정보인지 확인 필요
  this.TRANSFER_DATE = "";    //어떤 날짜 정보인지 확인 필요
  this.TRANSFER_FLAG = "";		//TRANSFER_FLAG N , Y 값의 용도 확인 필요
  this.LAST_UPDATE_DATE = ""; //데이터 없음
  this.API_G_CODE = "";       //API 구분코드 추가요건 사항
  //Building Type을 Vertical Type으로 변경하고 전사 Vertical 기준에 맞추어 매핑 필요 - LG.com내에도 항목 수정 필요하니 요청 필요함
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

  // 100197	//Business Unit_For_User ?
  // 100229	//Business Unit ?
  // 100295	//Country & Business Unit Merge for Subsidiary Code ?

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
          // 100324	Solar_Authority2(Job Function)  
          result_data = GetCustomFiledValue(fieldValues, 100324);
          break;
        case "Business Unit":
          // 100333	//Business Unit_Solar
          result_data = GetCustomFiledValue(fieldValues, 100333);

          break;
        case "Seniority":
          // 100290	Solar_Authority1(Seniority)
          result_data = GetCustomFiledValue(fieldValues, 100290);
          break;
        case "Needs":
          // 100270	Solar_Needs(Home Owner)
          result_data = GetCustomFiledValue(fieldValues, 100270);
          // 100291	Solar_Needs(Business Customer)    
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
          // 필드확인 필요 
          result_data = "";
          break;
        case "Business Unit":
          // 100335	//Business Unit_Solution  
          result_data = GetCustomFiledValue(fieldValues, 100335);
          break;
        case "Seniority":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Needs":
          // 필드확인 필요 
          result_data = "";
          break;
        case "TimeLine":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Budget":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Product_Category":
          // 필드확인 필요 
          result_data = "";
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
    case "Vertical":
      switch (key) {
        case "Job Function":
          // 100321	Vertical_Authority2(Job Function)      
          result_data = GetCustomFiledValue(fieldValues, 100321);
          break;
        case "Business Unit":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Seniority":
          // 100228	Vertical_Authority1(Seniority)
          result_data = GetCustomFiledValue(fieldValues, 100228);
          break;
        case "Needs":
          // 100222	Vertical_Needs 
          result_data = GetCustomFiledValue(fieldValues, 100222);
          break;
        case "TimeLine":
          // 필드확인 필요 
          result_data = "";
          break;
        case "Budget":
          // 100224	Vertical_Budget
          result_data = GetCustomFiledValue(fieldValues, 100224);
          break;
        case "Product_Category":
          // 100225	Vertical_Product Category
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
function Convert_B2BGERP_GLOBAL_DATA(contacts_data, business_department) {
  var result_data = [];

  for (var i = 0; i < contacts_data.elements.length; i++) {
    try {
      var result_item = new B2B_GERP_GLOBAL_ENTITY();
      var FieldValues_data = contacts_data.elements[i].fieldValues;

      result_item.INTERFACE_ID = "ELOQUA_0003" // this.INTERFACE_ID = "ELOQUA_0003"
      //리드네임 [MQL]Subsidiary_BU_Platform&Activity_Register Date+Hour 값을 조합
      //리드네임 {{Business Unit}}_{{Subsidiary}}_{{Platform}}_{{Activity}}_{{Date}}
      //리드네임 {{Business Unit}}_{{Subsidiary}}_{{Platform&Activity}}_{{Date}}
      //리드네임 {{100229}}_{{100196}}_{{100202}}_{{100026}}
      result_item.LEAD_NAME =
        GetCustomFiledValue(FieldValues_data, 100229) + "_" +
        business_department + "_" +
        GetCustomFiledValue(FieldValues_data, 100196) + "_" +
        GetCustomFiledValue(FieldValues_data, 100202) + "_" +
        GetCustomFiledValue(FieldValues_data, 100026);
      result_item.SITE_NAME = GetCustomFiledValue(FieldValues_data, 100187);        //100187	Territory //SITE_NAME ( 현장명 매핑필드 확인 )
      result_item.LEAD_SOURCE_TYPE = "11";                                          //default 11 (협의됨) //Eloqua에서 넘어오는 값이면 By Marketing, 영업인원이 수기입할 경우 By Sales로 지정
      result_item.LEAD_SOURCE_NAME = GetCustomFiledValue(FieldValues_data, 100196); //리드소스 네임 Platform&Activity 필드 매핑
      result_item.ENTRY_TYPE = "L"                                                  //default L
      result_item.ACCOUNT = GetDataValue(contacts_data.elements[i].accountName);    //ACCOUNT ( 회사 )
      result_item.CONTACT_POINT =
        GetCustomFiledValue(FieldValues_data, 100172) + "/" +
        //GetDataValue(contacts_data.elements[i].firstName) + " " + GetDataValue(contacts_data.elements[i].lastName) + "/" +
        GetDataValue(contacts_data.elements[i].emailAddress) + "/" +
        GetDataValue(contacts_data.elements[i].mobilePhone);                        //Contact Point는 Eloqua 필드 중 -> Customer Name/Email/Phone No. 를 연결 시켜 매핑 필요
      result_item.CORPORATION = "";                                                 //법인정보 (확인필요);
      result_item.OWNER = "";                                                       //(확인필요);
      result_item.ADDRESS =
        GetDataValue(contacts_data.elements[i].address1) + " " +
        GetDataValue(contacts_data.elements[i].address2) + " " +
        GetDataValue(contacts_data.elements[i].address3);                           //주소정보 Address1 + Address2 + Address3
      result_item.DESCRIPTION = GetDataValue(contacts_data.elements[i].description);//설명 Comments, message, inquiry-to-buy-message 필드 중 하나 (확인필요) //DESCRIPTION
      result_item.ATTRIBUTE_1 = GetDataValue(contacts_data.elements[i].id);         //Eloqua Contact ID
      result_item.ATTRIBUTE_2 = GetBusiness_Department_data(FieldValues_data, business_department, "Budget"); //PRODUCT LV1의 BU 별 
      result_item.ATTRIBUTE_3 = "";                                                     //픽리스트 eloqua 확인
      result_item.ATTRIBUTE_4 = GetDataValue(contacts_data.elements[i].emailAddress);   //이메일
      result_item.ATTRIBUTE_5 = GetDataValue(contacts_data.elements[i].mobilePhone);    //전화번호 (businessPhone 확인필요)
      result_item.ATTRIBUTE_6 = "";                                                     //(확인필요)
      result_item.ATTRIBUTE_7 = GetCustomFiledValue(FieldValues_data, 100069);          //지역 - 국가 eloqua filed 정보
      result_item.ATTRIBUTE_8 = "";
      result_item.ATTRIBUTE_9 = GetBusiness_Department_data(FieldValues_data, business_department, "Job Function"); //(Job Function 사업부별 컬럼 확인 필요)
      result_item.ATTRIBUTE_10 = GetBusiness_Department_data(FieldValues_data, business_department, "Business Unit"); //(Business Unit 사업부별 컬럼 확인 필요)
      result_item.ATTRIBUTE_11 = "";                                                    //division (확인필요) 사업부코드( 코드마스터 필요 ) 예) HE    LGE 앞자리 빼는지 확인 필요
      result_item.ATTRIBUTE_12 = GetBusiness_Department_data(FieldValues_data, business_department, "Seniority"); //Seniority
      result_item.ATTRIBUTE_13 = GetBusiness_Department_data(FieldValues_data, business_department, "Needs");     //PRODUCT LV1의 BU 별 Needs //(Nees 사업부별 컬럼 확인 필요)
      result_item.ATTRIBUTE_14 = GetBusiness_Department_data(FieldValues_data, business_department, "TimeLine");  //PRODUCT LV1의 BU 별 Timeline //(Nees 사업부별 컬럼 확인 필요)
      result_item.ATTRIBUTE_15 = GetCustomFiledValue(FieldValues_data, 100203);                                   //Marketing Eventdf //100203	Marketing Event
      result_item.ATTRIBUTE_16 = GetCustomFiledValue(FieldValues_data, 100213) == "Yes" ? "Y" : "N";              //Privacy Policy YN //100213	Privacy Policy_Agreed
      result_item.ATTRIBUTE_17 = utils.timeConverter("GET_DATE", GetCustomFiledValue(FieldValues_data, 100199));  //Privacy Policy Date : 100199	Privacy Policy_AgreedDate
      result_item.ATTRIBUTE_18 = GetCustomFiledValue(FieldValues_data, 100210) == "Yes" ? "Y" : "N";     //TransferOutside EEA YN : 100210	TransferOutsideCountry
      result_item.ATTRIBUTE_19 = utils.timeConverter("GET_DATE", GetCustomFiledValue(FieldValues_data, 100208));  //TransferOutside EEA Date : 100208	TransferOutsideCountry_AgreedDate
      result_item.ATTRIBUTE_20 = GetBusiness_Department_data(FieldValues_data, "Product_Category");     //ELOQUA 내 Product 1 //(사업부별 컬럼 확인 필요)
      result_item.ATTRIBUTE_21 = GetBusiness_Department_data(FieldValues_data, "Product_SubCategory");  //ELOQUA 내 Product 2 없을경우 NULL // (사업부별 컬럼 확인 필요)
      result_item.ATTRIBUTE_22 = GetBusiness_Department_data(FieldValues_data, "Product_Model");        //ELOQUA 내 Product 3 없을경우 NULL // (사업부별 컬럼 확인 필요)
      result_item.ATTRIBUTE_23 = "";     //Vertical Type B2B GERP Global Code mapping
      result_item.REGISTER_DATE = moment().format('YYYY-MM-DD hh:mm:ss');    //어떤 날짜 정보인지 확인 필요 //utils.timeConverter("GET_DATE", contacts_data.elements[i].createdAt);
      result_item.TRANSFER_DATE = moment().format('YYYY-MM-DD hh:mm:ss');    //어떤 날짜 정보인지 확인 필요
      result_item.TRANSFER_FLAG = "Y";	 //TRANSFER_FLAG N , Y 값의 용도 확인 필요
      result_item.LAST_UPDATE_DATE = utils.timeConverter("GET_DATE", contacts_data.elements[i].updatedAt);
      result_item.API_G_CODE = "";       //API 구분코드 추가요건 사항

      result_data.push(result_item);
    }
    catch (e) {
      console.log(e);
    }
  }
  return result_data;
}

router.get('/:businessName', async function (req, res, next) {
  var business_name = req.params.businessName;
  //business_department ( AS , CLS , CM , ID , IT , Solar , Solution, Kr)

  //BANT기준 B2B GERP GLOBAL CONTACTS 조회
  var contacts_data = await get_b2bgerp_global_bant_data(business_name);

  // res.json(contacts_data);
  // return;
  if (contacts_data != null) {
    //Eloqua Contacts
    //business_department ( AS , CLS , CM , ID , IT , Solar , Solution , Vertical )
    var request_data = Convert_B2BGERP_GLOBAL_DATA(contacts_data, business_name);

    res.json({ ContentList: request_data });

    return;
  }
  else
  {
    res.json(false);
  }
  //API Gateway 데이터 전송

  //Log
  //res.json(true);
  return;
});

router.get('/req_data', function (req, res, next) {
  var id = 941;
  b2bgerp_eloqua.data.contacts.getOne(id).then((result) => {
    console.log(result.data);
    httpRequest.sender("http://localhost:8001/b2bgerp_global/contacts/req_data_yn", "POST", result.data);
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
