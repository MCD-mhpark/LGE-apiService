var moment = require('moment-timezone');

//=====================================================================================================================
// 한국영업본부 CO.KR 견적문의 API, Eloqua 적재
//=====================================================================================================================
exports.i_ConvertB2BKRContact = function (_req_data) {

	var contact_data = {};
	contact_data.fieldValues = [];

	contact_data.accountname = reConvertXSS(_req_data.customerName);
	
	//zip
	contact_data.postalCode = _req_data.postalCode;
	//address1
	contact_data.address1 = reConvertXSS(_req_data.baseAddr);
	//address2 / Address3
	contact_data.address2 = reConvertXSS(_req_data.detailAddr);
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
		"value": reConvertXSS(_req_data.custRemark).replace(/(<([^>]+)>)/ig,"")
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
	contact_data.fieldValues.push({
		"id": "100311",
		"value": _req_data.cProductCode
	});

	contact_data.fieldValues.push({
		"id": "100384",
		"value": "B2B사이트(LGE.co.kr)"
	});

	return contact_data;
}

exports.u_ConvertB2BKRContact = function (_contact, _req_data) {
	var contact = _contact;

	//만약 기존 사용자 정보중 isSubscribed false이면 true로 변경 contact_data.elements[0].isSubscribed
	if (_contact.isSubscribed === 'false') {
		_contact.isSubscribed = true;
	}

	// if(contact.accountName){
	// 	contact.accountname = _req_data;
	// 	delete contact.accountName;
	// }

	_contact.accountname = reConvertXSS(_req_data.customerName);
	//zip
	_contact.postalCode = _req_data.postalCode;
	//address1
	_contact.address1 = reConvertXSS(_req_data.baseAddr);
	//address2 / Address3
	_contact.address2 = reConvertXSS(_req_data.detailAddr);
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
	SetFieldValue(_contact.fieldValues, "100209", reConvertXSS(_req_data.custRemark).replace(/(<([^>]+)>)/ig,""));

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

	//KR_LeadSource
	SetFieldValue(_contact.fieldValues, "100384", "B2B사이트(LGE.co.kr)");

	return contact;
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

//Eloqua Data B2B GERP Global Mapping 데이터 생성
exports.Convert_B2BGERP_KR_DATA =  function (_cod_data) {
	var cod_elements = _cod_data.elements;
	var result_data = [];

	for (var i = 0; i < cod_elements.length; i++) {
		try {
			var result_item = new B2B_GERP_KR_ENTITY();

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

function GetCustomObjectValue(field_id, element, type) {
	var return_value = "";

	for (i = 0; i < element.fieldValues.length; i++) {
		if (element.fieldValues[i].id == field_id) {
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



//=====================================================================================================================
// 39번 B2B KR 커스텀 오브젝트 데이터 형태로 변경
//=====================================================================================================================
exports.convertCustomObjectData = function (_contact, _req_data) {
	var contact = _contact;
	var convert_data_entity = {};

	convert_data_entity.fieldValues = [];
	convert_data_entity.isMapped = "Yes";
	convert_data_entity.name = _req_data.contactEmailAddr;
	convert_data_entity.contactId = contact.id ;
	convert_data_entity.depth = "complete";

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
		"value": reConvertXSS(_req_data.custRemark).replace(/(<([^>]+)>)/ig,"")
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
		"value": reConvertXSS(_req_data.detailAddr)
	}); //상세주소	text	text			
	convert_data_entity.fieldValues.push({
		"id": "273",
		"value": reConvertXSS(_req_data.baseAddr)
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
		"value": reConvertXSS(_req_data.customerName)
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
		"id": "1904",
		"value": "B2B사이트(LGE.co.kr)"
	}); //KR_LeadSource 		

	return convert_data_entity;
}


//=====================================================================================================================
// KR NewsLetter
//=====================================================================================================================

exports.i_ConvertNewsLetterKRContact = function(_req_data){

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
		//KR_Product Category GetCustomFiledValue(FieldValues_data, 100311);
		contact_data.fieldValues.push({
			"id": "100311",
			"value": _req_data.cProductCode
		});
	
		//KR_LeadSource
		contact_data.fieldValues.push({
			"id": "100384",
			"value": "B2B사이트(소식지)"
		});

		return contact_data;
}

exports.u_ConvertNewsLetterKRContact = function(_contact, _req_data){

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

	//_contact.fieldValues.push( { "id": "100311", "value": "System Air Conditioner", "IT(Laptop/Desktop/Monitor)" ,"Display(TV, Signage)", "H&A", "Medical Device", "Robot", "Energy", "B2B All Products/Solutions"});
	SetFieldValue(_contact.fieldValues, "100311", _req_data.cProductCode);
	//SetFieldValue(_contact.fieldValues, "100311", _req_data.cProductCode);

	//KR_LeadSource
	SetFieldValue(_contact.fieldValues, "100384", "B2B사이트(소식지)");

	return contact;
}


//커스텀 오브젝트 데이터 형태로 변경
exports.convertCustomObjectData_newsLetter = function (_contact, _req_data) {
	var contact = _contact;

	var convert_data_entity = {};
	convert_data_entity.contactId = contact.id;
	convert_data_entity.fieldValues = [];
	convert_data_entity.isMapped = "Yes";
	convert_data_entity.name = _req_data.contactEmailAddr;
	convert_data_entity.type = "CustomObjectData";
	convert_data_entity.fieldValues = [];
	convert_data_entity.depth = "complete";


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

	convert_data_entity.fieldValues.push({
		"id": "1775",
		"value" : _req_data.cProductCode
	}); // KR_Product Category

	convert_data_entity.fieldValues.push({
		"id": "1969",
		"value" : "B2B사이트(소식지)"
	}); // KR_LeadSource
	

	return convert_data_entity;
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

//replaceAll prototype 선언
String.prototype.replaceAll = function(org, dest) {
	//console.log(this.split(org).join(dest));
    return this.split(org).join(dest);
}

function reConvertXSS(str){

	if(str != undefined){
		str = str.trim();
	
		str = str.replaceAll("&amp;" , "&")
		str = str.replaceAll("&#60;" , "<");
		str = str.replaceAll("&#62;" , ">");
		str = str.replaceAll("&#39;" , "'");
		str = str.replaceAll("&#34;" ,  "\"");
		str = str.replaceAll("&#45;&#45;" , "--");
		str = str.replaceAll("&#46;&#46;" , "..");
		str = str.replaceAll("&#40;" , "(");
		str = str.replaceAll("&#41;" , ")");
		str = str.replaceAll("&#123;" , "{");
		str = str.replaceAll("&#125;" , "}");
		str = str.replaceAll("&lsquo;" , "‘");
		str = str.replaceAll("&rsquo;" , "’");
		return str;
	}else{
		str =  "";
		return str;
	}
}