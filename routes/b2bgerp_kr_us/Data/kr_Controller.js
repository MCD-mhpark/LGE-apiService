var Model = require('./kr_Model');


//이메일 확인 함수
exports.validateEmail = function (email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

//연락처 조회 함수
exports.GetContactData = async function (_email) {
	var queryString = {};
	var return_data = undefined;
	//queryString['search'] = _email;
	if (_email) {
		queryString.search = "emailAddress='" + _email+"'";
		queryString.depth = "complete"; //minimal, partial, complete
		await lge_eloqua.data.contacts.get(queryString).then((result) => {
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

//CustomObjectData 전송 함수
exports.SendCreateCustomObjectData = async function (parent_id , _customObjectCreateData) {
	var return_data = undefined;

	console.log("SendCreateCustomObjectData");
	console.log(_customObjectCreateData);
	//LGE KR 사용자정의 객체 / LGEKR(한영본)_대표사이트B2B_온라인문의 id : 39
	await lge_eloqua.data.customObjects.data.create(parent_id, _customObjectCreateData).then((result) => {
		// console.log(result);
		return_data = result;
	}).catch((err) => {
		// console.error(err);
		console.log(err.stack);
		return_data = err.message;
	});
	return return_data;
}



//=====================================================================================================================
// 한국영업본부 B2B GERP KR Service
//=====================================================================================================================

exports.getTransfer_UpdateData = async function (TRANS_KR_LIST , type){

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

exports.sendTransfer_Update = async function (parentId , KR_DATA_LIST){

	for(let item of KR_DATA_LIST){
		await lge_eloqua.data.customObjects.data.update(parentId , item.id, item).then((result) => {
			// console.log(result);
			return_data = result;
		}).catch((err) => {
			// console.error(err);
			console.error(err.message);
			return_data = err;
		});
	}
}

//=====================================================================================================================
// 한국영업본부 CO.KR 견적문의 Service
//=====================================================================================================================

//co.kr 온라인 견적문의 연락처 추가 
exports.insertContactData = async function (_req_data) {
	
    let contact_data = Model.i_ConvertB2BKRContact(_req_data);

	await lge_eloqua.data.contacts.create(contact_data).then((result) => {
		// console.log(result);
		return_data = result;
	}).catch((err) => {
		console.error(err);
		console.error(err.message);
		return_data = err;
	});
	return return_data;
}

//co.kr 온라인 견적문의 연락처 업데이트
exports.updateContactData = async function (_contact, _req_data) {
	
    let contact = Model.u_ConvertB2BKRContact(_contact, _req_data);

	await lge_eloqua.data.contacts.update(contact.id, contact).then((result) => {
		// console.log(result);
		return_data = result;
	}).catch((err) => {
		// console.error(err);
		console.error(err.message);
		return_data = err;
	});
	return return_data;
}



//=====================================================================================================================
// KR NewsLetter Service
//=====================================================================================================================

//NewsLetter Insert Contact
exports.insertContactData_newsLetter = async function (_req_data) {
	
    let contact_data = Model.i_ConvertNewsLetterKRContact(_req_data);

	await lge_eloqua.data.contacts.create(contact_data).then((result) => {
		// console.log(result);
		return_data = result;
	}).catch((err) => {
		console.error(err);
		console.error(err.message);
		return_data = err;
	});
	return return_data;
}

//NewsLetter Update Contact
exports.updateContactData_newsLetter = async function (_contact, _req_data) {
	
    let contact = Model.u_ConvertNewsLetterKRContact(_contact, _req_data);

	await lge_eloqua.data.contacts.update(contact.id, contact).then((result) => {
		// console.log(result);
		return_data = result;
	}).catch((err) => {
		// console.error(err);
		console.error(err.message);
		return_data = err;
	});
	return return_data;
}
