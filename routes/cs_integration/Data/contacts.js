var utils = require('../../common/utils');
var moment = require('moment');
var express = require('express');
var request = require('request');
var router = express.Router();
var fs = require("mz/fs");
/* Contacts */

//BANT 조건 Eloqua 조회 함수
async function get_INTEGRATION_DB_Data(page_index) {

	var contacts_data;
	var queryString = {}

	var yesterday_Object = utils.yesterday_getDateTime();
	//start_date ? yesterday_Object.start = start_date : null;
	//end_date ? yesterday_Object.end = end_date : null;

	// yesterday_Object.start = "2021-03-05";

	//var yesterday_Object = utils.today_getDateTime();
	// var queryText = "C_DateModified>" + "'" + yesterday_Object.start + " 10:00:00'" + "C_DateModified<" + "'" + yesterday_Object.end + " 11:00:59'";
	//yesterday_getUnixTime
	// console.log("queryText : " + queryText);
	// queryString['search'] = queryText;
	queryString['depth'] = "complete";
	queryString['pageSize'] = 1000;
	queryString['page'] = page_index;
	
	await csintergration_eloqua.data.contacts.get(queryString).then((result) => {
		// console.log(result.data);
		// console.log("true");

		if (result.data.total && result.data.total > 0) {
			contacts_data = result.data;
			//console.log(contacts_data);
		}else{
			console.log("not search data");
		}
	}).catch((err) => {
		console.error(err.message);
	});


	return contacts_data;
}

async function get_INTEGRATION_DB_ALL_Data() {

	var contacts_data;
	var queryString = {}

	var yesterday_Object = utils.yesterday_getDateTime();
	//start_date ? yesterday_Object.start = start_date : null;
	//end_date ? yesterday_Object.end = end_date : null;

	// yesterday_Object.start = "2021-03-05";

	//var yesterday_Object = utils.today_getDateTime();
	// var queryText = "C_DateModified>" + "'" + yesterday_Object.start + " 10:00:00'" + "C_DateModified<" + "'" + yesterday_Object.end + " 11:00:59'";
	//yesterday_getUnixTime
	// console.log("queryText : " + queryText);
	// queryString['search'] = queryText;
	let next = true;
	let page_index = 1;
	var total_data = [];
	while (next) {
		queryString['depth'] = "complete";
		queryString['page'] = page_index;

		await csintergration_eloqua.data.contacts.get(queryString).then((result) => {
			//console.log(result.data);
			//console.log("true");

			if (result.data.elements && result.data.elements.length > 0) {
				contacts_data = result.data;
				total_data.push(result.data);
				//console.log(contacts_data);
				req_res_logs("testdata_" + page_index, contacts_data);
				page_index++;
			} else {
				next = false;
			}
		}).catch((err) => {
			console.error(err.message);
			next = false;
		});
		console.log("page_index : " + page_index + "  page_index % 5 : " + page_index % 5);
		if (page_index % 5 == 0) {
			req_res_logs("totaldata_" + page_index, total_data);
			total_data.length = 0;
		}

	}
	return contacts_data;
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

function INTEGRATION_DB_ENTITY() {
	this.INTERFACE_ID = "";               //PK	HQ , USSolar, USID
	this.PROSPECT_ID = "";                //apc14000350967, ilc14000349979 ( Eloqua Contact ID )
	this.FIRST_NAME = "";                 //이름 O
	this.LAST_NAME = "";                  //성 O
	this.EMAIL = "";                      //이메일 O
	this.ACCOUNT = "";                    //회사명 O
	this.LAST_ACTIVITY_AT = "";           //Date			( date type )  ( 참여 활동 날짜 Eloqua 확인 ) 
	this.CAMPAIGN = "";
	this.NOTES = "";                      //필드확인필요 ( ex ) therma V, accustorahe )
	this.SCORE = "";                      //숫자 MAT SCORE 계산 로직 (MAT 로직)
	this.GRADE = "";                      //A+, F, C+, C, C-, B- (MAT확인) 
	this.WEBSITE = "";                    //웹사이트
	this.JOB_TITLE = "";                  //타이틀 롤
	this.FUNCTION = "";
	this.COUNTRY = "";                    //국가 O
	this.ADDRESS_ONE = "";                //주소1 O
	this.ADDRESS_TWO = "";                //주소2 O
	this.CITY = "";                       //도시 O
	this.STATE = "";                      //주 O
	this.TERRITORY = "";                  //있음
	this.ZIP = "";                        //있음 O
	this.PHONE = "";                      //있음 O
	this.FAX = "";                        //있음 O
	this.SOURCE = "";                     //플랫폼 AND 액티비티 인지 확인필요  
	this.ANNUAL_REVENUE = "";
	this.EMPLOYEES = "";                  //매핑정보 존재 여부 확인필요
	this.INDUSTRY = "";
	this.DO_NOT_EMAIL = "";               //수신거부 이메일 - 국가별 사업부별 확인 필요
	this.DO_NOT_CALL = "";                //bool			수진거부 CALL -  국가별 사업부별 확인 필요 ex(true,false)
	this.YEARS_IN_BUSINESS = "";
	this.COMMENTS = "";                   //매핑정보 존재 여부 확인필요
	this.SALUTATION = "";                 //미스터 , 미스 등등
	this.OPTED_OUT = "";
	this.REFERRER = "";                   //유입경로 URL ( Eloqua Referrer ) 
	this.CREATED_DATE = "";               //고객정보 생성일자 ( Contacts 생성일자 )
	this.UPDATED_DATE = "";               //고객정보 수정일자 ( Contacts 수정일자 )
	this.ACCOUNT_TYPE = "";
	this.ATTENDANCE_RESPONSE = "";
	this.B2BNEWSLETTER = "";              //ex) yes, no, option03, y, 890 gramos
	this.B2BNEWSLETTER_BU = "";
	this.B2BNEWSLTTER_TEAM = "";
	this.BIC_VISIT = "";                  //description : eu_prospect    ex) yes, no
	this.BUDGET = "";                     //
	this.BUSINESS_UNIT_1 = "";            //lg division info                           ex) 110794
	this.BUSINESS_UNIT_2 = "";            //description : transfer out side    ex) yes, no
	this.COMPANY_TYPE = "";               //
	this.DB_ACQUISITION_DATE = "";        //
	this.EMAIL_SUBSCRIPTION = "";         //
	this.EMAIL_SUBSCRIPTION_DATE = "";
	this.ES_ID_TRANSPORTATION = "";       //date			description : transfer out side date    ex) 2019-02-15
	this.INDUSTRIES = "";
	this.INQUIRY_TYPE = "";
	this.LANGUAGE = "";
	this.MESSAGE = "";
	this.MOBILE = "";                     //ex) E*************************************   20%   
	this.PP_MODIFY_REASON = "";           //개인정보 정책
	this.PP_MODIFY_TYPE = "";             //ex) yes, es_bbdd juanma
	this.PP_SUBSCRIPTION = "";
	this.PP_SUBSCRIPTION_DATE = "";
	this.PRODUCT_SOLUTION = "";
	this.PRODUCTS = "";
	this.PROSPECT_SOURCE = "";
	this.REGION = "";
	this.SALESPERSON_EMAIL = "";          //영업사원이메일 1%
	this.SALESPERSON_NAME = "";           //영업사원이름 1%
	this.STORYSET_DOWNLOAD = "";          //ex) treinamento comercial , treinamento tecnico
	this.STORYSET_EDUCATION = "";         //x
	this.STORYSET_FEEDBACK_EXPERIENCE = ""; //ex) nao, espacos publicos
	this.STORYSET_FEEDBACK_SUGGESTION = ""; //ex) mas tiempo, es correcto
	this.SUBSCRIPTION = "";
	this.SUBSIDIARY = "";
	this.TIMELINE = "";
	this.UK_AS_TSHIRTS_SIZE = "";         //x
	this.HQ_B2BMKT_SCORING_CATEGORY = ""; //x
	this.APPLIED_FLAG = "";               //x 큐리온 적용 여부
	this.APPLIED_DATE = "";               //x 큐리온
	this.TRANSFER_FLAG = "";              //Default N
	this.TRANSFERRED_DATE = "";           //Null
	this.BACK_TRANSFER_FLAG = "";         //Null
	this.BACK_TRANSFERRED_DATE = "";		  //Null
	this.SALESFORCE_ID = "";              //?	 ex) 00Q0I00012QbogUAC
}

function INTEGRATION_DB_ENTITY_V2() {
	this.INTERFACE_ID = "";                     //VARCHAR2(20)
	this.PROSPECT_ID = 0;                       //NUMBER
	this.FIRST_NAME = "";                       //VARCHAR2(40)
	this.LAST_NAME = "";                        //VARCHAR2(80)
	this.EMAIL = "";                            //VARCHAR2(240)
	this.ACCOUNT = "";                          //VARCHAR2(770)
	this.LAST_ACTIVITY_AT = "";                 //DATE
	this.CAMPAIGN = "";                         //VARCHAR2(255)
	this.NOTES = "";                            //VARCHAR2(2000)
	this.SCORE = "";                            //NUMBER
	this.GRADE = "";                            //VARCHAR2(10)
	this.WEBSITE = "";                          //VARCHAR2(255)
	this.JOB_TITLE = "";                        //VARCHAR2(128)
	this.FUNCTION = "";                         //VARCHAR2(255)
	this.COUNTRY = "";                          //VARCHAR2(240)
	this.ADDRESS_ONE = "";                      //VARCHAR2(770)
	this.ADDRESS_TWO = "";                      //VARCHAR2(255)
	this.CITY = "";                             //VARCHAR2(120)
	this.STATE = "";                            //VARCHAR2(240)
	this.TERRITORY = "";                        //VARCHAR2(255)
	this.ZIP = "";                              //VARCHAR2(60)
	this.PHONE = "";                            //VARCHAR2(120)
	this.FAX = "";                              //VARCHAR2(120)
	this.SOURCE = "";                           //VARCHAR2(120)
	this.ANNUAL_REVENUE = "";                   //VARCHAR2(18)
	this.EMPLOYEES = "";                        //VARCHAR2(8)
	this.INDUSTRY = "";                         //VARCHAR2(255)
	this.DO_NOT_EMAIL = "";                     //VARCHAR2(10)
	this.DO_NOT_CALL = "";                      //VARCHAR2(10)
	this.YEARS_IN_BUSINESS = "";                //VARCHAR2(255)
	this.COMMENTS = "";                         //VARCHAR2(2000)
	this.SALUTATION = "";                       //VARCHAR2(255)
	this.OPTED_OUT = "";                        //VARCHAR2(10)
	this.REFERRER = "";                         //VARCHAR2(2000)
	this.CREATED_DATE = "";                     //DATE
	this.UPDATED_DATE = "";                     //DATE
	this.USERS = "";                            //VARCHAR2(255)
	this.FIRST_ASSIGNED = "";                   //DATE
	this.CRM_CONTACT_FID = "";                  //VARCHAR2(255)
	this.CRM_LEAD_FID = "";                     //VARCHAR2(255)
	this.LISTS = "";                            //VARCHAR2(255)
	this.ACCOUNT_TYPE = "";                     //VARCHAR2(255)
	this.ATTENDANCE_RESPONSE = "";              //VARCHAR2(255)
	this.B2BNEWSLETTER = "";                    //VARCHAR2(255)
	this.B2BNEWSLETTER_BU = "";                 //VARCHAR2(255)
	this.B2BNEWSLTTER_TEAM = "";                //VARCHAR2(255)
	this.BIC_VISIT = "";                        //VARCHAR2(255)
	this.BUDGET = "";                           //VARCHAR2(255)
	this.BUSINESS_UNIT_1 = "";                  //VARCHAR2(255)
	this.BUSINESS_UNIT_2 = "";                  //VARCHAR2(255)
	this.COMPANY_TYPE = "";                     //VARCHAR2(255)
	this.DB_ACQUISITION_DATE = "";              //VARCHAR2(255)
	this.EMAIL_SUBSCRIPTION = "";               //VARCHAR2(255)
	this.EMAIL_SUBSCRIPTION_DATE = "";          //VARCHAR2(255)
	this.ES_ID_TRANSPORTATION = "";             //VARCHAR2(255)
	this.INDUSTRIES = "";                       //VARCHAR2(255)
	this.INQUIRY_TYPE = "";                     //VARCHAR2(255)
	this.LANGUAGE = "";                         //VARCHAR2(255)
	this.MESSAGE = "";                          //VARCHAR2(2000)
	this.MOBILE = "";                           //VARCHAR2(255)
	this.PP_MODIFY_REASON = "";                 //VARCHAR2(255)
	this.PP_MODIFY_TYPE = "";                   //VARCHAR2(255)
	this.PP_SUBSCRIPTION = "";                  //VARCHAR2(255)
	this.PP_SUBSCRIPTION_DATE = "";             //VARCHAR2(255)
	this.PRODUCT_SOLUTION = "";                 //VARCHAR2(300)
	this.PRODUCTS = "";                         //VARCHAR2(255)
	this.PROSPECT_SOURCE = "";                  //VARCHAR2(255)
	this.REGION = "";                           //VARCHAR2(255)
	this.SALESPERSON_EMAIL = "";                //VARCHAR2(255)
	this.SALESPERSON_NAME = "";                 //VARCHAR2(255)
	this.STORYSET_DOWNLOAD = "";                //VARCHAR2(255)
	this.STORYSET_EDUCATION = "";               //VARCHAR2(255)
	this.STORYSET_FEEDBACK_EXPERIENCE = "";     //VARCHAR2(2000)
	this.STORYSET_FEEDBACK_SUGGESTION = "";     //VARCHAR2(2000)
	this.SUBSCRIPTION = "";                     //VARCHAR2(255)
	this.SUBSIDIARY = "";                       //VARCHAR2(255)
	this.TIMELINE = "";                         //VARCHAR2(255)
	this.UK_AS_TSHIRTS_SIZE = "";               //VARCHAR2(255)
	this.HQ_B2BMKT_SCORING_CATEGORY = "";       //VARCHAR2(300)
	this.APPLIED_FLAG = "";                     //VARCHAR2(10)
	this.APPLIED_DATE = "";                     //DATE
	this.TRANSFER_FLAG = "";                    //VARCHAR2(10)
	this.TRANSFERRED_DATE = "";                 //DATE
	this.BACK_TRANSFER_FLAG = "";               //VARCHAR2(10)
	this.BACK_TRANSFERRED_DATE = "";            //DATE
	this.SALESFORCE_ID = "";                    //VARCHAR2(18)
	this.B2B_INT_ACCOUNT_CODE = "";             //VARCHAR2(255)
	this.B2B_CONTACT_PERSON_CODE = "";          //VARCHAR2(255)
	this.APPLIED_MSG = "";                      //VARCHAR2(2000)
}

var seq_cnt = 0;
//Eloqua Data B2B GERP Global Mapping 데이터 생성
function CONVERT_INTEGRATION_DB_DATA_V1(contacts_data, business_department) {
	var result_data = [];

	for (var i = 0; i < contacts_data.elements.length; i++) {
		try {
			var result_item = new INTEGRATION_DB_ENTITY();
			var item = contacts_data.elements[i];
			var FieldValues_data = contacts_data.elements[i].fieldValues;

			//result_item.INTERFACE_ID = "ELOQUA_0005";               //PK	HQ , USSolar, USID
			result_item.INTERFACE_ID = moment().format('YYYYMMDD') + lpad(seq_cnt, 6, "6");
			seq_cnt = seq_cnt + 1;

			result_item.PROSPECT_ID = GetCustomFiledValue(FieldValues_data, 100032);          //apc14000350967, ilc14000349979 ( Eloqua Contact ID )
			result_item.FIRST_NAME = GetDataValue(item.firstName);  //firstName 이름
			result_item.LAST_NAME = GetDataValue(item.lastName);    //lastName 성
			result_item.EMAIL = GetDataValue(item.emailAddress);    //emailAddress 이메일
			result_item.ACCOUNT = GetDataValue(item.accountName);   //accountName 회사명
			result_item.LAST_ACTIVITY_AT = "";           //Date			( date type )  ( 참여 활동 날짜 Eloqua 확인 ) 
			result_item.CAMPAIGN = "";      //result_item.ATTRIBUTE_15 = GetCustomFiledValue(FieldValues_data, 100203); //Marketing Eventdf //100203	Marketing Event
			result_item.NOTES = "";                      //필드확인필요 ( ex ) therma V, accustorahe )
			result_item.SCORE = GetCustomFiledValue(FieldValues_data, 100250);  //100250	Source //숫자 MAT SCORE 계산 로직 (MAT 로직)
			result_item.GRADE = "";                      //필드확인필요 A+, F, C+, C, C-, B- (MAT확인) 
			result_item.WEBSITE = GetCustomFiledValue(FieldValues_data, 100252);                   //100252	Website 웹사이트
			result_item.JOB_TITLE = GetCustomFiledValue(FieldValues_data, 100292);                  //100292	Job Title
			result_item.FUNCTION = GetBusiness_Department_data(FieldValues_data, business_department, "Job Function");
			result_item.COUNTRY = GetDataValue(item.country);                 //country
			result_item.ADDRESS_ONE = GetDataValue(item.address1);            //address1
			result_item.ADDRESS_TWO = GetDataValue(item.address2);            //address2
			result_item.CITY = GetDataValue(item.city);                       //city
			result_item.STATE = GetDataValue(item.province);  // GetCustomFiledValue(FieldValues_data, 100307); //100307 State(Pardot) // 100010	State or Province api name : province
			result_item.TERRITORY = GetCustomFiledValue(FieldValues_data, 100187);  //100187 territory
			result_item.ZIP = GetDataValue(item.postalCode);                        //postalCode
			result_item.PHONE = GetDataValue(item.mobilePhone);                     //mobilePhone
			result_item.FAX = GetDataValue(item.fax);                         //fax
			result_item.SOURCE = GetCustomFiledValue(FieldValues_data, 100250);  //플랫폼 AND 액티비티 인지 확인필요  // 100250	Source
			result_item.ANNUAL_REVENUE = GetCustomFiledValue(FieldValues_data, 100047);  //100047	Annual Revenue
			result_item.EMPLOYEES = GetCustomFiledValue(FieldValues_data, 100184);                  //100184	Employees
			result_item.INDUSTRY = GetCustomFiledValue(FieldValues_data, 100046);    //100046	Industry         
			result_item.DO_NOT_EMAIL = GetCustomFiledValue(FieldValues_data, 100239);  //수신거부 이메일 - 국가별 사업부별 확인 필요 //100239	Do Not Email
			result_item.DO_NOT_CALL = "";                //매핑정보 존재 여부 확인필요
			result_item.YEARS_IN_BUSINESS = GetCustomFiledValue(FieldValues_data, 100253);          //100253	Years In Business
			result_item.COMMENTS = "";                   //매핑정보 존재 여부 확인필요
			result_item.SALUTATION = GetCustomFiledValue(FieldValues_data, 100017);                 //100017	Salutation
			result_item.OPTED_OUT = GetCustomFiledValue(FieldValues_data, 100246);       //100246	Opted Out       
			result_item.REFERRER = "";                   //매핑정보 존재 여부 확인필요 유입경로 URL ( Eloqua Referrer ) 
			result_item.CREATED_DATE = utils.timeConverter("GET_DATE", item.createdAt); //고객정보 생성일자 ( Contacts 생성일자 )
			result_item.UPDATED_DATE = utils.timeConverter("GET_DATE", item.updatedAt); //고객정보 수정일자 ( Contacts 수정일자 )
			result_item.ACCOUNT_TYPE = "";               //매핑정보 존재 여부 확인필요
			result_item.ATTENDANCE_RESPONSE = GetCustomFiledValue(FieldValues_data, 100230);        //100230	Attendance
			result_item.B2BNEWSLETTER = "";              //매핑정보 존재 여부 확인필요 ex) yes, no, option03, y, 890 gramos
			result_item.B2BNEWSLETTER_BU = "";           //매핑정보 존재 여부 확인필요
			result_item.B2BNEWSLTTER_TEAM = "";          //매핑정보 존재 여부 확인필요
			result_item.BIC_VISIT = "";                  //매핑정보 존재 여부 확인필요 description : eu_prospect    ex) yes, no
			result_item.BUDGET = GetBusiness_Department_data(FieldValues_data, business_department, "Budget");
			result_item.BUSINESS_UNIT_1 = "";            //매핑정보 확인필요 lg division info                           ex) 110794
			result_item.BUSINESS_UNIT_2 = "";            //매핑정보 확인필요 description : transfer out side    ex) yes, no
			result_item.COMPANY_TYPE = GetCustomFiledValue(FieldValues_data, 100234);               //100234	Company Type
			result_item.DB_ACQUISITION_DATE = GetCustomFiledValue(FieldValues_data, 100237);        //100237	DB Acquisition Date
			result_item.EMAIL_SUBSCRIPTION = "";         //매핑정보 확인필요
			result_item.EMAIL_SUBSCRIPTION_DATE = "";    //매핑정보 확인필요
			result_item.ES_ID_TRANSPORTATION = "";       //date			description : transfer out side date    ex) 2019-02-15
			result_item.INDUSTRIES = "";                  //매핑정보 확인필요
			result_item.INQUIRY_TYPE = "";                //매핑정보 확인필요
			result_item.LANGUAGE = GetCustomFiledValue(FieldValues_data, 100243);  //100243	Language
			result_item.MESSAGE = "";
			result_item.MOBILE = GetDataValue(item.mobilePhone); //mobilePhone                     //ex) E*************************************   20%   
			result_item.PP_MODIFY_REASON = "";           //개인정보 정책
			result_item.PP_MODIFY_TYPE = "";             //ex) yes, es_bbdd juanma
			result_item.PP_SUBSCRIPTION = "";
			result_item.PP_SUBSCRIPTION_DATE = "";
			result_item.PRODUCT_SOLUTION = "";
			result_item.PRODUCTS = "";
			result_item.PROSPECT_SOURCE = "";
			result_item.REGION = GetCustomFiledValue(FieldValues_data, 100069); //100069	Region
			result_item.SALESPERSON_EMAIL = "";          //영업사원이메일 1%
			result_item.SALESPERSON_NAME = "";           //영업사원이름 1%
			result_item.STORYSET_DOWNLOAD = "";          //ex) treinamento comercial , treinamento tecnico
			result_item.STORYSET_EDUCATION = "";         //x
			result_item.STORYSET_FEEDBACK_EXPERIENCE = ""; //ex) nao, espacos publicos
			result_item.STORYSET_FEEDBACK_SUGGESTION = ""; //ex) mas tiempo, es correcto
			result_item.SUBSCRIPTION = "";
			result_item.SUBSIDIARY = GetCustomFiledValue(FieldValues_data, 100196); //100196	Subsidiary
			result_item.TIMELINE = GetBusiness_Department_data(FieldValues_data, business_department, "TimeLine");
			result_item.UK_AS_TSHIRTS_SIZE = "";         //x
			result_item.HQ_B2BMKT_SCORING_CATEGORY = ""; //x
			result_item.APPLIED_FLAG = "";               //x 큐리온 적용 여부
			result_item.APPLIED_DATE = "";               //x 큐리온
			result_item.TRANSFER_FLAG = "N";             //Default N
			result_item.TRANSFERRED_DATE = ""; moment().format('YYYY-MM-DD hh:mm:ss');    //어떤 날짜 정보인지 확인 필요
			result_item.BACK_TRANSFER_FLAG = "";         //Null
			result_item.BACK_TRANSFERRED_DATE = "";		   //Null
			result_item.SALESFORCE_ID = "";              //?	 ex) 00Q0I00012QbogUAC
			result_data.push(result_item);
		}
		catch (e) {
			console.log(e);
		}
	}

	return result_data;
}

router.get('/', async function (req, res, next) {

	// 전체 데이터를 조회하기 위해서 (Eloqua Select 는 한번에 최대 천건만 가능 ) index 를 늘려가며 계속 호출함
	let page_index = 1;
	//BANT기준 B2B GERP GLOBAL CONTACTS 조회
	var contacts_data = await get_INTEGRATION_DB_Data(page_index);


	if (contacts_data != null) {
		// 다음 페이지를 조회 하기 위해 index 증가
		req_res_logs("testdata_" + page_index, contacts_data);
		

		//Eloqua Contacts 조회
		var request_data = CONVERT_INTEGRATION_DB_DATA_V2(contacts_data);

		//res.json({ContentList:request_data});;
		// req_res_logs("testdata_" + page_index, request_data);
		page_index++;

		var send_url = "https://dev-apigw-ext.lge.com:7221/gateway/customer/api2api/eloqua/eloquaPardot.lge";

		var headers = {
			'Content-Type': "application/json",
			'x-Gateway-APIKey': "da7d5553-5722-4358-91cd-9d89859bc4a0"
		}

		options = {
			url: send_url,
			method: "POST",
			headers: headers,
			//body : { ContentList: request_data } ,
			body: { elements: request_data },
			json: true
		};

		req_res_logs("testdata__req_" + page_index, request_data);

		var result = await request(options, async function (error, response, body) {

			// console.log(11);
			// console.log(response);
			if (error) {
				console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
				console.log(error);
			}
			if (!error && response.statusCode == 200) {
				result = body;
				// console.log(11);
				console.log(body);

				res.json(body);

				req_res_logs("testdata__res_" + page_index, request_data);
				
			}
		});

	}
	else {
		res.json(false);
	}
	//API Gateway 데이터 전송

	//Log
	//res.json(true);

});

router.get('/req_data', function (req, res, next) {
	var id = 941;
	csintergration_eloqua_config.data.contacts.getOne(id).then((result) => {
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



//Eloqua Data B2B GERP CS INTERGRATION Mapping 데이터 생성
function CONVERT_INTEGRATION_DB_DATA_V2(contacts_data) {
	var result_data = [];

	for (var i = 0; i < contacts_data.elements.length; i++) {
		try {
			var result_item = new INTEGRATION_DB_ENTITY_V2();
			var item = contacts_data.elements[i];
			var FieldValues_data = contacts_data.elements[i].fieldValues;

			result_item.INTERFACE_ID = moment().format('YYYYMMDD') + lpad(seq_cnt, 6, "0");
			seq_cnt = seq_cnt + 1;

			result_item.PROSPECT_ID = GetCustomFiledValue(FieldValues_data, item.id);       //apc14000350967, ilc14000349979 ( Eloqua Contact ID )
			result_item.FIRST_NAME = GetDataValue(item.firstName);  //firstName 이름
			result_item.LAST_NAME = GetDataValue(item.lastName);    //lastName 성
			result_item.EMAIL = GetDataValue(item.emailAddress);    //emailAddress 이메일
			result_item.ACCOUNT = GetDataValue(item.accountName);   //accountName 회사명
			result_item.LAST_ACTIVITY_AT = "";                      //Date			( date type )  ( 참여 활동 날짜 Eloqua 확인 ) 
			result_item.CAMPAIGN = "";                              //result_item.ATTRIBUTE_15 = GetCustomFiledValue(FieldValues_data, 100203); //Marketing Eventdf //100203	Marketing Event
			result_item.NOTES = "";                                 //필드확인필요 ( ex ) therma V, accustorahe )
			result_item.SCORE = "";                                 //100250	Source //숫자 MAT SCORE 계산 로직 (MAT 로직)
			result_item.GRADE = "";                                 //필드확인필요 A+, F, C+, C, C-, B- (MAT확인) 
			result_item.WEBSITE = GetCustomFiledValue(FieldValues_data, 100252);    //100252	Website 웹사이트
			result_item.JOB_TITLE = GetCustomFiledValue(FieldValues_data, 100292);  //100292	Job Title
			result_item.FUNCTION = "";
			result_item.COUNTRY = GetDataValue(item.country);         //country
			result_item.ADDRESS_ONE = GetDataValue(item.address1);    //address1
			result_item.ADDRESS_TWO = GetDataValue(item.address2);    //address2
			result_item.CITY = GetDataValue(item.city);               //city
			result_item.STATE = GetDataValue(item.province);          //GetCustomFiledValue(FieldValues_data, 100307); //100307 State(Pardot) // 100010	State or Province api name : province
			result_item.TERRITORY = "";                               //GetCustomFiledValue(FieldValues_data, 100187);  //100187 territory
			result_item.ZIP = GetDataValue(item.postalCode);          //postalCode
			result_item.PHONE = GetDataValue(item.mobilePhone);       //mobilePhone
			result_item.FAX = GetDataValue(item.fax);                 //fax
			result_item.SOURCE = "";                                  //GetCustomFiledValue(FieldValues_data, 100250);  //플랫폼 AND 액티비티 인지 확인필요  // 100250	Source
			result_item.ANNUAL_REVENUE = "";                          //GetCustomFiledValue(FieldValues_data, 100047);  //100047	Annual Revenue
			result_item.EMPLOYEES = "";                               //GetCustomFiledValue(FieldValues_data, 100184);   //100184	Employees
			result_item.INDUSTRY = "";                                //GetCustomFiledValue(FieldValues_data, 100046);    //100046	Industry         
			result_item.DO_NOT_EMAIL = "";
			result_item.DO_NOT_CALL = "";
			result_item.YEARS_IN_BUSINESS = "";                        //GetCustomFiledValue(FieldValues_data, 100253);          //100253	Years In Business
			result_item.COMMENTS = "";                                //매핑정보 존재 여부 확인필요
			result_item.SALUTATION = "";                              //GetCustomFiledValue(FieldValues_data, 100017);                 //100017	Salutation
			result_item.OPTED_OUT = "";                               //GetCustomFiledValue(FieldValues_data, 100246);       //100246	Opted Out       
			result_item.REFERRER = "";                                //매핑정보 존재 여부 확인필요 유입경로 URL ( Eloqua Referrer ) 
			result_item.CREATED_DATE = utils.timeConverter("GET_DATE", item.createdAt); //고객정보 생성일자 ( Contacts 생성일자 )
			result_item.UPDATED_DATE = utils.timeConverter("GET_DATE", item.updatedAt); //고객정보 수정일자 ( Contacts 수정일자 )

			result_item.APPLIED_FLAG = "";               //x 큐리온 적용 여부
			result_item.APPLIED_DATE = "";               //x 큐리온

			result_item.TRANSFER_FLAG = "N";             //Default N
			result_item.TRANSFERRED_DATE = moment().format('YYYY/MM/DD HH:mm:ss');    //어떤 날짜 정보인지 확인 필요

			result_item.BACK_TRANSFER_FLAG = "";         //Null
			result_item.BACK_TRANSFERRED_DATE = "";		   //Null
			result_item.SALESFORCE_ID = "";              //?	 ex) 00Q0I00012QbogUAC

			result_data.push(result_item);
		}
		catch (e) {
			console.log(e);
		}
	}

	return result_data;
}

//2021-04-13 조회 테스트
router.get('/test', async function (req, res, next) {

	
	// 전체 데이터를 조회하기 위해서 (Eloqua Select 는 한번에 최대 천건만 가능 ) index 를 늘려가며 계속 호출함
	let page_index = 1;
	let nextSearch = true;


	// 고객통합 DB 데이터
	while (nextSearch) {
		
		console.log("page_index : " + page_index + "  nextSearch : " + nextSearch);
		let contacts_data = await get_INTEGRATION_DB_Data(page_index);

		// Eloqua 의 page indexing 은 1부터 시작하네 contacts_data 는 javascript 의 array 이기 때문에 0부터 시작한다.

		if (contacts_data != null && contacts_data.elements && contacts_data.elements.length > 0) {

			// 다음 페이지를 조회 하기 위해 index 증가
			

			let request_data = await CONVERT_INTEGRATION_DB_DATA_V2(contacts_data);
			req_res_logs("cs_elq_data_" + page_index, contacts_data);
			req_res_logs("cs_req_data_" + page_index, request_data);
			// res.json(request_data);
			// nextSearch = false;

			
			
		
			/*======================================================================================================== */
			var send_url = "https://dev-apigw-ext.lge.com:7221/gateway/customer/api2api/eloqua/eloquaPardot.lge";

			var headers = {
				'Content-Type': "application/json",
				'x-Gateway-APIKey': "da7d5553-5722-4358-91cd-9d89859bc4a0"
			}

			options = {
				url: send_url,
				method: "POST",
				headers: headers,
				//body : { ContentList: request_data } ,
				body: { elements: request_data },
				json: true
			};

			

			var result = await request(options, async function (error, response, body) {

				// console.log(11);
				console.log(response.statusCode);
				if (error) {
					console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
					console.log(error);
					await req_res_logs("cs_err_edata_" + page_index, { errorCode : response.statusCode});
					// page_index++;
				}

				if(response.statusCode != 200){
					
					await req_res_logs("cs_err_edata_" + page_index, { errorCode : response.statusCode});
					// page_index++;
				}
				if (!error && response.statusCode == 200) {
					result = body;
					// console.log(11);
					console.log("result page_index : " + page_index + "  nextSearch : " + nextSearch);
					// res.json(body);
					await req_res_logs("cs_res_edata_" + page_index, body);
					// page_index++;
				}
			});
			await sleep(3000);
			page_index ++;
		} else {
			nextSearch = false;
			res.json(false);
		}
	}

});

function req_res_logs(filename, data) {
	// filename : request , response 
	// business_name : 사업부별 name
	// data : log 저장할 데이터

	var today = moment().format("YYYY-MM-DD");
	var dirPath = utils.logs_makeDirectory(today + "_" + "cs_integration");
	console.log("fileWrite Path : " + dirPath);

	fs.writeFile(dirPath + filename + ".txt", JSON.stringify(data), 'utf8', function (error) {
		if (error) {
			console.log(err);
		} else {
			console.log('write end');
		}
	});
}

const sleep = (ms) => {
	return new Promise(resolve=>{
		setTimeout(resolve,ms)
	})
}

module.exports = router;
