var express = require('express');
var router = express.Router();
var httpRequest = require('../../common/httpRequest');

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
	var contacts_data;
	var queryString = {}
	var queryText = "";
	
	for(var i =0 ; BantList.length > i ; i++){
		queryText += BantList[i] + "!=''" 
	}
	queryString['search'] = queryText;
	queryString['depth'] = "complete";
	console.log(queryString);

    await b2bgerp_eloqua.data.contacts.get(queryString).then((result) => {
    

		if (result.data.total && result.data.total > 0) {
			contacts_data = result.data;
			// res.json( result.data);
		}
    }).catch((err) => {
		console.error(err.message);
		return null;
    });
    return contacts_data;
}

function B2B_GERP_GLOBAL_ENTITY(){
    this.INTERFACE_ID = "Eloqua",
    this.LEAD_NAME = "";        //리드네임
    this.SITE_NAME = "";				//사이트네임
    this.LEAD_SOURCE_TYPE = "09"	//default 09
    this.ENTRY_TYPE  = "L"        //default L
    this.ACCOUNT = "";          //회사
    this.CONTACT_POINT = "";    //연락처(현업 협의 정의)
    this.CORPORATION = "";      //법인정보
    this.OWNER = "";            //데이터 없음
    this.ADDRESS = "";          //현업확인
    this.DESCRIPTION = "";      //설명 Comments, message, inquiry-to-buy-message 필드 중 하나
    this.ATTRIBUTE_3 = "";      //픽리스트 eloqua 확인 
    this.ATTRIBUTE_4 = "";      //이메일
    this.ATTRIBUTE_5 = "";      //전화번호
    this.ATTRIBUTE_6 = "";      //확인필요
    this.ATTRIBUTE_7 = "";      //지역 - 국가 eloqua filed 정보
    this.ATTRIBUTE_8 = "";      //넷중 하나 또는 4개의 필드 정보 합 ( 확인 필요 )
    this.ATTRIBUTE_10 = "";     //데이터 없음
    this.ATTRIBUTE_11 = "";     //사업부코드( 코드마스터 필요 ) 예) HE    LGE 앞자리 빼는지 확인 필요
    this.REGISTER_DATE = "";    //어떤 날짜 정보인지 확인 필요
    this.TRANSFER_DATE = "";    //어떤 날짜 정보인지 확인 필요
    this.TRANSFER_FLAG = "";		//TRANSFER_FLAG N , Y 값의 용도 확인 필요
    this.LAST_UPDATE_DATE = ""; //데이터 없음
    this.API_G_CODE = "";       //API 구분코드 추가요건 사항
}

//Eloqua Data B2B GERP Global Mapping 데이터 생성
function Convert_B2BGERP_GLOBAL_DATA(contacts_data)
{
  
  var result_data = [];
  
  for( var i = 0; i < contacts_data.elements.length; i++)
  {
    var result_item = new B2B_GERP_GLOBAL_ENTITY();

    console.log(contacts_data.elements[i]);
    console.log(contacts_data.elements[i].accountName);

    if( contacts_data.elements[i].accountName != undefined) result_item.ACCOUNT = contacts_data.elements[i].accountName;




    result_data.push(result_item);
  }

//B2B GERP Mapping Json Create

    /*INTERFACE_ID
    o	LEAD_NAME					리드네임
    o	SITE_NAME					사이트네임
    o	LEAD_SOURCE_TYPE					default 09
    o	ENTRY_TYPE					default L
    o	ACCOUNT					회사
    o	CONTACT_POINT					연락처(현업 협의 정의)
    o	CORPORATION					법인정보
    o	OWNER					데이터 없음
    x	ADDRESS					현업확인
      DESCRIPTION					설명 Comments, message, inquiry-to-buy-message 필드 중 하나
    o	ATTRIBUTE_3					픽리스트 eloqua 확인 
    o	ATTRIBUTE_4					이메일
    o	ATTRIBUTE_5					전화번호
    o	ATTRIBUTE_6					확인필요
    o	ATTRIBUTE_7					지역 - 국가 eloqua filed 정보
    o	ATTRIBUTE_8					넷중 하나 또는 4개의 필드 정보 합 ( 확인 필요 )
    o	ATTRIBUTE_10					데이터 없음
    o	ATTRIBUTE_11					사업부코드( 코드마스터 필요 ) 예) HE    LGE 앞자리 빼는지 확인 필요
    o	REGISTER_DATE					어떤 날짜 정보인지 확인 필요
    o	TRANSFER_DATE					어떤 날짜 정보인지 확인 필요
    o	TRANSFER_FLAG					 TRANSFER_FLAG N , Y 값의 용도 확인 필요
    o	LAST_UPDATE_DATE					데이터 없음
    API 분류코드					 추가요건 사항
    */



  return result_data;
}

router.get('/', async function (req, res, next) {

	//BANT기준 B2B GERP GLOBAL CONTACTS 조회
	var contacts_data = await get_b2bgerp_global_bant_data();

	res.json(contacts_data);
	return;
	if( contacts_data != null )
	{
		//Eloqua Contacts 조회
		var request_data = Convert_B2BGERP_GLOBAL_DATA(contacts_data);
		
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
