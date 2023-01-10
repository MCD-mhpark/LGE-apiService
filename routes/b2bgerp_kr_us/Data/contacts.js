var express = require('express');
var router = express.Router();
const {
	param
} = require('../../common/history');

var utils = require('../../common/utils');
var moment = require('moment-timezone');
//const request =  require('request'); 
var request_promise = require('request-promise');
var request = require('request');
var fs = require("mz/fs");
var dirPath = "KR_TEST";
var Model = require('./kr_Model');
var Controller = require('./kr_Controller');


moment.locale('kr');
//=====================================================================================================================
// 한국영업본부 LOG 함수
//=====================================================================================================================
function req_res_logs(filename, business_name, data) {
	// filename : request , response 
	// business_name : 사업부별 name
	// data : log 저장할 데이터

	var today = moment().tz('Asia/Seoul').format("YYYYMMDD") + "_" + "MAT_TO_B2BGERPKR";
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
	// var queryString = "";
	
	// if(type == 'get') queryString += "?search=B2B_GERP_KR_____1=''"
	// if(type == 'init')  queryString += "?search=B2B_GERP_KR_____1='Y'"

	// // Get 요청하기 http://www.google.com 
	// const options = {
	// 	uri: "https://secure.p03.eloqua.com/api/REST/1.0/data/customObject/" + parentId + queryString
	// 	, headers: {
	// 		'Authorization': 'Basic ' + 'TEdFbGVjdHJvbmljc1xMZ19hcGkuQjJiX2tyOlFXZXIxMjM0IUA='
	// 	}
	// };

	// await request_promise.get(options, function (error, response, body) {
	// 	// console.log("data return");
	// 	// console.log(response.statusMessage);
	// 	// console.log(response.statusCode);
	// 	//console.log(body);
	// 	try {
	// 		return_data = JSON.parse(body);
	// 	} catch(e) {
	// 		console.log(">>>>>>>>>>>>>json parse error:" + body);
	// 		console.log(e);
	// 	}
		
	// });

	var queryString = {};

	if(type == 'get') queryString['search'] =  "?B2B_GERP_KR_____1=''"
	if(type == 'init')  queryString['search'] =  "?B2B_GERP_KR_____1='Y'"
	
	await lge_eloqua.data.customObjects.data.get(_parentId, queryString).then((result) => {
		if (result.data && result.data.total > 0) {
			return_data = result.data;
		}
	}).catch((err) => {
		console.log(">>>>>>>>>>>>>GetKR_CustomDataSearch:" + result);
		console.log(err);
	})
	
	return return_data;
}

router.get('/trans_gubun_init', async function (req, res, next) {
	var parentId = 39;  // 한국영업본부 온라인 견적문의 커스텀 오브젝트 ID
	var COD_list = await GetKR_CustomDataSearch(parentId ,"init");
	let trans_up_list = await Controller.getTransfer_UpdateData( COD_list.elements , "init");
	console.log(COD_list.elements.length);

	await Controller.sendTransfer_Update(parentId , trans_up_list);
});


//=====================================================================================================================
// 한국영업본부 B2B GERP KR 전송
//=====================================================================================================================

router.post('/sender', async function (req, res, next) {
	senderToB2BGERP_KR()
});

async function senderToB2BGERP_KR(){
	console.log("Call senderToB2BGERP_KR + ")
	var parentId = 39;  // 한국영업본부 온라인 견적문의 커스텀 오브젝트 ID

	// var start_date = '2021-05-17 09:00:01';
	// var end_date = '2021-05-17 23:59:59';
	var COD_list = await GetKR_CustomDataSearch(parentId ,"get");

	var B2B_GERP_KR_DATA = Model.Convert_B2BGERP_KR_DATA(COD_list);

	//LG전자 KR 개발 Endpoint
	// let dev_url = "https://dev-apigw-ext.lge.com:7221/gateway/b2bgerp/api2api/leadByEloquaNavG/leadByEloquaKR.lge"
													 
	//LG전자 KR 운영 Endpoint
	let prd_url = "https://apigw-ext.lge.com:7211/gateway/b2bgerp/api2api/leadByEloquaNavG/leadByEloquaKR.lge"
	
	// console.log(B2B_GERP_KR_DATA);
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

	req_res_logs("reqEloqua_" + moment().tz('Asia/Seoul').format("HH시mm분") , "MAT_TO_B2BGERPKR" , COD_list );
	req_res_logs("reqConvert_" + moment().tz('Asia/Seoul').format("HH시mm분")  , "MAT_TO_B2BGERPKR", B2B_GERP_KR_DATA );
	// req_res_logs("reqTotal" , business_name , total_logs );
	

	//   var bant_result_list = await setBant_Update( business_name , bant_update_list );
	//   req_res_logs("bantResult" , business_name , bant_result_list );
	//   res.json(bant_result_list);
		await request_promise.post(options, async function (error, response, body) {
	        // console.log(response);
			
	        if(error){
	            console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
	            // console.log(error);
				let errorData = {
					errorCode : response.statusCode,
					errorMsg : error.message 
				}
				req_res_logs("responseError_" + moment().tz('Asia/Seoul').format("HH시mm분")  , "MAT_TO_B2BGERPKR" , errorData );	
	        }else if(!error && response.statusCode != 200 ){
			
				let errorData = {
					errorCode : response.statusCode,
					errorMsg : "Error Object Not Found & Response Code Not 200" ,
					errorDetailMsg : response.body
				}
				req_res_logs("responseError_" + moment().tz('Asia/Seoul').format("HH시mm분")  , "MAT_TO_B2BGERPKR" , errorData );
				req_res_logs("requestObject_" + moment().tz('Asia/Seoul').format("HH시mm분")  , "MAT_TO_B2BGERPKR" , response );
			}else if (!error && response.statusCode == 200) {
	    		req_res_logs("response_" + moment().tz('Asia/Seoul').format("HH시mm분")  , "MAT_TO_B2BGERPKR" , body.resultData );
	            if(B2B_GERP_KR_DATA.length > 0 ) {
	                // console.log(B2B_GERP_KR_DATA);
	                let trans_up_list = await Controller.getTransfer_UpdateData( COD_list.elements , "get");
					// console.log(trans_up_list[0].fieldValues);
					await Controller.sendTransfer_Update(parentId , trans_up_list);
	            }   
	        }
	    });
	}
	else {
		let noneData = {
			errorInfo : null ,
			errorMessage : "보낼 데이터가 없습니다."
		}
		req_res_logs("noneData_" + moment().tz('Asia/Seoul').format("HH시mm분")  , "MAT_TO_B2BGERPKR" , noneData );
		
	}
}



//=====================================================================================================================
// 한국영업본부 CO.KR 견적문의 API
//=====================================================================================================================

//커스텀 오브젝트 데이터 추가
router.post('/customObjectDataCreate', async function (req, res, next) {
	console.log("call customObjectDataCreate");
	var req_data = req.body;
	let parent_id = 39;

	console.log(req_data);
	try {
		if (Controller.validateEmail(req_data.contactEmailAddr)) {
			//해당 사용자 데이터 여부 확인
			var contact_data = await Controller.GetContactData(req_data.contactEmailAddr);
			
			if (contact_data && contact_data.total > 0) {
				//기존사용자 정보 업데이트

				// console.log("CustomObjectDataCreate Updater Checker");
				// console.log(contact_data);
				var update_result = await Controller.updateContactData(contact_data.elements[0], req_data);

				if (update_result) {
					var customObjectCreateData = Model.convertCustomObjectData(contact_data.elements[0], req_data);

					console.log("CustomObjectDataCreate Updater depth2");
					// console.log(customObjectCreateData);
					// 커스텀 오브젝트 중복 체크
					let duple_custom_data = await Duple_Custom_Data(parent_id , req_data , "online_estimation");
					console.log("duple_custom_data.total : " + duple_custom_data.total);
					//커스텀 오브젝트 데이터 전송
					var customObject_result ; 
					if(duple_custom_data.total == 0 ) customObject_result = await Controller.SendCreateCustomObjectData(parent_id , customObjectCreateData);

					if (customObject_result) {
						// console.log(customObject_result);
						res.json({
							"Result": "success"
						});
					}else if(duple_custom_data.total >= 1){
						res.json({
							"Result": "failed",
							"ErrorInfo": "co.kr Online Custom Object Data Duplicate",
							"ErrorMessage": "Custom Object Data Duplicate"
						})
					} else {
						res.json({
							"Result": "failed",
							"ErrorInfo": "co.kr Online Custom Object Data Send Error",
							"ErrorMessage": "co.kr Online CustomObject Create Error"
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
				var contact_data = await Controller.insertContactData(req_data);

				// console.log("CustomObjectDataCreate Insert Checker");
				// console.log(contact_data);
				if (contact_data) {
					//사용자 추가 후 CustomObjectData 추가
					if (contact_data.data) {

						var customObjectCreateData = await Model.convertCustomObjectData(contact_data.data, req_data)
					
						// 커스텀 오브젝트 중복 체크
						let duple_custom_data = await Duple_Custom_Data(parent_id , req_data , "online_estimation");
						
						//커스텀 오브젝트 데이터 전송
						// console.log("duple_custom_data.total : " + duple_custom_data.total);

						console.log("CustomObjectDataCreate insert depth2");
						// console.log(customObjectCreateData);
						var result_data ;
						if(duple_custom_data.total == 0 ) result_data = await Controller.SendCreateCustomObjectData(parent_id , customObjectCreateData);

						// console.log(result_data.data);

						if(result_data) {
							res.json({
								"Result": "success"
							});
						}else if(duple_custom_data.total >= 1){
							res.json({
								"Result": "failed",
								"ErrorInfo": "co.kr Online Custom Object Data Duplicate",
								"ErrorMessage": "Custom Object Data Duplicate"
							})
						}
						
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
		console.log(err.stack)
		console.log("ERR발생 : " + err.message);

	}
});

// 커스텀 오브젝트 데이터 적재 전 중복 체크 
async function Duple_Custom_Data(parent_id , _req_data , api_name){
	
	let queryString = {};

	if(api_name == 'online_estimation'){
		queryString.search = "?______1='"+_req_data.estimationSeqNo+"'";
	}else if(api_name == 'newsletter'){ //사용안함
		queryString.search = "?___1='"+_req_data.cEmail+"'";
	}
	
	queryString.depth = "complete";

	console.log(queryString);
	await lge_eloqua.data.customObjects.data.get(parent_id, queryString ).then((result) => {
		// console.log(result);
		return_data = result.data;
	}).catch((err) => {
		// console.error(err);
		console.error(err.message);
		return_data = err.message;
	});
	
	return return_data;
}


//=====================================================================================================================
// KR NewsLetter API
//=====================================================================================================================
router.post('/newsLetterAPI', async function (req, res, next) {

	let req_data = req.body;

	console.log("newsLetterAPI");
	console.log(req.body);

	let parent_id = 43;
	try {
		if (Controller.validateEmail(req_data.cEmail)) {
			//해당 사용자 데이터 여부 확인
			
			var contact_data = await Controller.GetContactData(req_data.cEmail);
		
			// 기존에 사용자가 있을 경우 update 함
			if (contact_data && contact_data.total > 0) {
				//기존사용자 정보 업데이트
				var update_result = await Controller.updateContactData_newsLetter(contact_data.elements[0], req_data);
				
				if (update_result) {

					var customObjectCreateData = Model.convertCustomObjectData_newsLetter(contact_data.elements[0], req_data);
					
					// 커스텀 오브젝트 중복 체크 안함 (커스텀 오브젝트 데이터는 기록관리용으로 사용하기로함 )
					//let duple_custom_data = await Duple_Custom_Data(parent_id , req_data , "newsletter");
					
					//커스텀 오브젝트 데이터 전송
					var customObject_result = await Controller.SendCreateCustomObjectData(parent_id , customObjectCreateData);

					if (customObject_result) {
						console.log(customObject_result);
						res.json({
							"Result": "success"
						});
					} else {
						res.json({
							"Result": "failed",
							"ErrorInfo": "co.kr NewsLetter Custom Object Data Send Error",
							"ErrorMessage": customObject_result.message
						});
					}
				} else {
					res.json({
						"Result": "failed",
						"ErrorInfo": "co.kr NewsLetter Contact Update Error",
						"ErrorMessage": update_result.message
					});
				}
			} else {
				//사용자가 없을경우 사용자 추가
				var contact_data = await Controller.insertContactData_newsLetter(req_data);

				if (contact_data) {
					//사용자 추가 후 CustomObjectData 추가
					if (contact_data.data) {

						var customObjectCreateData = Model.convertCustomObjectData_newsLetter(contact_data.data, req_data);
						
						// 커스텀 오브젝트 중복 체크 안함 (커스텀 오브젝트 데이터는 기록관리용으로 사용하기로함 )
						//let duple_custom_data = await Duple_Custom_Data(parent_id , req_data , "newsletter");

						//커스텀 오브젝트 데이터 전송
						var customObject_result = await Controller.SendCreateCustomObjectData(parent_id , customObjectCreateData);

						console.log(customObject_result.data);

						if (customObject_result) {
							console.log(customObject_result);
							res.json({
								"Result": "success"
							});
						} else {
							res.json({
								"Result": "failed",
								"ErrorInfo": "co.kr NewsLetter Custom Object Data Send Error",
								"ErrorMessage": customObject_result.message
							});
						}	
					} else {
						res.json({
							"Result": "failed",
							"ErrorInfo": "co.kr NewsLetter Custom Object Data Send Error",
							"ErrorMessage": customObject_result.message
						});
					}
				} else {
					res.json({
						"Result": "failed",
						"ErrorInfo": "co.kr NewsLetter Contact Add Error",
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
		console.log(err.stack)
		console.log("ERR발생 : " + err.message);

	}
});

//온라인 견적문의 중 견적일련번호 중복에 대해 함수 테스트 하기 위해 만든 것
router.post('/customdata_duple_checker', async function (req, res, next) {
	
	// 예시데이터
	// let parent_id = 39;
	// let req_data = {
	// 	estimationSeqNo : "20211006133555033"
	// }

	let parent_id = 39;
	let req_data = req.body;

	let duple_custom_data = await Duple_Custom_Data(parent_id , req_data , "online_estimation");
	// console.log(duple_custom_data.total);
	res.json(duple_custom_data);
});

// co.kr 견적문의 사이트 와 B2B GERP KR 가망기회 데이터 리스트를 살펴볼때 사용하기 위해 만든것
router.post('/search_online_esti', async function (req, res, next) {
	let parent_id = 39;
	let status = req.body.status;
	let data_list = [];
	let return_data = [];


	if(status == "estimationId") data_list = req.body.estimationId;
	else if(status == "estimationSeqNo") data_list = req.body.estimationSeqNo;
	console.log(data_list)
	for(let item of data_list){

		let queryString = {};
		
		if(status == "estimationId") queryString.search = "?____1='"+item+"'";
		else if(status == "estimationSeqNo") queryString.search = "?______1='"+item+"'";
		
		queryString.depth = "complete";
		console.log(item);
		console.log(queryString);
		await lge_eloqua.data.customObjects.data.get(parent_id, queryString ).then(async (result) => {
			// console.log(result);
			console.log(result.data);

			let result_none_object = {};

			if(status == "estimationId"){
				result_none_object.estimationId = item;
				result_none_object.errorInfo = "Not Search Data";
			} 
			else if(status == "estimationSeqNo"){
				result_none_object.estimationSeqNo = item;
				result_none_object.errorInfo = "Not Search Data";
			} 
			

			if(result.data.elements.length > 0) await return_data.push(result.data.elements);
			else if(result.data.elements.length == 0){
				await return_data.push(result_none_object);
			} 
		}).catch(async (err) => {
			// console.error(err);
			console.error(err.message);
			let error_object = {};
			if(status == "estimationId"){
				error_object.estimationId = item;
				error_object.errorInfo = err.message;
			} 
			else if(status == "estimationSeqNo"){
				data_list = req.body.estimationSeqNo;
				error_object.errorInfo = err.message;
			} 

			await return_data.push(error_object);
		});

		
	}
	console.log(return_data);	
	res.json(return_data);
});


router.post('/create_data_duple_checker', async function (req, res, next) {
	let parent_id = 39;
	let status = req.body.status;
	let data_list = [];

	let return_object = {};
	let duple_list = [];
	let another_list = [];

	let co_kr_list = req.body.co_kr_list;
	let b2b_gerp_kr_list = req.body.b2b_gerp_kr_list;
	console.log(co_kr_list);
	console.log(b2b_gerp_kr_list);

	// duple_list = await co_kr_list.filter(x => b2b_gerp_kr_list.includes(x));
	// another_list = await co_kr_list.filter(x => !b2b_gerp_kr_list.includes(x));

	duple_list = await b2b_gerp_kr_list.filter(x => co_kr_list.includes(x));
	another_list = await co_kr_list.filter(x => !co_kr_list.includes(x));

	return_object.duple_list = duple_list;
	return_object.another_list = another_list;
	console.log(return_object);	
	res.json(return_object);
});


//=====================================================================================================================
// Eloqua API Ver 1.0
//=====================================================================================================================

//커스텀 오브젝트 데이터 조회
router.get('/customObjectDataSearch/:id', function (req, res, next) {
	var parentId = req.params.id;
	var queryString = "";
	console.log(parentId)
	queryString.depth = "complete";
	//queryString.emailAddress = req.params.email;

	lge_eloqua.data.customObjects.data.get(parentId, queryString).then((result) => {
		console.log(result.data);
		res.json(result.data);
	}).catch((err) => {
		console.error(err.message);
		res.send(error);
	});
});

//커스텀 오브젝트 데이터 조회
router.get('/customObjectDataSearchOne/:parentID/:customObjectID', function (req, res, next) {
	var parentId = req.params.parentID;
	var id = req.params.customObjectID
	var queryString = {};
	queryString.depth = "complete";
	console.log(parentId)
	//queryString.emailAddress = req.params.email;

	lge_eloqua.data.customObjects.data.getOne(parentId, id , queryString).then((result) => {
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

	var B2B_GERP_KR_DATA = Model.Convert_B2BGERP_KR_DATA(cod_json);

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
	queryString.depth = "complete";
	lge_eloqua.assets.customObjects.get(queryString).then((result) => {
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
	lge_eloqua.assets.customObjects.getOne(id, queryString).then((result) => {
		console.log(result.data);
		res.json(result.data);
	}).catch((err) => {
		console.error(err.message);
		res.json(false);
	});
});

module.exports = router;
module.exports.senderToB2BGERP_KR = senderToB2BGERP_KR;
