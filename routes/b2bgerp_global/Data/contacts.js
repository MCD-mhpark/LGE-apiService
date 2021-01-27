var moment = require('moment');
var express = require('express');
var router = express.Router();
var httpRequest = require('../../common/httpRequest');
var utils = require('../../common/utils');

/* Contacts */

//BANT 조건 Eloqua 조회 함수
async function get_b2bgerp_global_bant_data() {
  //BANT 조건
	var BantList = [ "C_AS_Needs1", "C_AS_Authority1", "C_AS_Budget1", "C_AS_TimeLine1",
	"C_Vertical_Needs1", "C_Vertical_Timeline1", "C_Vertical_Budget1", "C_Vertical_Authority1",
	"C_ID_Needs1", "C_ID_TimeLine1", "C_ID_Budget1", "C_ID_Authority1",
	"C_IT_Needs1", "C_IT_TimeLine1", "C_IT_Budget1", "C_IT_Authority1",
	"C_Solar_Authority1", "C_Solar_Needs1", "C_Solar_TimeLine1", "C_Solar_Budget1", "C_Solar_Needs_Business_Customer_1" ,
	"C_CLS_Needs1", "C_CLS_TimeLine1", "C_CLS_Budget1", "C_CLS_Authority1",
	"C_CM_Needs1", "C_CM_TimeLine1", "C_CM_Budget1", "C_CM_Authority1" ];

	var BantList = [ "C_AS_Needs1", "C_AS_Authority1", "C_AS_Budget1", "C_AS_TimeLine1" ];
	var BantList1 = ["C_Vertical_Needs1", "C_Vertical_Timeline1", "C_Vertical_Budget1", "C_Vertical_Authority1" ];
	var BantList2 = [ "C_AS_Needs1", "C_AS_Authority1", "C_AS_Budget1", "C_AS_TimeLine1" ];
	var BantList3 = [ "C_AS_Needs1", "C_AS_Authority1", "C_AS_Budget1", "C_AS_TimeLine1" ];

	var contacts_data;
	var queryString = {}
	var queryText = "";
	
	for(var i =0 ; BantList.length > i ; i++){
		queryText += BantList[i] + "!=''" 
	}

	// Test Code 한줄
	queryText = "emailAddress='hso_Test@goldenplanet.co.kr'"
	

	queryString['search'] = queryText;
 	queryString['depth'] = "complete";
 	queryString['count'] = 10;
	//console.log(queryString);

    await b2bgerp_eloqua.data.contacts.get(queryString).then((result) => {
    

		if (result.data.total && result.data.total > 0) {
      contacts_data = result.data;
      console.log(result.data);
			// res.json( result.data);
		}
    }).catch((err) => {
		console.error(err.message);
		return null;
    });
    return contacts_data;
}

function B2B_GERP_GLOBAL_ENTITY(){
    this.INTERFACE_ID = "ELOQUA_0003",
    this.LEAD_NAME = "";        //리드네임 [MQL]Subsidiary_BU_Platform&Activity_Register Date+Hour 값을 조합
    this.SITE_NAME = "";				//사이트네임
    this.LEAD_SOURCE_NAME = "";	//리드소스 네임 Platform&Activity 필드 매핑
    this.LEAD_SOURCE_TYPE = "11";//default 11 ? Eloqua에서 넘어오는 값이면 By Marketing, 영업인원이 수기입할 경우 By Sales로 지정
    this.ENTRY_TYPE  = "L"      //default L
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

  var result_data = null;

  for (var fieled_index in contacts_customfields) {
    var fieldValue_id = contacts_customfields[fieled_index].id;
    var fieldValue_value = contacts_customfields[fieled_index].value;

    if (fieldValue_id == customfieldID) {
      if (fieldValue_value != undefined) {
        result_data = fieldValue_value;
        break;
      }
      else {
        result_data = null;
        break;
      }
    }
  }
  return result_data;
}

function GetDataValue(contacts_fieldvalue) {
  try
  {
    if (contacts_fieldvalue != undefined) {
      return contacts_fieldvalue;
    }
    else {
      return "";
    }
  }
  catch(e)
  {
    console.log(e);
    return "";
  }
}

//Eloqua Data B2B GERP Global Mapping 데이터 생성
function Convert_B2BGERP_GLOBAL_DATA(contacts_data) {
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
        GetCustomFiledValue(FieldValues_data, 100196) + "_" +
        GetCustomFiledValue(FieldValues_data, 100202) + "_" +
        GetCustomFiledValue(FieldValues_data, 100026);

      //SITE_NAME ( 현장명 매핑필드 확인 )
      result_item.SITE_NAME = GetDataValue(contacts_data.elements[i].title);

      //Eloqua에서 넘어오는 값이면 By Marketing, 영업인원이 수기입할 경우 By Sales로 지정
      //default 11 (협의됨)
      result_item.LEAD_SOURCE_TYPE = "11";

      //리드소스 네임 Platform&Activity 필드 매핑
      result_item.LEAD_SOURCE_NAME = GetCustomFiledValue(FieldValues_data, 100196);
      
      //default L
      result_item.ENTRY_TYPE = "L"

      //ACCOUNT ( 회사 )
      result_item.ACCOUNT = GetDataValue(contacts_data.elements[i].accountName);

      //Contact Point는 Eloqua 필드 중 -> Customer Name/Email/Phone No. 를 연결 시켜 매핑 필요
      result_item.CONTACT_POINT = 
      GetCustomFiledValue(FieldValues_data, 100172) + "/" +
      //GetDataValue(contacts_data.elements[i].firstName) + " " + GetDataValue(contacts_data.elements[i].lastName) + "/" +
      GetDataValue(contacts_data.elements[i].emailAddress) + "/" +
        GetDataValue(contacts_data.elements[i].mobilePhone);

        result_item.CORPORATION = "";      //법인정보 (확인필요);
        result_item.OWNER = "";            //(확인필요);
      //주소정보 Address1 + Address2 + Address3
      result_item.ADDRESS =
        GetDataValue(contacts_data.elements[i].address1) + " " +
        GetDataValue(contacts_data.elements[i].address2) + " " +
        GetDataValue(contacts_data.elements[i].address3);

      //DESCRIPTION
      result_item.DESCRIPTION = GetDataValue(contacts_data.elements[i].description);      //설명 Comments, message, inquiry-to-buy-message 필드 중 하나 (확인필요)

      //Eloqua Contact ID
      result_item.ATTRIBUTE_1 = GetDataValue(contacts_data.elements[i].id);
      result_item.ATTRIBUTE_2 = "";      //PRODUCT LV1의 BU 별 Budget

      result_item.ATTRIBUTE_3 = "";      //픽리스트 eloqua 확인 
      result_item.ATTRIBUTE_4 = GetDataValue(contacts_data.elements[i].emailAddress);  //이메일
      result_item.ATTRIBUTE_5 = GetDataValue(contacts_data.elements[i].mobilePhone);   //전화번호 (businessPhone 확인필요)
      result_item.ATTRIBUTE_6 = "";      //(확인필요)

      //지역 - 국가 eloqua filed 정보
      result_item.ATTRIBUTE_7 = GetCustomFiledValue(FieldValues_data, 100069);

      result_item.ATTRIBUTE_8 = "";   //넷중 하나 또는 4개의 필드 정보 합 ( 확인 필요 )

      result_item.ATTRIBUTE_9 = "";   //(Job Function 사업부별 컬럼 확인 필요)
      // 100214	IT_Authority2(Job Function)
      // 100321	Vertical_Authority2(Job Function)
      // 100322	ID_Authority2(Job Function)
      // 100323	AS_Authority2(Job Function)
      // 100324	Solar_Authority2(Job Function)
      // 100327	CLS_Authority2(Job Function)
      // 100325	CM_Authority2(Job Function)

      result_item.ATTRIBUTE_10 = "";  //(Business Unit 사업부별 컬럼 확인 필요)
      // 100197	//Business Unit_For_User
      // 100229	//Business Unit
      // 100295	//Country & Business Unit Merge for Subsidiary Code
      // 100328	//Business Unit_AS
      // 100329	//Business Unit_CLS
      // 100330	//Business Unit_CM
      // 100331	//Business Unit_ID
      // 100332	//Business Unit_IT
      // 100333	//Business Unit_Solar
      // 100335	//Business Unit_Solution

      result_item.ATTRIBUTE_11 = "";     //division (확인필요) 사업부코드( 코드마스터 필요 ) 예) HE    LGE 앞자리 빼는지 확인 필요

      result_item.ATTRIBUTE_12 = "";     //Seniority
      // 100219	AS_Authority1(Seniority)
      // 100228	Vertical_Authority1(Seniority)
      // 100262	ID_Authority1(Seniority)
      // 100269	IT_Authority1(Seniority)
      // 100288	CM_Authority1(Seniority)
      // 100289	CLS_Authority1(Seniority)
      // 100290	Solar_Authority1(Seniority)

      result_item.ATTRIBUTE_13 = "";     //PRODUCT LV1의 BU 별 Needs //(Nees 사업부별 컬럼 확인 필요)
      // 100215	AS_Needs
      // 100222	Vertical_Needs
      // 100254	ID_Needs
      // 100264	IT_Needs
      // 100270	Solar_Needs(Home Owner)
      // 100276	CLS_Needs
      // 100282	CM_Needs
      // 100291	Solar_Needs(Business Customer)

      result_item.ATTRIBUTE_14 = "";     //PRODUCT LV1의 BU 별 Timeline //(Nees 사업부별 컬럼 확인 필요)
      // 100221	AS_TimeLine
      // 100223	Vertical_Timeline
      // 100255	ID_TimeLine
      // 100265	IT_TimeLine
      // 100272	Solar_TimeLine
      // 100278	CLS_TimeLine
      // 100284	CM_TimeLine

      //Marketing Eventdf //100203	Marketing Event
      result_item.ATTRIBUTE_15 = GetCustomFiledValue(FieldValues_data , 100203);     

      //Privacy Policy YN //100213	Privacy Policy_Agreed
      result_item.ATTRIBUTE_16 = GetCustomFiledValue(FieldValues_data , 100213);     

      //Privacy Policy Date : 100199	Privacy Policy_AgreedDate      
      result_item.ATTRIBUTE_17 = GetCustomFiledValue(FieldValues_data , 100199);     

      //TransferOutside EEA YN : 100210	TransferOutsideCountry
      result_item.ATTRIBUTE_18 = GetCustomFiledValue(FieldValues_data , 100210);     
      
      //TransferOutside EEA Date : 100208	TransferOutsideCountry_AgreedDate
      result_item.ATTRIBUTE_19 = GetCustomFiledValue(FieldValues_data , 100208);     
      
      result_item.ATTRIBUTE_20 = "";     //ELOQUA 내 Product 1 //(사업부별 컬럼 확인 필요)
      result_item.ATTRIBUTE_21 = "";     //ELOQUA 내 Product 2 없을경우 NULL //(사업부별 컬럼 확인 필요)
      result_item.ATTRIBUTE_22 = "";     //ELOQUA 내 Product 3 없을경우 NULL //(사업부별 컬럼 확인 필요)
      // AS_Product Category
      // Vertical_Product Category
      // ID_Product Category
      // IT_Product Category
      // Solar_Product Category
      // CLS_Product Category
      // CM_Product Category

      // ID_Product_Sub-Category
      // IT_Product Subcategory

      // ID_Product_ModelName
      // IT_Product_ModelName

      // ShowroomCD_ProductCategory
      
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

router.get('/', async function (req, res, next) {

	//BANT기준 B2B GERP GLOBAL CONTACTS 조회
	var contacts_data = await get_b2bgerp_global_bant_data();

	// res.json(contacts_data);
	// return;
	if( contacts_data != null )
	{
		//Eloqua Contacts 조회
		var request_data = Convert_B2BGERP_GLOBAL_DATA(contacts_data);
		
		res.json({ContentList:request_data});
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
    httpRequest.sender("http://localhost:8001/b2bgerp_global/contacts/req_data_yn", "POST" , result.data);
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
