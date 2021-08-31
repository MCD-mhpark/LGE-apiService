var express = require('express');
const {
	param
} = require('../../common/history');
var router = express.Router();
var utils = require('../../common/utils');
var moment = require('moment-timezone');
//const request =  require('request'); 
var request_promise = require('request-promise');
var request = require('request');
var fs = require("mz/fs");
var dirPath = "KR_TEST";


moment.locale('kr');
//=====================================================================================================================
// 한국영업본부 LOG 함수
//=====================================================================================================================
function req_res_logs(filename, business_name, data) {
	// filename : request , response 
	// business_name : 사업부별 name
	// data : log 저장할 데이터

	var today = moment().format("YYYY-MM-DD") + "_" + "MAT_TO_B2BGERPKR";
	var dirPath = utils.logs_makeDirectory(today);
	console.log("fileWrite Path : " + dirPath);

	fs.writeFile(dirPath + filename + "_" + business_name + ".txt", JSON.stringify(data), 'utf8', function (error) {
		if (error) {
			console.log(err);
		} else {
			console.log('write end');
		}
	});
}


//=====================================================================================================================
// 한국영업본부 B2B GERP KR 전송
//=====================================================================================================================

function B2B_GERP_KR_ENTITY() {
	this.INTERFACE_ID = ""; //인터페이스아이디
	this.LEAD_SOURCE_NAME = ""; // 리드 소스 네임 ( Platform & Activity )
	this.ESTIMATION_ID = ""; //견적번호
	this.ESTIMATION_SEQ_NO = ""; //NUMBER		견적상세번호
	this.CUSTOMER_NAME = ""; //VARCHAR2(300)		고객명 (회사명)
	this.BIZ_REGISTER_NO = ""; //VARCHAR2(20)		사업자등록번호
	this.CORP_REGISTER_NO = ""; //VARCHAR2(20)		법인등록번호
	this.POSTAL_CODE = ""; //VARCHAR2(20)		우편번호
	this.BASE_ADDR = ""; //VARCHAR2(2000)		기본주소
	this.DETAIL_ADDR = ""; //VARCHAR2(2000)		상세주소
	this.PHONE_NO = ""; //VARCHAR2(30)		전화번호
	this.EMAIL_ADDR = ""; //VARCHAR2(256)		전자우편주소
	this.CONTACT_NAME = ""; //VARCHAR2(300)		담당자명
	this.CONTACT_PHONE_NO = ""; //VARCHAR2(30)		담당자전화번호
	this.CONTACT_CELLULAR_NO = ""; //VARCHAR2(30)		담당자이동전화번호
	this.CONTACT_EMAIL_ADDR = ""; //VARCHAR2(256)		담당자전자우편주소
	//this.ESTIMATE_REGISTER_DATE = ""; //DATE		견적등록일
	//this.ESTIMATE_UPDATE_DATE = ""; //DATE		견적수정일
	//this.ESTIMATE_UPDATE_FLAG = ""; //VARCHAR2(1)		견적수정여부
	this.MODEL_CODE = ""; //VARCHAR2(30)		모델코드
	//this.ITEM_QTY = ""; //NUMBER		품목수량
	this.REGISTER_DATE = ""; //DATE		등록일자
	//this.LAST_UPDATE_DATE = ""; //DATE		최종수정일자
	//this.UPDATE_TYPE_CODE = ""; //VARCHAR2(30)		변경구분(UPDATE/INSERT)
	//this.RECEIVE_DATE = ""; //DATE		수신일자
	//this.PROCESSING_FLAG = ""; //VARCHAR2(1)		처리여부
	//this.PROCESSING_DATE = ""; //DATE		처리일자
	//this.PROCESS_CONTEXT = ""; //VARCHAR2(256)		처리컨텍스트
	this.CUST_REMARK = ""; //VARCHAR2(4000)		고객요청사항
	this.PRODUCT_DESC = ""; //VARCHAR2(200)		제품설명
	this.ATTRIBUTE_1 = ""; //VARCHAR2(500)		예비1
	this.ATTRIBUTE_2 = ""; //VARCHAR2(500)		예비2
	this.ATTRIBUTE_3 = ""; //VARCHAR2(500)		
	this.ATTRIBUTE_4 = ""; //VARCHAR2(500)		
	this.ATTRIBUTE_5 = ""; //VARCHAR2(500)		
	this.ATTRIBUTE_6 = ""; //VARCHAR2(500)		
	this.ATTRIBUTE_7 = ""; //VARCHAR2(500)		
	this.ATTRIBUTE_8 = ""; //VARCHAR2(500)		
	this.ATTRIBUTE_9 = ""; //VARCHAR2(500)		

}


function GetCustomObjectValue(filed_id, element, type) {
	var return_value = "";


	for (i = 0; i < element.fieldValues.length; i++) {
		if (element.fieldValues[i].id == filed_id) {
			if (type == "N")
				return_value = element.fieldValues[i].value;
			else {
				moment.locale('kr');
				return_value = moment(element.fieldValues[i].value).add(13, 'Hour').format("YYYY-MM-DD HH:mm:ss");
			}
		}
	}
	return return_value;
}

function lpad(str, padLen, padStr) {
	if (padStr.length > padLen) {
		console.log("오류 : 채우고자 하는 문자열이 요청 길이보다 큽니다");
		return str;
	}
	str += ""; // 문자로
	padStr += ""; // 문자로
	while (str.length < padLen)
		str = padStr + str;
	str = str.length >= padLen ? str.substring(0, padLen) : str;
	return str;
}

var seq_cnt = 0;
//Eloqua Data B2B GERP Global Mapping 데이터 생성
function Convert_B2BGERP_KR_DATA(_cod_data) {
	var cod_elements = _cod_data.elements;
	var result_data = [];

	for (var i = 0; i < cod_elements.length; i++) {
		try {
			var result_item = new B2B_GERP_KR_ENTITY();
			console.log()
			//LEAD_NAME
			//"[MQL]"+"_" + GetCustomFiledValue(FieldValues_data, 100202) + "_" + moment().format('YYYYMMDD');
			moment.locale('kr');
			// result_item.INTERFACE_ID = moment().format('YYYYMMDD') + "8" + lpad(seq_cnt, 5, "0");
			result_item.INTERFACE_ID = moment().format('YYYYMMDD') + "8";
			result_item.CUSTOMOBJECT_ID = cod_elements[i].id ; 
			result_item.CONTACT_ID = cod_elements[i].contactId ;

			result_item.ESTIMATION_ID = GetCustomObjectValue(267, cod_elements[i], "N"); //견적번호 X
			result_item.ESTIMATION_SEQ_NO = GetCustomObjectValue(268, cod_elements[i], "N"); //견적상세번호 X
			result_item.CUSTOMER_NAME = GetCustomObjectValue(269, cod_elements[i], "N"); //고객명 X
			result_item.BIZ_REGISTER_NO = GetCustomObjectValue(270, cod_elements[i], "N"); //사업자등록번호 X
			result_item.CORP_REGISTER_NO = GetCustomObjectValue(271, cod_elements[i], "N"); //법인등록번호 X
			result_item.POSTAL_CODE = GetCustomObjectValue(272, cod_elements[i], "N"); //우편번호
			result_item.BASE_ADDR = GetCustomObjectValue(273, cod_elements[i], "N"); //기본주소
			result_item.DETAIL_ADDR = GetCustomObjectValue(274, cod_elements[i], "N"); //상세주소
			result_item.PHONE_NO = GetCustomObjectValue(275, cod_elements[i], "N"); //전화번호
			result_item.EMAIL_ADDR = GetCustomObjectValue(276, cod_elements[i], "N"); //전자우편주소
			// result_item.CONTACT_NAME = GetCustomObjectValue(277, cod_elements[i], "N"); //담당자명

			result_item.CONTACT_NAME = GetCustomObjectValue(396, cod_elements[i], "N") + " " + GetCustomObjectValue(395, cod_elements[i], "N"); //담당자명
			result_item.CONTACT_PHONE_NO = GetCustomObjectValue(278, cod_elements[i], "N"); //담당자 전화번호
			result_item.CONTACT_CELLULAR_NO = GetCustomObjectValue(279, cod_elements[i], "N"); //담당자 이동전화번호
			result_item.CONTACT_EMAIL_ADDR = GetCustomObjectValue(280, cod_elements[i], "N"); //담당자 전자우편주소
			result_item.MODEL_CODE = GetCustomObjectValue(281, cod_elements[i], "N"); //모델코드
			result_item.CUST_REMARK = GetCustomObjectValue(282, cod_elements[i], "N"); //고객요청사항
			result_item.PRODUCT_DESC = GetCustomObjectValue(283, cod_elements[i], "N"); //제품설명

			
			result_item.ATTRIBUTE_1 = GetCustomObjectValue(296, cod_elements[i], "N"); //제품설치지역 도시 
			result_item.ATTRIBUTE_2 = GetCustomObjectValue(297, cod_elements[i], "N"); //제품설치지역 시군구
			result_item.ATTRIBUTE_3 = GetCustomObjectValue(285, cod_elements[i], "N"); //B2B 전문점 코드
			result_item.ATTRIBUTE_4 = GetCustomObjectValue(286, cod_elements[i], "N"); //카테고리명
			result_item.ATTRIBUTE_5 = GetCustomObjectValue(287, cod_elements[i], "N"); //상세 카테고리 명
			result_item.ATTRIBUTE_6 = GetCustomObjectValue(288, cod_elements[i], "N"); //타입명
			result_item.ATTRIBUTE_7 = GetCustomObjectValue(293, cod_elements[i], "N"); //통합회원 유니크 아이디
			result_item.ATTRIBUTE_8 = GetCustomObjectValue(294, cod_elements[i], "N"); //업종
			result_item.ATTRIBUTE_9 = GetCustomObjectValue(295, cod_elements[i], "N"); //상세업종

			result_item.ATTRIBUTE_10 = "";
			result_item.ATTRIBUTE_11 = "";
			result_item.ATTRIBUTE_12 = "";

			result_item.LEAD_SOURCE_NAME = GetCustomObjectValue(318, cod_elements[i], "N"); //Platform & Activity
			result_item.LEAD_NAME = GetCustomObjectValue(317, cod_elements[i], "N") + "_" + moment().format('YYYYMMDD') + "_" + GetCustomObjectValue(269, cod_elements[i], "N") ; 
			//Leadname 조합 B2B사이트명_YYYYMMDD_r고객사명

			result_item.REGISTER_DATE = moment().format('YYYY-MM-DD hh:mm:ss'); //등록일자

			result_data.push(result_item);

			seq_cnt++;

		} catch (e) {
			console.log(e);
		}
	}
	return result_data;
}

//CustomObject 기간 조회 Eloqua API Version 1.0
async function GetKR_CustomDataSearch(_parentId , type) {
	var return_data = {};
	var parentId = _parentId;

	//엘로코아 시간으로 -13시간 차이가 나기때문에 -13시간으로 조회 합니다. (미국의 서머타임 시간차이)
	// moment.locale('kr');
	// var start_date = moment(_start_date).subtract(13, 'Hour').format("YYYY-MM-DD HH:mm:ss");
	// var end_date = moment(_end_date).subtract(13, 'Hour').format("YYYY-MM-DD HH:mm:ss");

	// var queryString = "?search=" + "CreatedAt<'" + end_date + "'CreatedAt>'" + start_date + "'";
	// var queryString = "?search=483='N'";
	var queryString = "";
	if(type == 'get') queryString += "?search=B2B_GERP_KR_____1=''"
	if(type == 'init')  queryString += "?search=B2B_GERP_KR_____1='Y'"

	// Get 요청하기 http://www.google.com 
	const options = {
		uri: "https://secure.p03.eloqua.com/api/REST/1.0/data/customObject/" + parentId + queryString
		, headers: {
			'Authorization': 'Basic ' + 'TEdFbGVjdHJvbmljc1xMZ19hcGkuQjJiX2tyOlFXZXIxMjM0IUA='
		}
	};

	await request_promise.get(options, function (error, response, body) {
		console.log("data return");
		// console.log(body);
		// console.log(response.statusMessage);
		// console.log(response.statusCode);
		return_data = JSON.parse(body);
	});

	return return_data;
}

router.get('/trans_gubun_init', async function (req, res, next) {
	var parentId = 39;  // 한국영업본부 온라인 견적문의 커스텀 오브젝트 ID
	var COD_list = await GetKR_CustomDataSearch(parentId ,"init");
	let trans_up_list = await getTransfer_UpdateData( COD_list.elements , "init");
	console.log(COD_list.elements.length);

	await sendTransfer_Update(parentId , trans_up_list);
});


router.post('/sender', async function (req, res, next) {
	senderToB2BGERP_KR()
});
async function senderToB2BGERP_KR(){
	console.log("Call senderToB2BGERP_KR + ")
	var parentId = 39;  // 한국영업본부 온라인 견적문의 커스텀 오브젝트 ID

	// var start_date = '2021-05-17 09:00:01';
	// var end_date = '2021-05-17 23:59:59';



	var COD_list = await GetKR_CustomDataSearch(parentId ,"get");

	var B2B_GERP_KR_DATA = await Convert_B2BGERP_KR_DATA(COD_list);
	// var send_data = {
	// 	elements: B2B_GERP_KR_DATA,
	// 	total: B2B_GERP_KR_DATA.length
	// }


	//LG전자 KR 개발 Endpoint
	// let dev_url = "https://dev-apigw-ext.lge.com:7221/gateway/b2bgerp/api2api/leadByEloquaNavG/leadByEloquaKR.lge"
													 
	//LG전자 KR 운영 Endpoint
	let prd_url = "https://apigw-ext.lge.com:7211/gateway/b2bgerp/api2api/leadByEloquaNavG/leadByEloquaKR.lge"
	
	console.log(B2B_GERP_KR_DATA);
	if (B2B_GERP_KR_DATA != null && B2B_GERP_KR_DATA.length > 0) {
	    var headers = {
	        'Content-Type': "application/json",
	        'x-Gateway-APIKey' : "da7d5553-5722-4358-91cd-9d89859bc4a0"
	    }

	    options = {
	        url : prd_url,
	        method: "POST",
	        headers:headers,
	        body : { ContentList: B2B_GERP_KR_DATA } ,
	        json : true
	    };

		



	// // 요청에 대한 로그를 쌓기 위함
	// let total_logs = {
	//   bsname : business_name ,
	//   search_time : utils.todayDetail_getDateTime(),
	//   eloqua_total : contact_list && contact_list.total ? contact_list.total : 0,
	//   convert_total : request_data.length
	// }

	req_res_logs("reqEloqua_" + moment().format("HH시mm분") , "MAT_TO_B2BGERPKR" , COD_list );
	req_res_logs("reqConvert_" + moment().format("HH시mm분")  , "MAT_TO_B2BGERPKR", B2B_GERP_KR_DATA );
	// req_res_logs("reqTotal" , business_name , total_logs );
	

	//   var bant_result_list = await setBant_Update( business_name , bant_update_list );
	//   req_res_logs("bantResult" , business_name , bant_result_list );
	//   res.json(bant_result_list);
		await request_promise.post(options, async function (error, response, body) {

	        // console.log(11);
	        // console.log(response);
			
	        if(error){
	            console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
	            console.log(error);
				let errorData = {
					errorCode : response.statusCode,
					errorMsg : error.message 
				}
				req_res_logs("responseError_" + moment().format("HH시mm분")  , "MAT_TO_B2BGERPKR" , errorData );	
	        }else if(!error && response.statusCode != 200 ){
			
				let errorData = {
					errorCode : response.statusCode,
					errorMsg : "Error Object Not Found & Response Code Not 200" ,
					errorDetailMsg : response.body
				}
				req_res_logs("responseError_" + moment().format("HH시mm분")  , "MAT_TO_B2BGERPKR" , errorData );
				req_res_logs("requestObject_" + moment().format("HH시mm분")  , "MAT_TO_B2BGERPKR" , response );
			}else if (!error && response.statusCode == 200) {
	    		req_res_logs("response_" + moment().format("HH시mm분")  , "MAT_TO_B2BGERPKR" , body.resultData );
	            if(B2B_GERP_KR_DATA.length > 0 ) {
	                // console.log(B2B_GERP_KR_DATA);
	                let trans_up_list = await getTransfer_UpdateData( COD_list.elements , "get");
					// console.log(trans_up_list[0].fieldValues);
					await sendTransfer_Update(parentId , trans_up_list);
	            }   
	        }
	    });

	}
	else {
		let noneData = {
			errorInfo : null ,
			errorMessage : "보낼 데이터가 없습니다."
		}
		req_res_logs("noneData_" + moment().format("HH시mm분")  , "MAT_TO_B2BGERPKR" , noneData );
		
	}
}

async function getTransfer_UpdateData(TRANS_KR_LIST , type){

	let return_list = [];
	let trans_check = "";
	if(type == 'get' ) trans_check = 'Y'
	else if(type == 'init' ) trans_check = ''
	

	for(const kr_data of TRANS_KR_LIST){

		for(let i = 0 ; i <  kr_data.fieldValues.length ; i++){
			if(kr_data.fieldValues[i].id == "483") { kr_data.fieldValues[i].value = trans_check }
			
			if(kr_data.fieldValues[i].id == "301" || kr_data.fieldValues[i].id == "300" || kr_data.fieldValues[i].id == "299" || kr_data.fieldValues[i].id == "298"){ 
			 	kr_data.fieldValues[i].value = utils.timeConverter("GET_UNIX" , kr_data.fieldValues[i].value ) 
			}

			//{ type: 'FieldValue', id:  '301', value: '4/18/2021 12:00:00 AM' },
			// { type: 'FieldValue', id: '300', value: '4/18/2021 12:00:00 AM' },
			// { type: 'FieldValue', id: '299', value: '4/18/2021 12:00:00 AM' },
			// { type: 'FieldValue', id: '298', value: '4/18/2021 12:00:00 AM' },
		}

		return_list.push(kr_data);
	}

	return return_list;
}

async function sendTransfer_Update( parentId , KR_DATA_LIST){

	for(let item of KR_DATA_LIST){
		await b2bkr_eloqua.data.customObjects.data.update(parentId , item.id, item).then((result) => {
			console.log(result);
			return_data = result;
		}).catch((err) => {
			console.error(err);
			console.error(err.message);
			return_data = err;
		});
	}
}

//LEAD_NAME
//"[MQL]"+"_" + GetCustomFiledValue(FieldValues_data, 100202) + "_" + moment().format('YYYYMMDD');

//=====================================================================================================================
// 한국영업본부 CO.KR 견적문의 API
//=====================================================================================================================

//커스텀 오브젝트 데이터 추가
router.post('/customObjectDataCreate', async function (req, res, next) {
	console.log("call customObjectDataCreate");
	var req_data = req.body;
	var queryString = "";
	let parent_id = 39;
	try {
		if (validateEmail(req_data.contactEmailAddr)) {
			//해당 사용자 데이터 여부 확인
			var contact_data = await GetContactData(req_data.contactEmailAddr);

			if (contact_data && contact_data.total > 0) {
				//기존사용자 정보 업데이트
				var update_result = await UpdateContacData(contact_data.elements[0], req_data);

				if (update_result) {
					var customObjectCreateData = ConvertCustomObjectData(contact_data.elements[0], req_data);
					//커스텀 오브젝트 데이터 전송
					var customObject_result = await SendCreateCustomObjectData(parent_id , customObjectCreateData);

					if (customObject_result) {
						// console.log(customObject_result);
						res.json({
							"Result": "success"
						});
					} else {
						res.json({
							"Result": "failed",
							"ErrorInfo": "Custom Object Data Send Error",
							"ErrorMessage": customObject_result.message
						});
					}
				} else {
					res.json({
						"Result": "failed",
						"ErrorInfo": "Contact Update Error",
						"ErrorMessage": update_result.message
					});
				}
			} else {
				//사용자가 없을경우 사용자 추가
				var contact_data = await InsertContactData(req_data);

				if (contact_data) {
					//사용자 추가 후 CustomObjectData 추가
					if (contact_data.data) {

						var customObjectCreateData = ConvertCustomObjectData(contact_data.data, req_data);
						//커스텀 오브젝트 데이터 전송
						var result_data = await SendCreateCustomObjectData(customObjectCreateData);

						// console.log(result_data.data);

						res.json({
							"Result": "success"
						});
					} else {
						res.json({
							"Result": "failed",
							"ErrorInfo": "Custom Object Data Send Error",
							"ErrorMessage": result_data.message
						});
					}
				} else {
					res.json({
						"Result": "failed",
						"ErrorInfo": "Contact Add Error",
						"ErrorMessage": contact_data.message
					});
				}
			}
		} else {
			res.json({
				"Result": "failed",
				"ErrorInfo": "Request Email Error",
				"ErrorMessage": "Request Email Validation Check"
			})
		}
	} catch (err) {
		res.json(
			{
				"Result": "failed",
				"ErrorInfo": "System Error Check",
				"ErrorMessage": err.message
			}
		);
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

//커스텀 오브젝트 데이터 형태로 변경 함수
function ConvertCustomObjectData(_contact, _req_data) {
	var contact = _contact;
	var convert_data_entity = new KR_OBJECT_DATA_ENTITY();
	convert_data_entity.contactId = contact.id ;

	convert_data_entity.fieldValues.push({
		"id": "319",
		"value": "KR"
	}); //Subsidiary 고정값 : KR
	convert_data_entity.fieldValues.push({
		"id": "317",
		"value": "KR_LGE.co.kr_OnlineInquiry"
	}); //Marketing Event	고정값 : KR_LGE.co.kr_OnlineInquiry				
	convert_data_entity.fieldValues.push({
		"id": "318",
		"value": "LGE.co.kr"
	}); // Platform&Activity 고정값 : LGE.co.kr	
	convert_data_entity.fieldValues.push({
		"id": "301",
		"value": moment().tz('Asia/Seoul').unix()
	}); //LG전자 마케팅 정보 수신 동의 일자	date	text
	convert_data_entity.fieldValues.push({
		"id": "300",
		"value": moment().tz('Asia/Seoul').unix()
	}); //개인정보 국외 이전 동의 일자	date	text
	convert_data_entity.fieldValues.push({
		"id": "299",
		"value": moment().tz('Asia/Seoul').unix()
	}); //개인정보 위탁 처리 동의 일자	date	text			
	convert_data_entity.fieldValues.push({
		"id": "298",
		"value": moment().tz('Asia/Seoul').unix()
	}); //개인정보 수집 및 이용동의 일자	date	text			
	convert_data_entity.fieldValues.push({
		"id": "297",
		"value": _req_data.dtlAddr
	}); //제품설치지역 시군구	text	text			
	convert_data_entity.fieldValues.push({
		"id": "296",
		"value": _req_data.addr
	}); //제풍설치지역 도시	text	text			
	convert_data_entity.fieldValues.push({
		"id": "295",
		"value": _req_data.dtlSector
	}); //상세업종	text	text			
	convert_data_entity.fieldValues.push({
		"id": "294",
		"value": _req_data.sector
	}); //업종	text	text			
	convert_data_entity.fieldValues.push({
		"id": "293",
		"value": _req_data.unifyId
	}); //통합회원 유니크 아이디	text	text		
	convert_data_entity.fieldValues.push({
		"id": "292",
		"value": _req_data.mktRecYn == "Y" ? "Yes" : "No"
	}); //LG전자 마케팅 정보 수신 동의 여부	text	checkbox	Yes	No	No
	convert_data_entity.fieldValues.push({
		"id": "291",
		"value": _req_data.tpiYn == "Y" ? "Yes" : "No"
	}); //개인정보 국외 이전 동의 여부	text	checkbox	Yes	No	No
	convert_data_entity.fieldValues.push({
		"id": "290",
		"value": _req_data.pcYn == "Y" ? "Yes" : "No"
	}); //개인정보 위탁 처리 동의 여부	text	checkbox	Yes	No	No
	convert_data_entity.fieldValues.push({
		"id": "289",
		"value": _req_data.ppYn == "Y" ? "Yes" : "No"
	}); //개인정보 수집 및 이용동의 여부	text	checkbox	Yes	No	No
	convert_data_entity.fieldValues.push({
		"id": "288",
		"value": _req_data.typeName
	}); //타입 명	text	text			
	convert_data_entity.fieldValues.push({
		"id": "287",
		"value": _req_data.dtlCategoryName
	}); //상세 카테고리 명	text	text			
	convert_data_entity.fieldValues.push({
		"id": "286",
		"value": _req_data.categoryName
	}); //카테고리 명	text	text			
	convert_data_entity.fieldValues.push({
		"id": "285",
		"value": _req_data.b2bBillToCode
	}); //b2b 전문점 코드	text	text			
	convert_data_entity.fieldValues.push({
		"id": "284",
		"value": _req_data.sendCount
	}); //발송건수(1 하드코딩)	text	text			
	convert_data_entity.fieldValues.push({
		"id": "283",
		"value": _req_data.productDesc
	}); //제품설명	text	text			
	convert_data_entity.fieldValues.push({
		"id": "282",
		"value": _req_data.custRemark
	}); //고객요청사항	largeText	textArea			
	convert_data_entity.fieldValues.push({
		"id": "281",
		"value": _req_data.modelCode
	}); //모델코드	text	text			
	convert_data_entity.fieldValues.push({
		"id": "280",
		"value": _req_data.contactEmailAddr
	}); //담당자전자우편주소	text	text			
	convert_data_entity.fieldValues.push({
		"id": "279",
		"value": _req_data.contactCellularNo
	}); //담당자이동전화번호	text	text			
	convert_data_entity.fieldValues.push({
		"id": "278",
		"value": _req_data.contactPhoneNo
	}); //담당자전화번호	text	text			
	// convert_data_entity.fieldValues.push({
	// 	"id": "277",
	// 	"value": _req_data.contactName
	// }); //담당자명	text	text
	convert_data_entity.fieldValues.push({
		"id": "395",
		"value": _req_data.contactFirstName
	}); //담당자명 이름(리뉴얼 후)	text	text
	convert_data_entity.fieldValues.push({
		"id": "396",
		"value": _req_data.contactLastName
	}); //담당자명 성(리뉴얼 후)	text	text			
	convert_data_entity.fieldValues.push({
		"id": "276",
		"value": _req_data.emailAddr
	}); //전자우편주소	text	text			
	convert_data_entity.fieldValues.push({
		"id": "275",
		"value": _req_data.phoneNo
	}); //전화번호	text	text			
	convert_data_entity.fieldValues.push({
		"id": "274",
		"value": _req_data.detailAddr
	}); //상세주소	text	text			
	convert_data_entity.fieldValues.push({
		"id": "273",
		"value": _req_data.baseAddr
	}); //기본주소	text	text			
	convert_data_entity.fieldValues.push({
		"id": "272",
		"value": _req_data.postalCode
	}); //우편번호	text	text			
	convert_data_entity.fieldValues.push({
		"id": "271",
		"value": _req_data.corpRegisterNo
	}); //법인등록번호	text	text			
	convert_data_entity.fieldValues.push({
		"id": "270",
		"value": _req_data.bizRegisterNo
	}); //사업자등록번호	text	text			
	convert_data_entity.fieldValues.push({
		"id": "269",
		"value": _req_data.customerName
	}); //고객명	text	text			
	convert_data_entity.fieldValues.push({
		"id": "268",
		"value": _req_data.estimationSeqNo
	}); //견적일련번호	text	text			
	convert_data_entity.fieldValues.push({
		"id": "267",
		"value": _req_data.estimationId
	}); //견적번호	text	text			
	convert_data_entity.fieldValues.push({
		"id": "483",
		"value": "N"
	}); //전송여부	text	text			
	



	return convert_data_entity;
}


//커스텀 오브젝트 데이터 형태로 변경 함수
function ConvertCustomObjectData_newsLetter(_contact, _req_data) {
	var contact = _contact;
	var convert_data_entity = new KR_OBJECT_DATA_ENTITY();

	var convert_data_entity = {};
	convert_data_entity.fieldValues = [];
	
	convert_data_entity.contactId = contact.id;

	convert_data_entity.fieldValues.push({
		"id": "351",
		"value": moment().tz('Asia/Seoul').unix()
	}); //LG전자 마케팅 정보 수신 동의 일자		

	convert_data_entity.fieldValues.push({
		"id": "350",
		"value": moment().tz('Asia/Seoul').unix()
	}); // 개인정보 국외 이전 동의 일자

	convert_data_entity.fieldValues.push({
		"id": "349",
		"value": moment().tz('Asia/Seoul').unix()
	}); // 개인정보 위탁 처리 동의 일자

	convert_data_entity.fieldValues.push({
		"id": "348",
		"value": moment().tz('Asia/Seoul').unix()
	}); // 개인정보 수집 및 이용동의 일자


	convert_data_entity.fieldValues.push({
		"id": "347",
		"value": "Yes"
	}); // LG전자 마케팅 정보 수신 동의 여부

	convert_data_entity.fieldValues.push({
		"id": "346",
		"value": "Yes"
	}); // 개인정보 국외 이전 동의 여부

	convert_data_entity.fieldValues.push({
		"id": "345",
		"value": "Yes"
	}); // 개인정보 위탁 처리 동의 여부

	convert_data_entity.fieldValues.push({
		"id": "344",
		"value": "Yes"
	}); // 개인정보 수집 및 이용동의 여부



	convert_data_entity.fieldValues.push({
		"id": "342",
		"value" : _req_data.cEmail
	}); // 이메일

	convert_data_entity.fieldValues.push({
		"id": "341",
		"value" : _req_data.cCode
	}); // 업종

	convert_data_entity.fieldValues.push({
		"id": "340",
		"value" : ""
	}); // 업종코드


	convert_data_entity.fieldValues.push({
		"id": "339",
		"value" : _req_data.cPart
	}); // PART

	convert_data_entity.fieldValues.push({
		"id": "352",
		"value" : "KR_LGE.co.kr_B2BNewsletter"
	}); // Marketing Event

	convert_data_entity.fieldValues.push({
		"id": "353",
		"value" : "LGE.co.kr"
	}); // Paltform_Activity

	convert_data_entity.fieldValues.push({
		"id": "354",
		"value" : "KR"
	}); // Subsidiary

	return convert_data_entity;
}

//CustomObjectData 전송 함수
async function SendCreateCustomObjectData(parent_id , _customObjectCreateData) {
	var return_data = undefined;
	//LGE KR 사용자정의 객체 / LGEKR(한영본)_대표사이트B2B_온라인문의 id : 39
	await b2bkr_eloqua.data.customObjects.data.create(parent_id, _customObjectCreateData).then((result) => {
		// console.log(result);
		return_data = result;
	}).catch((err) => {
		// console.error(err);
		console.error(err.message);
		return_data = err.message;
	});
	return return_data;
}

//연락처 조회 함수
async function GetContactData(_email) {
	var queryString = {};
	var return_data = undefined;
	//queryString['search'] = _email;
	if (validateEmail(_email)) {
		queryString.search = _email;
		queryString.depth = "complete"; //minimal, partial, complete
		await b2bkr_eloqua.data.contacts.get(queryString).then((result) => {
			if (result.status == 200 && result.data.total > 0)
				return_data = result.data;
		}).catch((err) => {
			return_data = undefined;
		});
		return return_data;
	} else {
		return undefined;
	}
}

//이메일 확인 함수
function validateEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

//연락처 추가 함수
async function InsertContactData(_req_data) {
	var contact_data = {};
	contact_data.fieldValues = [];

	contact_data.accountname = _req_data.customerName;
	//zip
	contact_data.postalCode = _req_data.postalCode;
	//address1
	contact_data.address1 = _req_data.baseAddr;
	//address2 / Address3
	contact_data.address2 = _req_data.detailAddr;
	//Business Phone
	contact_data.businessPhone = _req_data.phoneNo;
	//FirstName / LastName
	// contact_data.firstName = _req_data.contactName.substring(1, _req_data.contactName.length);
	// contact_data.lastName = _req_data.contactName.substring(0, 1);
	contact_data.firstName = _req_data.contactFirstName;
	contact_data.lastName = _req_data.contactLastName;

	//Mobile Phone
	contact_data.mobilePhone = _req_data.contactCellularNo;
	//Email Address
	contact_data.emailAddress = _req_data.contactEmailAddr;

	//inqurity to by message 100209
	contact_data.fieldValues.push({
		"id": "100209",
		"value": _req_data.custRemark
	});
	//KR_Privacy Policy_Collection and Usage
	contact_data.fieldValues.push({
		"id": "100315",
		"value": _req_data.ppYn == "Y" ? "Yes" : "No"
	});
	//KR_Privacy Policy_Collection and Usage_AgreedDate
	contact_data.fieldValues.push({
		"id": "100320",
		"value": moment().tz('Asia/Seoul').unix()
	});
	//KR_Privacy Policy_Consignment of PI
	contact_data.fieldValues.push({
		"id": "100316",
		"value": _req_data.pcYn == "Y" ? "Yes" : "No"
	});
	//KR_Privacy Policy_Transfer PI Aborad
	contact_data.fieldValues.push({
		"id": "100317",
		"value": _req_data.tpiYn == "Y" ? "Yes" : "No"
	});
	//KR_Privacy Policy_Optin
	contact_data.fieldValues.push({
		"id": "100318",
		"value": _req_data.mktRecYn == "Y" ? "Yes" : "No"
	});
	//KR_Privacy Policy_Optin_Date
	contact_data.fieldValues.push({
		"id": "100319",
		"value": moment().tz('Asia/Seoul').unix()
	});

	//통합회원 유니크 아이디
	contact_data.fieldValues.push({
		"id": "100368",
		"value": _req_data.unifyId
	});

	//업종	신규	sector	STRING	Industry
	contact_data.fieldValues.push({
		"id": "100046",
		"value": _req_data.sector
	});
	//Platform&Activity GetCustomFiledValue(FieldValues_data, 100202);
	contact_data.fieldValues.push({
		"id": "100202",
		"value": "LGE.co.kr"
	});
	//Marketing Event GetCustomFiledValue(FieldValues_data, 100203);
	contact_data.fieldValues.push({
		"id": "100203",
		"value": "KR_LGE.co.kr_OnlineInquiry"
	});
	//Subsidiary GetCustomFiledValue(FieldValues_data, 100196);
	contact_data.fieldValues.push({
		"id": "100196",
		"value": "KR"
	});


	await b2bkr_eloqua.data.contacts.create(contact_data,).then((result) => {
		console.log(result);
		return_data = result;
	}).catch((err) => {
		console.error(err);
		console.error(err.message);
		return_data = err;
	});
	return return_data;
}


//연락처 추가 함수
async function InsertContactData_newsLetter(_req_data) {
	var contact_data = {};
	contact_data.fieldValues = [];

	// contact_data.accountname = _req_data.customerName;
	// //zip
	// contact_data.postalCode = _req_data.postalCode;
	// //address1
	// contact_data.address1 = _req_data.baseAddr;
	// //address2 / Address3
	// contact_data.address2 = _req_data.detailAddr;
	// //Business Phone
	// contact_data.businessPhone = _req_data.phoneNo;
	//FirstName / LastName
	// contact_data.firstName = _req_data.contactName.substring(1, _req_data.contactName.length);
	// contact_data.lastName = _req_data.contactName.substring(0, 1);
	// contact_data.firstName = _req_data.contactFirstName;
	// contact_data.lastName = _req_data.contactLastName;

	//Mobile Phone
	// contact_data.mobilePhone = _req_data.contactCellularNo;
	//Email Address
	contact_data.emailAddress = _req_data.cEmail;

	//inqurity to by message 100209
	// contact_data.fieldValues.push({
	// 	"id": "100209",
	// 	"value": _req_data.custRemark
	// });
	//KR_Privacy Policy_Collection and Usage
	contact_data.fieldValues.push({
		"id": "100315",
		"value" : "Yes" 
	});
	//KR_Privacy Policy_Collection and Usage_AgreedDate
	contact_data.fieldValues.push({
		"id": "100320",
		"value": moment().tz('Asia/Seoul').unix()
	});
	//KR_Privacy Policy_Consignment of PI
	contact_data.fieldValues.push({
		"id": "100316",
		"value" : "Yes" 
	});
	//KR_Privacy Policy_Transfer PI Aborad
	contact_data.fieldValues.push({
		"id": "100317",
		"value" : "Yes" 
	});
	//KR_Privacy Policy_Optin
	contact_data.fieldValues.push({
		"id": "100318",
		"value" : "Yes" 
	});
	//KR_Privacy Policy_Optin_Date
	contact_data.fieldValues.push({
		"id": "100319",
		"value": moment().tz('Asia/Seoul').unix()
	});

	//통합회원 유니크 아이디
	// contact_data.fieldValues.push({
	// 	"id": "100368",
	// 	"value": _req_data.unifyId
	// });

	//업종	신규	sector	STRING	Industry
	contact_data.fieldValues.push({
		"id": "100046",
		"value": _req_data.cCode
	});
	//Platform&Activity GetCustomFiledValue(FieldValues_data, 100202);
	contact_data.fieldValues.push({
		"id": "100202",
		"value": "LGE.co.kr"
	});
	//Marketing Event GetCustomFiledValue(FieldValues_data, 100203);
	contact_data.fieldValues.push({
		"id": "100203",
		"value": "KR_LGE.co.kr_B2BNewsletter"
	});
	//Subsidiary GetCustomFiledValue(FieldValues_data, 100196);
	contact_data.fieldValues.push({
		"id": "100196",
		"value": "KR"
	});


	await b2bkr_eloqua.data.contacts.create(contact_data,).then((result) => {
		console.log(result);
		return_data = result;
	}).catch((err) => {
		console.error(err);
		console.error(err.message);
		return_data = err;
	});
	return return_data;
}

//co.kr 온라인 견적문의 연락처 업데이트 함수
async function UpdateContacData(_contact, _req_data) {
	var contact = _contact;

	//만약 기존 사용자 정보중 isSubscribed false이면 true로 변경 contact_data.elements[0].isSubscribed
	if (_contact.isSubscribed === 'false') {
		_contact.isSubscribed = true;
	}

	// if(contact.accountName){
	// 	contact.accountname = _req_data;
	// 	delete contact.accountName;
	// }

	_contact.accountname = _req_data.customerName;
	//zip
	_contact.postalCode = _req_data.postalCode;
	//address1
	_contact.address1 = _req_data.baseAddr;
	//address2 / Address3
	_contact.address2 = _req_data.detailAddr;
	//Business Phone
	_contact.businessPhone = _req_data.phoneNo;
	//FirstName / LastName
	// _contact.firstName = _req_data.contactName.substring(1, _req_data.contactName.length);
	// _contact.lastName = _req_data.contactName.substring(0, 1);
	_contact.firstName = _req_data.contactFirstName;
	_contact.lastName = _req_data.contactLastName;
	//Mobile Phone
	_contact.mobilePhone = _req_data.contactCellularNo;
	//Email Address
	_contact.emailAddress = _req_data.contactEmailAddr;

	//inqurity to by message 100209
	SetFieldValue(_contact.fieldValues, "100209", _req_data.custRemark);

	//KR_Privacy Policy_Collection and Usage
	//_contact.fieldValues.push( { "id": "100315", "value": _req_data.ppYn == "Y" ? "YES" : "NO" });
	SetFieldValue(_contact.fieldValues, "100315", _req_data.ppYn == "Y" ? "Yes" : "No");

	//KR_Privacy Policy_Collection and Usage_AgreedDate
	//_contact.fieldValues.push( { "id": "100320", "value": moment().tz('Asia/Seoul').unix() });
	SetFieldValue(_contact.fieldValues, "100320", moment().tz('Asia/Seoul').unix());

	//KR_Privacy Policy_Consignment of PI
	//_contact.fieldValues.push( { "id": "100316", "value": _req_data.pcYn == "Y" ? "YES" : "NO" });
	SetFieldValue(_contact.fieldValues, "100316", _req_data.pcYn == "Y" ? "Yes" : "No");

	//KR_Privacy Policy_Transfer PI Aborad
	//_contact.fieldValues.push( { "id": "100317", "value": _req_data.tpiYn == "Y" ? "YES" : "NO" });
	SetFieldValue(_contact.fieldValues, "100317", _req_data.tpiYn == "Y" ? "Yes" : "No");

	//KR_Privacy Policy_Optin
	//_contact.fieldValues.push( { "id": "100318", "value": _req_data.mktRecYn == "Y" ? "YES" : "NO" });
	SetFieldValue(_contact.fieldValues, "100318", _req_data.mktRecYn == "Y" ? "Yes" : "No");

	//KR_Privacy Policy_Optin_Date
	//_contact.fieldValues.push( { "id": "100319", "value": moment().tz('Asia/Seoul').unix() });
	SetFieldValue(_contact.fieldValues, "100319", moment().tz('Asia/Seoul').unix());

	//통합회원 유니크 아이디	신규	unifyId	STRING	생성 필요
	//_contact.fieldValues.push({"id": "100368", "value": _req_data.unifyId});
	SetFieldValue(_contact.fieldValues, "100368", _req_data.unifyId);

	//업종	신규	sector	STRING	Industry
	//_contact.fieldValues.push( { "id": "100046", "value": _req_data.sector });
	SetFieldValue(_contact.fieldValues, "100046", _req_data.sector);

	//Platform&Activity GetCustomFiledValue(FieldValues_data, 100202);
	//_contact.fieldValues.push( { "id": "100202", "value": "LGE.co.kr" });
	SetFieldValue(_contact.fieldValues, "100202", "LGE.co.kr");

	//Marketing Event GetCustomFiledValue(FieldValues_data, 100203);
	//_contact.fieldValues.push( { "id": "100203", "value": "KR_LGE.co.kr_OnlineInquiry" });
	SetFieldValue(_contact.fieldValues, "100203", "KR_LGE.co.kr_OnlineInquiry");

	//Subsidiary GetCustomFiledValue(FieldValues_data, 100196);
	//_contact.fieldValues.push( { "id": "100196", "value": "KR" });
	SetFieldValue(_contact.fieldValues, "100196", "KR");

	await b2bkr_eloqua.data.contacts.update(contact.id, contact).then((result) => {
		// console.log(result);
		return_data = result;
	}).catch((err) => {
		// console.error(err);
		console.error(err.message);
		return_data = err;
	});
	return return_data;
}


//co.kr 소식지 연락처 업데이트 함수
async function UpdateContacData_newsLetter(_contact, _req_data) {
	var contact = _contact;

	//만약 기존 사용자 정보중 isSubscribed false이면 true로 변경 contact_data.elements[0].isSubscribed
	if (_contact.isSubscribed === 'false') {
		_contact.isSubscribed = true;
	}

	// if(contact.accountName){
	// 	contact.accountname = _req_data;
	// 	delete contact.accountName;
	// }

	// 소식지에서는 사용자 기본정보를 전송하는 게 없다.
	// _contact.accountname = _req_data.customerName;
	//zip
	// _contact.postalCode = _req_data.postalCode;
	//address1
	// _contact.address1 = _req_data.baseAddr;
	//address2 / Address3
	// _contact.address2 = _req_data.detailAddr;
	//Business Phone
	// _contact.businessPhone = _req_data.phoneNo;
	//FirstName / LastName
	// _contact.firstName = _req_data.contactName.substring(1, _req_data.contactName.length);
	// _contact.lastName = _req_data.contactName.substring(0, 1);
	// _contact.firstName = _req_data.contactFirstName;
	// _contact.lastName = _req_data.contactLastName;
	//Mobile Phone
	// _contact.mobilePhone = _req_data.contactCellularNo;
	//Email Address
	_contact.emailAddress = _req_data.cEmail;

	//inqurity to by message 100209
	// SetFieldValue(_contact.fieldValues, "100209", _req_data.custRemark);

	//KR_Privacy Policy_Collection and Usage
	//_contact.fieldValues.push( { "id": "100315", "value": _req_data.ppYn == "Y" ? "YES" : "NO" });
	SetFieldValue(_contact.fieldValues, "100315", "Yes");

	//KR_Privacy Policy_Collection and Usage_AgreedDate
	//_contact.fieldValues.push( { "id": "100320", "value": moment().tz('Asia/Seoul').unix() });
	SetFieldValue(_contact.fieldValues, "100320", moment().tz('Asia/Seoul').unix());

	//KR_Privacy Policy_Consignment of PI
	//_contact.fieldValues.push( { "id": "100316", "value": _req_data.pcYn == "Y" ? "YES" : "NO" });
	SetFieldValue(_contact.fieldValues, "100316", "Yes");

	//KR_Privacy Policy_Transfer PI Aborad
	//_contact.fieldValues.push( { "id": "100317", "value": _req_data.tpiYn == "Y" ? "YES" : "NO" });
	SetFieldValue(_contact.fieldValues, "100317", "Yes");

	//KR_Privacy Policy_Optin
	//_contact.fieldValues.push( { "id": "100318", "value": _req_data.mktRecYn == "Y" ? "YES" : "NO" });
	SetFieldValue(_contact.fieldValues, "100318", "Yes");

	//KR_Privacy Policy_Optin_Date
	//_contact.fieldValues.push( { "id": "100319", "value": moment().tz('Asia/Seoul').unix() });
	SetFieldValue(_contact.fieldValues, "100319", moment().tz('Asia/Seoul').unix());

	//통합회원 유니크 아이디	신규	unifyId	STRING	생성 필요
	//_contact.fieldValues.push({"id": "100368", "value": _req_data.unifyId});
	SetFieldValue(_contact.fieldValues, "100368", _req_data.unifyId);

	//업종	신규	sector	STRING	Industry
	//_contact.fieldValues.push( { "id": "100046", "value": _req_data.sector });
	SetFieldValue(_contact.fieldValues, "100046", _req_data.cCode);

	//Platform&Activity GetCustomFiledValue(FieldValues_data, 100202);
	//_contact.fieldValues.push( { "id": "100202", "value": "LGE.co.kr" });
	SetFieldValue(_contact.fieldValues, "100202", "LGE.co.kr");

	//Marketing Event GetCustomFiledValue(FieldValues_data, 100203);
	//_contact.fieldValues.push( { "id": "100203", "value": "KR_LGE.co.kr_OnlineInquiry" });
	SetFieldValue(_contact.fieldValues, "100203", "KR_LGE.co.kr_B2BNewsletter");

	//Subsidiary GetCustomFiledValue(FieldValues_data, 100196);
	//_contact.fieldValues.push( { "id": "100196", "value": "KR" });
	SetFieldValue(_contact.fieldValues, "100196", "KR");

	await b2bkr_eloqua.data.contacts.update(contact.id, contact).then((result) => {
		// console.log(result);
		return_data = result;
	}).catch((err) => {
		// console.error(err);
		console.error(err.message);
		return_data = err;
	});
	return return_data;
}

//커스텀 필드 값 수정 함수
function SetFieldValue(_fieldValues, _id, _value) {
	for (i = 0; i < _fieldValues.length; i++) {
		if (_fieldValues[i].id == _id) {
			_fieldValues[i].value = _value;
			break;
		}
	}
}

//커스텀 오브젝트 데이터 조회
router.get('/customObjectDataSearch/:id', function (req, res, next) {
	var parentId = req.params.id;
	var queryString = "";
	//queryString.emailAddress = req.params.email;

	b2bkr_eloqua.data.customObjects.data.get(parentId, queryString).then((result) => {
		console.log(result.data);
		res.json(result.data);
	}).catch((err) => {
		console.error(err.message);
		res.send(error);
	});
});

//커스텀 오브젝트 데이터 검색
router.get('/customQuerySearch/:id', async function (req, res, next) {
	console.log("customQuerySearch");

	// queryString['depth'] = "complete";

	// var queryText =  "lastUpdatedAt>2021-05-10";
	let parent_id = req.params.id;
	let response_data = await GetKR_CustomDataSearch("2021-05-17", "2021-05-18", parent_id);

	var B2B_GERP_KR_DATA = Convert_B2BGERP_KR_DATA(cod_json);

	var send_data = {
		elements: B2B_GERP_KR_DATA,
		total: B2B_GERP_KR_DATA.length
	}

	res.json(send_data);

	console.log(response_data.elements.length);
	res.json(response_data);
});

//커스텀 오브젝트 조회
router.get('/customObjectSearch', function (req, res, next) {
	var queryString = "";
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
	var queryString = {};
	queryString["depth"] = "complete";
	b2bkr_eloqua.assets.customObjects.getOne(id, queryString).then((result) => {
		console.log(result.data);
		res.json(result.data);
	}).catch((err) => {
		console.error(err.message);
		res.json(false);
	});
});

//소식지 연계 데이터 받기 newsletter
//커스텀 오브젝트 데이터 추가
router.post('/newsLetterAPI', async function (req, res, next) {
	console.log(1234);
	let req_data = req.body;
	console.log("newsLetterAPI");
	console.log(req);
	console.log(req.body);

	let parent_id = 43;
	try {
		if (validateEmail(req_data.cEmail)) {
			//해당 사용자 데이터 여부 확인
			var contact_data = await GetContactData(req_data.cEmail);

		
			// 기존에 사용자가 있을 경우 update 함
			if (contact_data && contact_data.total > 0) {
				//기존사용자 정보 업데이트
				var update_result = await UpdateContacData_newsLetter(contact_data.elements[0], req_data);
				
				if (update_result) {
					var customObjectCreateData = ConvertCustomObjectData_newsLetter(contact_data.elements[0], req_data);
					//커스텀 오브젝트 데이터 전송

					console.log(customObjectCreateData);

					var customObject_result = await SendCreateCustomObjectData(parent_id , customObjectCreateData);

					if (customObject_result) {
						console.log(customObject_result);
						res.json({
							"Result": "success"
						});
					} else {
						res.json({
							"Result": "failed",
							"ErrorInfo": "Custom Object Data Send Error",
							"ErrorMessage": customObject_result.message
						});
					}
				} else {
					res.json({
						"Result": "failed",
						"ErrorInfo": "Contact Update Error",
						"ErrorMessage": update_result.message
					});
				}
			} else {
				//사용자가 없을경우 사용자 추가
				var contact_data = await InsertContactData_newsLetter(req_data);

				if (contact_data) {
					//사용자 추가 후 CustomObjectData 추가
					if (contact_data.data) {

						var customObjectCreateData = ConvertCustomObjectData_newsLetter(contact_data.data, req_data);
						
						console.log(customObjectCreateData);

						//커스텀 오브젝트 데이터 전송
						var customObject_result = await SendCreateCustomObjectData(parent_id , customObjectCreateData);

						console.log(customObject_result.data);

						res.json({
							"Result": "success"
						});
					} else {
						res.json({
							"Result": "failed",
							"ErrorInfo": "Custom Object Data Send Error",
							"ErrorMessage": customObject_result.message
						});
					}
				} else {
					res.json({
						"Result": "failed",
						"ErrorInfo": "Contact Add Error",
						"ErrorMessage": contact_data.message
					});
				}
			}
		} else {
			res.json({
				"Result": "failed",
				"ErrorInfo": "Request Email Error",
				"ErrorMessage": "Request Email Validation Check"
			})
		}
	} catch (err) {
		res.json(
			{
				"Result": "failed",
				"ErrorInfo": "System Error Check",
				"ErrorMessage": err.message
			}
		);
	}
});

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
module.exports = router;
module.exports.senderToB2BGERP_KR = senderToB2BGERP_KR;
