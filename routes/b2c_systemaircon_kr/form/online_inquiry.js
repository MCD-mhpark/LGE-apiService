var express = require('express');
var router = express.Router();
var moment = require('moment-timezone');
var fs = require("mz/fs");
const logger = require('./b2c_log');


//=====================================================================================================================
// 한국영업본부 B2C Online 시스템에어컨 견적문의 API //"B2C_Online_inquiry_KR"  
//=====================================================================================================================

//폼 견적문의 데이터 제출
router.post('/online_inquiry', async (req, res, next) => {

	logger.info("submit B2C online_inquiry");

	let url = req.url
	logger.info(url);

	let form_id = 5557;
	let req_data = req.body;
	logger.info(req_data);

	try {
		// 1. Email Validation check
		if (req_data.customerEmailAddr !== undefined) {
			validateEmail(req_data.customerEmailAddr)
		} else {
			throw new Error(`customerEmailAddr = ${req_data.customerEmailAddr}`)
		}

		// 2. req_data -> form_data convert
		let insertForm = await convertData(req_data);

		// 3. send form_data 
		try {
			//let formData_result = await sendFormData(form_id, insertForm);
			await sendFormData(form_id, insertForm);

			res.json({
				"ResultCode": "success",
				"ResultMessage": "Form Data send complete",
			});
			logger.info("=================SendFormData complete====================")

		} catch (err) {
			res.json({
				"Result": "failed",
				"ErrorInfo": "Form Data Send Error",
				"ResultMessage": err.message
			});
			logger.error(err.stack)
		}


	} catch (err) {
		res.json({
			"Result": "failed",
			"ResultCode": "Error",
			"ResultMessage": err.message
		});
		logger.error(err.stack);
	}

});

// Email Validation check
function validateEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	if (!re.test(String(email).toLowerCase())) { throw new Error(`이메일 형식(${email})이 올바르지 않습니다.`) }

};

//send form_data 
async function sendFormData(form_id, insertForm) {
	logger.info("=================SendFormData start====================")
	logger.info(insertForm)

	let return_data;

	await lge_eloqua.data.formData.create(form_id, insertForm).then((result) => {

		return_data = result;

	}).catch((err) => {
		logger.error(err.stack);
		throw err
	});

	return return_data;

}

// req_data -> form_data convert
async function convertData(data) {

	//리드 네임 변경
	let leadSourcesName;
	if (data.managerCompany == "BEST SHOP") {
		leadSourcesName = "B2C사이트(하이프라자)"
	} else {
		leadSourcesName = "B2C사이트(일반)"
	}

	let resultform = {};
	resultform.type = "FormData";
	resultform.fieldValues = [

		{
			"type": "FieldValue",
			"id": "98538",
			"name": "등록기기",
			"value": data.staySave
		},
		{
			"type": "FieldValue",
			"id": "98539",
			"name": "연결 사원 제품 정보",
			"value": data.managerModelInfo
		},
		{
			"type": "FieldValue",
			"id": "98540",
			"name": "연결 사원 번호",
			"value": data.managerNumber
		},
		{
			"type": "FieldValue",
			"id": "98541",
			"name": "연결 사원 이름",
			"value": data.managerName
		},
		{
			"type": "FieldValue",
			"id": "98542",
			"name": "연결 사원 지점명",
			"value": data.managerBranch
		},
		{
			"type": "FieldValue",
			"id": "98543",
			"name": "연결 사원 회사",
			"value": data.managerCompany
		},
		{
			"type": "FieldValue",
			"id": "98544",
			"name": "추가 문의 사항",
			"value": data.custRemark
		},
		{
			"type": "FieldValue",
			"id": "98545",
			"name": "상담 요청 일자",
			"value": data.requestDate
		},
		{
			"type": "FieldValue",
			"id": "98546",
			"name": "제품 브랜드",
			"value": data.model_brande
		},
		{
			"type": "FieldValue",
			"id": "98547",
			"name": "제품 타입",
			"value": data.modelType
		},
		{
			"type": "FieldValue",
			"id": "98548",
			"name": "설치 시점",
			"value": data.setDate

		},
		{
			"type": "FieldValue",
			"id": "98549",
			"name": "설치 수량",
			"value": data.setQty
		},
		{
			"type": "FieldValue",
			"id": "98550",
			"name": "설치 면적",
			"value": data.setArea
		},
		{
			"type": "FieldValue",
			"id": "98551",
			"name": "설치 유형",
			"value": data.setType
		},
		{
			"type": "FieldValue",
			"id": "98552",
			"name": "설치 현장 (시/도)",
			"value": data.megaCity
		},
		{
			"type": "FieldValue",
			"id": "98553",
			"name": "설치 현장 (시/군/구)",
			"value": data.city
		},
		{
			"type": "FieldValue",
			"id": "98554",
			"name": "설치 장소 상세 주소",
			"value": data.setAreaDetail
		},
		{
			"type": "FieldValue",
			"id": "98555",
			"name": "설치 장소 기본 주소",
			"value": data.setAreaBase
		},
		{
			"type": "FieldValue",
			"id": "98556",
			"name": "설치 장소 우편번호",
			"value": data.setAreaPost
		},
		{
			"type": "FieldValue",
			"id": "98557",
			"name": "신규교체여부",
			"value": data.oldNewFlag
		},
		{
			"type": "FieldValue",
			"id": "98558",
			"name": "제품 설명",
			"value": data.productDesc
		},

		{
			"type": "FieldValue",
			"id": "98559",
			"name": "모델 이름",
			"value": data.modelName
		},

		{
			"type": "FieldValue",
			"id": "98560",
			"name": "모델 코드",
			"value": data.modelCode
		},
		{
			"type": "FieldValue",
			"id": "98561",
			"name": "고객 상세 주소",
			"value": data.detailAddr
		},
		{
			"type": "FieldValue",
			"id": "98562",
			"name": "고객 기본 주소",
			"value": data.baseAddr
		},
		{
			"type": "FieldValue",
			"id": "98563",
			"name": "고객 우편 번호",
			"value": data.postalCode
		},
		{
			"type": "FieldValue",
			"id": "98564",
			"name": "고객 이메일",
			"value": data.customerEmailAddr
		},
		{
			"type": "FieldValue",
			"id": "98565",
			"name": "고객휴대전화번호",
			"value": data.mobilePhone
		},

		{
			"type": "FieldValue",
			"id": "98566",
			"name": "고객명 (성)",
			"value": data.lastName
		},

		{
			"type": "FieldValue",
			"id": "98567",
			"name": "고객명 (이름)",
			"value": data.firstName
		},
		{
			"type": "FieldValue",
			"id": "98568",
			"name": "통합 회원 UNIFY ID",
			"value": data.unifyId
		},

		// managerCompany에 따라 리드소스 명 변경 => B2C사이트(하이프라자) or B2C사이트(일반)
		{
			"type": "FieldValue",
			"id": "105247",
			"name": "KR_Lead Sources",
			"value": leadSourcesName
		},

		{
			"type": "FieldValue",
			"id": "98572",
			"name": "개인정보 수집 및 이용동의 여부",
			"value": "Yes"
		},
		{
			"type": "FieldValue",
			"id": "98573",
			"name": "개인정보 수집 및 이용동의 일자",
			"value": moment().tz('Asia/Seoul').format("YYYY-MM-DD HH:mm:ss")
		},
		{
			"type": "FieldValue",
			"id": "98574",
			"name": "개인정보 위탁 처리 동의 여부",
			"value": "Yes"
		},
		{
			"type": "FieldValue",
			"id": "98575",
			"name": "개인정보 위탁 처리 동의 일자",
			"value": moment().tz('Asia/Seoul').format("YYYY-MM-DD HH:mm:ss")
		},
		{
			"type": "FieldValue",
			"id": "98576",
			"name": "개인정보 국외 이전 동의 여부",
			"value": "Yes"
		},
		{
			"type": "FieldValue",
			"id": "98577",
			"name": "개인정보 국외 이전 동의 일자",
			"value": moment().tz('Asia/Seoul').format("YYYY-MM-DD HH:mm:ss")
		},
		{
			"type": "FieldValue",
			"id": "98578",
			"name": "LG전자 마케팅 정보 수신 동의 여부",
			"value": data.mktRecYn === 'N' ? "No" : "Yes"
		},
		{
			"type": "FieldValue",
			"id": "98579",
			"name": "LG전자 마케팅 정보 수신 동의 일자",
			"value": moment().tz('Asia/Seoul').format("YYYY-MM-DD HH:mm:ss")
		},
		{
			"type": "FieldValue",
			"id": "98580",
			"name": "Platform&Activity",
			"value": "LGE.co.kr"
		},
		{
			"type": "FieldValue",
			"id": "98581",
			"name": "Marketing Event",
			"value": "B2C시스템개인견적문의"
		},
		{
			"type": "FieldValue",
			"id": "98582",
			"name": "Subsidiary",
			"value": "KR"
		}
	];

	return resultform;

}


//폼 Id 조회 및 폼 Field 조회
//req.query.name = KR_시스템에어컨 B2C개인견적문의 API 연계개발
router.get('/searchFormId', async (req, res, next) => {

	let searchString = "?name='" + req.query.name + "'";

	let queryString = {
		search: searchString,
		depth: req.query.depth ? req.query.depth : 'minimal'
	}

	b2bkr_eloqua.assets.forms.get(queryString).then((result) => {
		console.log(result.data);
		res.json(result.data);
	}).catch((err) => {
		console.error(err.message);
		res.json(err);
	});

});

module.exports = router;