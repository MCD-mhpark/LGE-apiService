var moment = require('moment-timezone');
var utils = require('../../common/utils');
var express = require('express');
var request = require('request');
var router = express.Router();
var fs = require("mz/fs");
let lodash = require("lodash");
const { reset } = require('nodemon');
const e = require('express');

//=====================================================================================================================================================================================================
// Last Update Date : 2021-02-10
// IAM 테이블 연동 관련 API Endpoint 정의
// IAM USER TABLE
// IAM USER REPONSIBILITY
// IAM RESPONSIBILITY

var testemail = "emailAddress='jong.park@lge.com'emailAddress='damien.leite@lge.com'emailAddress='zen.wong@lge.com'emailAddress='danai.ar@lge.com'emailAddress='Woeiliang.Chong@lge.com'";
// var testemail = "emailAddress='iam3.test@lge.com'";
// 2022-08-23
// # API Gateway 인증 #  -- ELOQUA 시스템에서 API Gateway 호출 시 필요한 인증
// x-Gateway-APIKey: da7d5553-5722-4358-91cd-9d89859bc4a0
//=====================================================================================================================================================================================================

//#region IAM ENTITY 정의 함수 영역

function IAM_IF_USER_ENTITY(){ 
    this.SYSTEMCODE = "ELOQUA";		//	시스템코드 : 고정값
    this.USERCODE = "";				//	사용자코드 : 사번
    this.AFFILIATECODE = "XXXX";	//	관계사코드 : XXXX (고정값)
    this.CORPORATIONCODE = null;		//	법인코드
    this.SSOUSERID = "";			//	SSO사용자아이디
    this.USERNAME = "";				//	사용자명
    this.MAILADDR = "";				//	메일주소
    this.EMPLOYEENO = "";			//	사원번호
    this.KOREMPLOYEENO = "";		//	한국사원번호
    this.EMPLOYEEENGNAME = null;		//	사원영문명
    this.ADMINISTRATORFLAG = null;	//	어드민여부
    this.DIVISIONCODE = null;			//	사업부코드
    this.ORGANIZATIONID = null;		//	조직아이디
    this.DEPARTMENTCODE = "";		//	부서코드
    this.DEPARTMENTNAME = "";		//	부서명
    this.JOBNAME = null;				//	직무명
    this.POSITIONNAME = null;			//	직책명
    this.SODEXCEPTIONFLAG = null;		//	SOD제외여부
    this.SODEXCEPTIONREASONDESC = null;		//	SOD배제예외사유설명
    this.EFFECTIVESTARTYYYYMMDD = null;		//	유효시작일자
    this.EFFECTIVEENDYYYYMMDD = null;		//	유효종료일자
    this.REMARKS = null;				//	적요
    this.USEFLAG = "";				//	사용여부 : Y / N -> 사용안하면 N
    this.GERPUSERNAME = null;			//	GERP사용자명
    this.LASTLOGONDATE = null;		//	유관시스템 마지막접속일자
    this.ATTRIBUTE1 = null;			//	해당 사용자의 권한관계사 (USER_RESP_AFFILIATE_CODE) : PU-MDM, MDMS, PIMS
    this.ATTRIBUTE2 = null;			//	해당 사용자의 권한사업부 (USER_RESP_DIVISION_CODE) : PU-MDM, MDMS, PIMS
    this.ATTRIBUTE3 = null;			//	예비속성3
    this.ATTRIBUTE4 = null;			//	예비속성4
    this.ATTRIBUTE5 = null;			//	예비속성5
    this.ATTRIBUTE6 = null;			//	예비속성6
    this.ATTRIBUTE7 = null;			//	예비속성7
    this.ATTRIBUTE8 = null;			//	예비속성8
    this.ATTRIBUTE9 = null;			//	예비속성9
    this.ATTRIBUTE10 = null;			//	예비속성10
    this.ATTRIBUTE11 = null;			//	예비속성11
    this.ATTRIBUTE12 = null;			//	예비속성12
    this.ATTRIBUTE13 = null;			//	예비속성13
    this.ATTRIBUTE14 = null;			//	예비속성14
    this.ATTRIBUTE15 = null;			//	예비속성15
    this.CREATIONDATE = "";			//	생성일자
    this.CREATEDBYCODE = null;		//	생성자코드
    this.LASTUPDATEDATE = "";		//	최종수정일자
    this.LASTUPDATEDBYCODE = null;	//	최종수정자코드
    this.TRANSMISSIONID = 0;		//	송신ID : 임의 id값 (iam-유관과의 확인을 원활하게 할 정보)
    this.TRANSMISSIONCOUNT = 0;		//	송신건수 : 한번에  IF 되는 건수 총 합(row 당 동일 값)
    this.INTERFACETYPECODE = "";	//	인터페이스유형코드
    this.POSTINGSTATUSCODE = "";	//	전기상태코드
    this.POSTINGDATE = null;			//	전기일자
    this.POSTINGERRORDESC = null;		//	전기오류설명
    this.TRANSFERFLAG = "N";		//	전송여부
    this.TRANSFERDATE = "";			//	전송일자 : 전송시점 시간 호출 시간
    this.GLOBALUNIQUEID = null;		//	글로벌유일아이디
    this.BAMSEQUENCEID = null;		//	비즈니스활동모니터링일련순서아이디
    this.OLDGLOBALUNIQUEID = null;	//	변경전글로벌유일아이디
    this.ATTRIBUTE16 = null;			//	예비속성16
    this.ATTRIBUTE17 = null;			//	예비속성17
    this.ATTRIBUTE18 = null;			//	예비속성18
    this.ATTRIBUTE19 = null;			//	예비속성19
    this.ATTRIBUTE20 = null;			//	예비속성20
    this.ATTRIBUTE21 = null;			//	예비속성21
    this.ATTRIBUTE22 = null;			//	예비속성22
    this.ATTRIBUTE23 = null;			//	예비속성23
    this.ATTRIBUTE24 = null;			//	예비속성24
    this.ATTRIBUTE25 = null;			//	예비속성25
    this.APIGWTRANSFERFLAG = null;	//	API GW 전송 FLAG
    this.APIGWTRANSFERDATE = null;	//	API GW 전송 시간
    this.APIGWERRORMSG = null;		//	API GW 에레메세지
}

function IAM_IF_USER_RESPONSIBILITY_ENTITY(){
	this.SYSTEMCODE = "ELOQUA";		    //	시스템코드
	this.USERCODE = "";		            //	사용자코드
	this.USERAFFILIATECODE = null;		//	사용자관계사코드
	this.USERCORPORATIONCODE = null;		//	사용자법인코드
	this.RESPONSIBILITYCODE = "";		//	권한코드
	this.RESPONSIBILITYOPTIONCODE = "";	//	권한옵션코드
	this.INQUIRYAUTHORITYFLAG = null;		//	조회권한여부
	this.EFFECTIVESTARTYYYYMMDD = null;	//	유효시작일자
	this.EFFECTIVEENDYYYYMMDD = null;		//	유효종료일자
	this.USEFLAG = "Y";		            //	사용여부
	this.REMARKS = null;		            //	적요
	this.GERPUSERNAME = null;		        //	GERP사용자명
	this.APPLICATIONSHORTNAME = null;		//	애플리케이션약어
	this.ATTRIBUTE1 = null;		        //	Responsibility Affiliate (대상 : PU-SNS, PU-MDM, PU-SMS, PIMS)
	this.ATTRIBUTE2 = null;		        //	Responsibility Division (대상 : PU-SNS, PU-MDM, PU-SMS, PIMS)
	this.ATTRIBUTE3 = null;		        //	대표 Division 여부 (PU-SMS)-Y/N
	this.ATTRIBUTE4 = null;		        //	예비속성4
	this.ATTRIBUTE5 = null;		        //	예비속성5
	this.ATTRIBUTE6 = "";		        //	예비속성6
	this.ATTRIBUTE7 = "";		        //	예비속성7
	this.ATTRIBUTE8 = null;		        //	예비속성8
	this.ATTRIBUTE9 = null;               //	예비속성9
	this.ATTRIBUTE10 = null;		        //	예비속성10
	this.ATTRIBUTE11 = null;		        //	예비속성11
	this.ATTRIBUTE12 = null;		        //	예비속성12
	this.ATTRIBUTE13 = null;		        //	예비속성13
	this.ATTRIBUTE14 = null;		        //	예비속성14
	this.ATTRIBUTE15 = null;		        //	예비속성15
	this.CREATIONDATE = "";		        //	생성일자
	this.CREATEDBYCODE = null;		    //	생성자코드
	this.LASTUPDATEDATE = "";		    //	최종수정일자
	this.LASTUPDATEDBYCODE = null;		//	최종수정자코드
	this.TRANSMISSIONID = 0;		    //	송신ID
	this.TRANSMISSIONCOUNT = 0;		    //	송신건수
	this.INTERFACETYPECODE = "ELOQUA";		//	인터페이스유형코드
	this.POSTINGSTATUSCODE = "READY";		//	전기상태코드
	this.POSTINGDATE = null;		        //	전기일자
	this.POSTINGERRORDESC = null;		    //	전기오류설명
	this.TRANSFERFLAG = "N";		    //	전송여부
	this.TRANSFERDATE = "";		        //	전송일자 (호출시간)
	this.GLOBALUNIQUEID = null;		    //	글로벌유일아이디
	this.BAMSEQUENCEID = null;		    //	비즈니스활동모니터링일련순서아이디
	this.OLDGLOBALUNIQUEID = null;		//	변경전글로벌유일아이디
	this.ATTRIBUTE16 = null;		        //	예비속성16
	this.ATTRIBUTE17 = null;		        //	예비속성17
	this.ATTRIBUTE18 = null;		        //	예비속성18
	this.ATTRIBUTE19 = null;		        //	예비속성19
	this.ATTRIBUTE20 = null;		        //	예비속성20
	this.ATTRIBUTE21 = null;		        //	예비속성21
	this.ATTRIBUTE22 = null;		        //	예비속성22
	this.ATTRIBUTE23 = null;		        //	예비속성23
	this.ATTRIBUTE24 = null;		        //	예비속성24
	this.ATTRIBUTE25 = null;              //	예비속성25
	this.APIGWTRANSFERFLAG = null;		//	API GW 전송 FLAG
	this.APIGWTRANSFERDATE = null;		//	API GW 전송 시간
	this.APIGWERRORMSG = null;		    //	API GW 에레메세지
}

function IAM_IF_RESPONSIBILITY_ENTITY() {
    this.SYSTEMCODE = "ELOQUA";				//	시스템코드
    this.RESPONSIBILITYCODE = "";			//	권한코드
    this.RESPONSIBILITYOPTIONCODE = "";		//	권한옵션코드
    this.RESPONSIBILITYNAME = "";			//	권한명칭
    this.RESPONSIBILITYENGNAME = null;		//	권한영문명칭
    this.RESPAFFILIATEMNGFLAG = "Y";		//	권한관계사관리여부 : Y (고정값)
    this.DOMAINCODE = null;					//	도메인코드
    this.MODULECODE = null;					//	모듈코드
    this.DIVISIONCODE = null;					//	사업부코드
    this.INQUIRYAUTHORITYFLAG = null;			//	조회권한여부
    this.SODEXCEPTIONFLAG = null;				//	SOD제외여부
    this.RESPONSIBILITYDESC = null;			//	권한설명
    this.REMARKS = null;						//	적요
    this.USEFLAG = "Y";						//	사용여부
    this.EFFECTIVESTARTYYYYMMDD = null;		//	유효시작일자
    this.EFFECTIVEENDYYYYMMDD = null;			//	유효종료일자
    this.TOPMENUID = null;						//	TOP메뉴ID
    this.TOPMENUNAME = null;					//	TOP메뉴명
    this.APPLICATIONSHORTNAME = null;			//	애플리케이션약어
    this.APPLICATIONNAME = null;				//	애플리케이션명
    this.ATTRIBUTE1 = null;					//	예비속성1
    this.ATTRIBUTE2 = null;					//	예비속성2
    this.ATTRIBUTE3 = null;					//	예비속성3
    this.ATTRIBUTE4 = "";					//	예비속성4
    this.ATTRIBUTE5 = null;					//	예비속성5
    this.ATTRIBUTE6 = null;					//	예비속성6
    this.ATTRIBUTE7 = "";					//	예비속성7
    this.ATTRIBUTE8 = "";					//	예비속성8
    this.ATTRIBUTE9 = null;					//	예비속성9
    this.ATTRIBUTE10 = null;					//	예비속성10
    this.ATTRIBUTE11 = null;					//	예비속성11
    this.ATTRIBUTE12 = null;					//	예비속성12
    this.ATTRIBUTE13 = null;					//	예비속성13
    this.ATTRIBUTE14 = null;					//	예비속성14
    this.ATTRIBUTE15 = null;					//	예비속성15
    this.CREATIONDATE = "";					//	생성일자
    this.CREATEDBYCODE = null;				//	생성자코드
    this.LASTUPDATEDATE = "";				//	최종수정일자
    this.LASTUPDATEDBYCODE = null;			//	최종수정자코드
    this.TRANSMISSIONID = 0;				//	송신ID
    this.TRANSMISSIONCOUNT = 0;				//	송신건수
    this.INTERFACETYPECODE = "ELOQUA";			//	인터페이스유형코드
    this.POSTINGSTATUSCODE = "READY";			//	전기상태코드
    this.POSTINGDATE = null;					//	전기일자
    this.POSTINGERRORDESC = null;				//	전기오류설명
    this.TRANSFERFLAG = "N";					//	전송여부
    this.TRANSFERDATE = "";					//	전송일자
    this.GLOBALUNIQUEID = null;				//	글로벌유일아이디
    this.BAMSEQUENCEID = null;				//	비즈니스활동모니터링일련순서아이디
    this.OLDGLOBALUNIQUEID = null;			//	변경전글로벌유일아이디
    this.ATTRIBUTE16 = null;					//	예비속성16(GERP일때 Default Y 불가권한은 N)
    this.ATTRIBUTE17 = null;					//	예비속성17
    this.ATTRIBUTE18 = null;					//	예비속성18
    this.ATTRIBUTE19 = null;					//	예비속성19
    this.ATTRIBUTE20 = null;					//	예비속성20
    this.ATTRIBUTE21 = null;					//	예비속성21
    this.ATTRIBUTE22 = null;					//	예비속성22
    this.ATTRIBUTE23 = null;					//	예비속성23
    this.ATTRIBUTE24 = null;					//	예비속성24
    this.ATTRIBUTE25 = null;					//	예비속성25
    this.APIGWTRANSFERFLAG = null;			//	API GW 전송 FLAG
    this.APIGWTRANSFERDATE = null;			//	API GW 전송 시간
    this.APIGWERRORMSG = null;				//	API GW 에레메세지
}

//#endregion


//====================================================
//IF_USER_ID 시퀀스 수정필요
//====================================================
//#region IAM User Endpoint Endpoint 호출 영역

function CONVERT_IAM_USER_DATA(_eloqua_items) {
    var result = [];
    var items = _eloqua_items;

    if (items != null && items.total > 0) {
        for (var i = 0; i < items.elements.length; i++) {
            var item = items.elements[i];
            var data = new IAM_IF_USER_ENTITY();
            
            data.SYSTEMCODE = "ELOQUA";         // 고정값 "ELOQUA"
            data.USERCODE = item.federationId;  // 사번
            data.AFFILIATECODE = "XXXX";        // 고정값
            data.SSOUSERID = item.loginName;    // "ssoUserId": "tim.kim"
            data.USERNAME = item.name;          // "userName": "김홍석"
            data.MAILADDR = item.emailAddress;
            data.EMPLOYEENO = item.federationId;
            data.KOREMPLOYEENO = item.federationId;
            data.DEPARTMENTCODE = "";           // 엘로코아 없음
            data.DEPARTMENTNAME = item.companyDisplayName != undefined ? item.companyDisplayName : "부서명";
            data.EFFECTIVESTARTYYYYMMDD = null;
            data.EFFECTIVEENDYYYYMMDD = null;
            data.USEFLAG = "Y";
            data.CREATIONDATE = utils.timeConverter("GET_DATE", item.createdAt);
            data.LASTUPDATEDATE = utils.timeConverter("GET_DATE", item.updatedAt);
            data.TRANSMISSIONID = i+1;                        // 송신ID
            data.TRANSMISSIONCOUNT = items.total;             // 송신건수 : 한번에  IF 되는 건수 총 합(row 당 동일 값)
            data.INTERFACETYPECODE = "ELOQUA";
            data.POSTINGSTATUSCODE = "READY";
            data.TRANSFERFLAG = "N";
            data.TRANSFERDATE = moment().tz('Asia/Seoul').format('YYYY-MM-DD hh:mm:ss');   // 호출시간

            result.push(data);
        }
    }
    return result;
}

// 1) 사용자
router.get('/user', function (req, res, next){
    console.log("user call");
    var send_url = "";
    var queryString = {};

    queryString['search'] = testemail;
    queryString['depth'] = "complete";

    lge_eloqua.system.users.get(queryString).then(async (result) => {
        console.log(result.data);
        var return_data = {};
        var user_data = CONVERT_IAM_USER_DATA(result.data);

        if (user_data.length > 0) {

            return_data['systemId'] = "ELOQUA";
            return_data['x-apikey'] = "da7d5553-5722-4358-91cd-9d89859bc4a0";
            return_data['gubun'] = "Q";
            return_data['data'] = user_data;
            res.json(return_data);
            console.log(return_data);

            // 개발 URL
            send_url = "https://dev-apigw-ext.lge.com:7221/gateway/lgiam_api/api2api/api/v1/saveIamIfUser.do"

            // 운영 URL
            // send_url = "https://apigw-ext.lge.com:7211/gateway/lgiam_api/api2api/api/v1/saveIamIfUser.do"

            var headers = {
                'Content-Type': "application/json",
                'x-Gateway-APIKey': "da7d5553-5722-4358-91cd-9d89859bc4a0"
            }

            options = {
                url: send_url,
                method: "POST",
                headers: headers,
                body: return_data,
                json: true
            };
            
            var result = await request(options, async function (error, response, body) {
                console.log(response);
                if (error) {
                    console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
                    console.log(error);
                    req_res_logs("user_response_error", body);
                }
                if (response.statusCode != 200) {
                    req_res_logs("user_response_error", body);
                }

                if (!error && response.statusCode == 200) {
                    result = body;
                    console.log(body);

                    res.json(body);
                    req_res_logs("user_response", body);
                }
            });
        }
        else {
            return_data.page = result.data.page;
            return_data.pageSize = result.data.pageSize;
            return_data.total = result.data.total;
            res.json(return_data);
        }
    }).catch((err) => {
        console.error(err);
        res.json(false);
    });

});


//====================================================
//IF_USER_RESPONSIBILITY_ID 시퀀스 수정필요
//====================================================
//#region IAM User Responsibility Endpoint 호출 영역

// 2) 사용자 권한
function CONVERT_IAM_USER_RESPONSIBILITY_DATA(_eloqua_items) {
    var result = [];
    var items = _eloqua_items;

    var transId = 1;    // transmisionId 값

    if (items != null && items.total > 0) {
        for (var i = 0; i < items.elements.length; i++) {

            var item = items.elements[i];

            for (var j = 0; j < item.securityGroups.length; j++) {
                var security_data = item.securityGroups[j];
                console.log(security_data);
                
                // 롤정보는 IAM 측에서 필드 max length 가 4자이기때문에 4자로 자르도록 해서 전송
                // 법인 정보 필드가 IAM 측에서 필드 max length가 8자이기떄문에 9글자가 넘는건 테스트로 제외하고 보내도록 변경
                if (GetCorporationExtraction(security_data.name).length >= 9) continue;
                if (security_data.name == "Everyone") continue;

                var data = new IAM_IF_USER_RESPONSIBILITY_ENTITY();
                data.SYSTEMCODE = "ELOQUA";
                data.USERCODE =  item.federationId;
                data.RESPONSIBILITYCODE = security_data.id;
                data.RESPONSIBILITYOPTIONCODE = GetBusinessExtraction(security_data.name);  // [0]
                data.USEFLAG = "Y";
                data.ATTRIBUTE6 = GetBusinessExtraction(security_data.name);    // "attribute6": "LGEKR" [0]
                data.ATTRIBUTE7 = GetCorporationExtraction(security_data.name); // "attribute7": "HQ" [1]
                data.CREATIONDATE = utils.timeConverter("GET_DATE", item.createdAt);
                data.LASTUPDATEDATE = utils.timeConverter("GET_DATE", item.updatedAt);
                data.TRANSMISSIONID = transId;
                data.TRANSMISSIONCOUNT = items.total;   
                data.INTERFACETYPECODE = "ELOQUA";
                data.POSTINGSTATUSCODE = "READY";
                data.POSTINGDATE = moment().tz('Asia/Seoul').format('YYYY-MM-DD hh:mm:ss');
                data.TRANSFERFLAG = "N";
                data.TRANSFERDATE = moment().tz('Asia/Seoul').format('YYYY-MM-DD hh:mm:ss');

                transId = transId + 1; 

                result.push(data);
            }
        }
    }
    return result;
}

// 2) 사용자 권한 (보안그룹)
router.get('/user_responsibility', function (req, res, next) {
    console.log('call user reponsibilty');
    var queryString = {};
    var send_url = "";

    // queryString['search'] = "loginName='Stephanie.An'";
    queryString['search'] = testemail;
    queryString['depth'] = "complete"; //["minimal", "partial " ,"complete"]
    // queryString['search'] = "federationId!=''";
    // queryString['count'] = 150;


    lge_eloqua.system.users.get(queryString).then(async (result) => {

        console.log(result.data);
        res.json(result.data);
        // res.json(result.data);

        var return_data = {};

        var user_responsibility_data = CONVERT_IAM_USER_RESPONSIBILITY_DATA(result.data);
        console.log(user_responsibility_data);

        // user_responsibility_data.totalDataCount = user_responsibility_data.length;
        
        // 각 row 의 TRANSMISSION_COUNT 를 전체 row 를 맞게 다시 세팅
        user_responsibility_data =  await get_IAM_USER_RESPONSIBILITY_SET_TOTAL_COUNT(user_responsibility_data)

        // req_res_logs("user_responsibility_eloqua", result.data);
        // req_res_logs("user_responsibility_convert", user_responsibility_data);

        if (user_responsibility_data.length > 0) {

            // return_data.ContentList = user_responsibility_data;
            // return_data.total = user_responsibility_data.length;

            //console.log(request_data);
            //res.json({ ContentList: request_data });

            return_data['systemId'] = "ELOQUA";
            return_data['x-apikey'] = "da7d5553-5722-4358-91cd-9d89859bc4a0";
            return_data['gubun'] = "Q";
            return_data['data'] = user_responsibility_data;
            console.log(return_data);

            // 개발 URL
            send_url = "https://dev-apigw-ext.lge.com:7221/gateway/lgiam_api/api2api/api/v1/saveIamIfUserResponsibility.do";

            // 운영 URL
            // send_url = "https://apigw-ext.lge.com:7211/gateway/lgiam_api/api2api/api/v1/saveIamIfUserResponsibility.do";

            var headers = {
                'Content-Type': "application/json",
                'x-Gateway-APIKey': "da7d5553-5722-4358-91cd-9d89859bc4a0"
            }

            options = {
                url: send_url,
                method: "POST",
                headers: headers,
                body: return_data,
                json: true
            }; 

            var result = await request(options, async function (error, response, body) {
                console.log(response);
                if (error) {
                    console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
                    console.log(error);
                }
                if (!error && response.statusCode == 200) {
                    result = body;
                    console.log(body);

                    res.json(body);
                    req_res_logs("user_responsibility_response", body);
                }
            });

        }
        else {
            return_data.ContentList = [];
            return_data.total = user_responsibility_data.length;
            res.json(return_data);
        }
    }).catch((err) => {
        console.error(err);
        res.json(false);
    });
});

//#endregion

function get_IAM_USER_RESPONSIBILITY_SET_TOTAL_COUNT(user_responsibility_data){
    for(let i = 0 ; i < user_responsibility_data.length ; i++  ){
        user_responsibility_data[i].TRANSMISSIONCOUNT = user_responsibility_data.length;
    }
    return user_responsibility_data;
}


//====================================================
//IAM_IF_RESPONSIBILITY_ENTITY 시퀀스 수정필요
//====================================================
//#region IAM Responsibility Endpoint 호출 영역

// 3) 권한
function CONVERT_IAM_RESPONSIBILITY_DATA(_eloqua_items) {
    var result = [];
    var items = _eloqua_items;
    var n = 0;

    if (items.elements[0].id == 1){
        delete items.elements[0];   // everyone
        n = 1;
    }        

    if (items != null && items.total > 0) {
        for (var i = n; i < items.elements.length; i++) {
            var item = items.elements[i];

            var data = new IAM_IF_RESPONSIBILITY_ENTITY();

            data.SYSTEMCODE = "ELOQUA";
            data.RESPONSIBILITYCODE = item.id;                                      // 권한코드
            data.RESPONSIBILITYOPTIONCODE = GetBusinessExtraction(item.name);       // 권한옵션코드 [0]
            data.RESPONSIBILITYNAME = item.name;                                    // 권한명칭
            data.RESPAFFILIATEMNGFLAG = "Y";                                        // 권한관계사관리여부 - Y 고정값
            data.CREATIONDATE = utils.timeConverter("GET_DATE", item.createdAt);
            data.LASTUPDATEDATE = utils.timeConverter("GET_DATE", item.updatedAt);
            data.TRANSMISSIONID = i;                                                // 100개 전송 시 1~100 순차로 전송 (전송 순번)
            data.TRANSMISSIONCOUNT = items.total;                                   // 총 송신 건수
            data.INTERFACETYPECODE = "ELOQUA";
            data.POSTINGSTATUSCODE = "READY";
            data.TRANSFERFLAG = "N";
            data.TRANSFERDATE = moment().tz('Asia/Seoul').format('YYYY-MM-DD hh:mm:ss');  // 전송일자

            // 사업부별 관리자 사번 전달
            switch (data.RESPONSIBILITYOPTIONCODE) {  // "attribute4": "306166" : 승인자 사번
                case "ID":
                case "IT":
                    data.ATTRIBUTE4 = "268965" //  // ID / IT : 서판규 선임 268965
                    break;

                case "Solar":
                case "CM":
                case "CLS":
                    data.ATTRIBUTE4 = "261922" // Solar / CM / CLS / Solution  김효진 선임 261922
                    break;

                case "AS":
                    data.ATTRIBUTE4 = "255147" // AS : 김정준 선임 255147
                    break;

                case "KR":
                    data.ATTRIBUTE4 = "239827" // KR : 박종명 책임 239827 
                default:
                    data.ATTRIBUTE4 = "268965" // HQ 서판규 선임 268965
                    break;
            }

            data.ATTRIBUTE6 = GetBusinessExtraction(item.name);            // "attribute6": "LGEKR" [0]
            data.ATTRIBUTE7 = GetCorporationExtraction(item.name);         // "attribute7": "HQ" [1] 

            result.push(data);
        }
    }
    return result;
}

// 3) 보안그룹 (권한)
router.get('/responsibility', async function (req, res, next) {
    console.log('call responsibility !');
    var queryString = {
        depth: "complete" //["minimal", "partial " ,"complete"]
        // ,count: 100
    }
    
    lge_eloqua.system.users.security_groups(queryString).then(async (result) => {
        var send_url = "";

        var return_data = {};
        var responsibility_data = CONVERT_IAM_RESPONSIBILITY_DATA(result.data);

        // responsibility_data.totalDataCount = responsibility_data.length;
        // req_res_logs("responsibility_eloqua", result.data);
        // req_res_logs("responsibility_convert", responsibility_data);

        if (responsibility_data.length > 0) {

            return_data['systemId'] = "ELOQUA";
            return_data['x-apikey'] = "da7d5553-5722-4358-91cd-9d89859bc4a0";   // 인증키
            return_data['gubun'] = "Q";
            return_data['data'] = responsibility_data;
            res.json(return_data);

            // 개발 URL
            send_url = "https://dev-apigw-ext.lge.com:7221/gateway/lgiam_api/api2api/api/v1/saveIamIfResponsibility.do";

            // 운영 URL
            // send_url = "https://apigw-ext.lge.com:7211/gateway/lgiam_api/api2api/api/v1/saveIamIfResponsibility.do";

            var headers = {
                'Content-Type': "application/json",
                'x-Gateway-APIKey': "da7d5553-5722-4358-91cd-9d89859bc4a0"
            }

            options = {
                url: send_url,
                method: "POST",
                headers: headers,
                body: return_data,
                json: true
            }; 

            var result = await request(options, async function (error, response, body) {
                console.log(response);
                if (error) {
                    console.log("에러에러 (wise 점검 및 인터넷 연결 안됨)");
                    console.log(error);
                }
                if (!error && response.statusCode == 200) {
                    result = body; 
                    console.log(body);
                    req_res_logs("responsibility_response", body);
                }
            })
        }
        else {
            return_data.page = result.data.page;
            return_data.pageSize = result.data.pageSize;
            return_data.total = result.data.total;

            res.json(return_data);
        }
    }).catch((err) => {
        console.error(err);
        res.json(false);
    });
});
//#endregion


//====================================================
//Create는 되나 보안그룹은 별도 API 
//Product 메뉴 비활성화 되어있음 체크 방법 찾아야함
//====================================================
//#region (진행중) IAM USER Create Endpoint 호출 영역

function Convert_IAM_TO_ELOQUA_DATA(data_list , res) {
    let convert_data = [];

    console.log("returns 2")
    for(const item of data_list){
        let return_data ={};
        return_data.add_sc_list = [];

        return_data.firstName = GetDataValue(item.SSOID.split(".")[0]);
        return_data.lastName = GetDataValue(item.SSOID.split(".")[1]);
        return_data.federationId = GetDataValue(item.SABUN);
        return_data.loginName = GetDataValue(item.SSOID);
        return_data.name = GetDataValue(item.NAME);
        return_data.emailAddress = GetDataValue(item.EMAIL);
        return_data.address1 = GetDataValue(item.ORGAN);
        return_data.address2 = GetDataValue(item.ORGAN_NAME);
        return_data.city = GetDataValue(item.MANAGEMENT_ORGAN);
        return_data.state = GetDataValue(item.MANAGEMENT_ORGAN_NAME);
        return_data.country = GetDataValue(item.X_ORGAN);
        return_data.zipCode = GetDataValue(item.X_ORGAN_NAME);
        return_data.jobTitle = GetDataValue(item.POSITION_NAME);
        return_data.department = GetDataValue(item.DIVISION);
        return_data.add_sc_list = item.SECURITY_GROUPS;
        return_data.gubun = GetDataValue(item.GUBUN);
        return_data.id = GetDataValue(item.ID);


        // 넘어온 데이터에 상관없이 추가적으로 들어가야 할 필드
        return_data.ssoOnly = "True" ;
        return_data.isDisabled = "False";
        return_data.passwordExpires = "False" ;

        // for (let j = 0; j < this_data.RESPONSIBILITY_CODE.length; j++) {
        //     eloqua_data.security_groups.push(this_data.RESPONSIBILITY_CODE[j]);
        // }
        // console.log(convert_data);
        convert_data.push(return_data);
    }
    return convert_data;
    
}


// 휴/퇴직자 구분 및 전보 발령일 경우에 대해 처리
// H : 휴직자 , T : 퇴직자 , M : 조직 코드 변경자
function Convert_IAM_TO_RE_ELOQUA_DATA(_req_data ) {
  
    console.log("returns 2")
  
    let return_data ={};
    
    return_data.add_sc_list = [];

    return_data.id = _req_data.id;
    return_data.HTGUBUN = _req_data.HTGUBUN;

    if(_req_data.HTGUBUN == 'H'){
        return_data.personalMessage = 'rest';

    }else if(_req_data.HTGUBUN == 'T'){
        
        return_data.isDisabled = "True";
        return_data.personalMessage = 'retiree';
    }else if(_req_data.ELOQUA_ORGAN != _req_data.ORGAN ){
        return_data.HTGUBUN = "M";
    }

    

    return return_data;
    
}

function OVERLAP_REMOVE_IAM_RESPOSIBILITY(_body , res){
    console.log(11);
    let origin_data = _body;
	let copy_data = origin_data.slice();
	let result_data = [];
    let overlap_email_list = [];

	try{
		for(let i = 0 ; i < origin_data.length ; i++){
			origin_data[i]['SECURITY_GROUPS'] = [];
            
            // console.log("overlap email list");
            // console.log(overlap_email_list);
            // console.log("origin_data : " + i + "   origin_data[i].EMAIL : " + origin_data[i].EMAIL );
            if( !origin_data[i] ){
                continue;
            } 
            if(overlap_email_list.indexOf(origin_data[i].EMAIL) > -1){
                delete origin_data[i];
                continue;
            }
			for(let j = 0 ; j < copy_data.length ; j++){      
				if( origin_data[i].EMAIL == copy_data[j].EMAIL ){
					origin_data[i]['SECURITY_GROUPS'].push(copy_data[j].RESPONSIBILITY_CODE);	
                    overlap_email_list.push(origin_data[i].EMAIL) ;	
				}                
			}
            
			result_data.push(origin_data[i]);
		}
	}catch(err){
		console.log(err);
	}

    return result_data;
}

async function CREATE_UPDATE_GUBUN_DATA(data_list ) {
    let convert_data = [];

    // console.log(data_list);
    for(const item of data_list){
        let email = item.EMAIL ;
        let queryString = {};
        queryString['search'] = "emailAddress='" + email + "'";

        await lge_eloqua.system.users.get(queryString).then((result) => {
            if(result.data.elements && result.data.elements.length > 0){
                item.GUBUN = "UPDATE";
                item.ID = result.data.elements[0].id;
                console.log(result.data.elements[0]);
                convert_data.push(item);
            }else{
                item.GUBUN = "CREATE";
                convert_data.push(item);
            }
        }).catch((err) => {
            item.GUBUN = "CREATE";
            convert_data.push(item);
        });
    }

    return convert_data;
    
}

async function HT_GUBUN_DATA(item ) {
   

    // console.log(data_list);
   
    let email = item.EMAIL ;
    let queryString = {};
    queryString['search'] = "emailAddress='" + email +"'";

    await lge_eloqua.system.users.get(queryString).then((result) => {
        if(result.data.elements && result.data.elements.length > 0){
            item.ELOQUA_ORGAN = result.data.elements[0].address1;
            item.ID = result.data.elements[0].id;
            console.log(result.data.elements[0]);
            return item;
        }else{
            return item;
        }
    }).catch((err) => {
       console.log(err.stack);
    });
}



router.post('/user_data', async function (req, res, next) {
   
    // 한 사용자에 대하여 시큐리티 그룹별로 오는 중복 데이터를 머지
    let overlap_remove_data = await OVERLAP_REMOVE_IAM_RESPOSIBILITY(req.body , res);

    // 중복을 merge 한 데이터를 Eloqua 에서 조회하여 업데이트 할 데이터 일지 ,  create 할 데이터 일지 구분
    let create_update_data = await CREATE_UPDATE_GUBUN_DATA(overlap_remove_data); 
 
    // 해당 데이터를 Eloqua 에 create / update 를 하기위해 데이터형식을 맞춤
    let convert_data = await Convert_IAM_TO_ELOQUA_DATA(create_update_data)
    // console.log(convert_data);

    // console.log(convert_data)
    await res.json(convert_data);
    await req_res_logs("create_eloqua", overlap_remove_data);
    await req_res_logs("create_gubun", create_update_data);
    await req_res_logs("create_convert", convert_data);
 
    for(const item of convert_data){

        if(item.gubun == 'CREATE'){
            lge_eloqua.system.users.create(create_item).then( async (result) => {

                if(result.data){
                    console.log(result.data);
                    req_res_logs("create_after", result_data);
                    if (result.data.id) await securityGroup_Modify(result.data.id, item.add_sc_list, res);
                    res.json(result.data);
                }
               
            }).catch((err) => {
                console.error(err);
                res.json(err);
            });
        }else if(item.gubun == 'UPDATE'){
            
            lge_eloqua.system.users.update(item.id, item).then( async (result) => {
                if(result.data){
                    console.log(result.data);
                    req_res_logs("create_after", result_data);
                    if (result.data.id) await securityGroup_Modify(result.data.id, item.add_sc_list, res);
                    res.json(result.data);
                }
            }).catch((err) => {
                console.error(err);
            });
        }
    }
});

router.post('/test_update', function (req, res, next) {
    console.log(1234);
    let overlap_remove_data = OVERLAP_REMOVE_IAM_RESPOSIBILITY(req.body , res);
    let convet_data = Convert_IAM_TO_ELOQUA_DATA(overlap_remove_data)
    res.json(convet_data);
    req_res_logs("update_eloqua", overlap_remove_data);
    req_res_logs("update_convert", convet_data);
 
    for(const create_item of convert_data){
        lge_eloqua.system.users.create(create_item).then( async (result) => {

            if(result.data){
                console.log(result.data);
                req_res_logs("create_after", result_data);
                if (result.data.id) await securityGroup_Modify(result.data.id, item.add_sc_list, res);
                res.json(result.data);
            }
           
        }).catch((err) => {
            console.error(err);
            res.json(err);
        });
    }
});





router.get('/user/test_getOne/:id', function (req, res, next) {

    //예시 Request body 참고 URL : https://docs.oracle.com/en/cloud/saas/marketing/eloqua-rest-api/op-api-rest-2.0-system-user-post.html
    // {
    //   "name": "API User",
    //   "emailAddress": "api.user@oracle.com", 
    //   "loginName": "api.user",
    //   "firstName": "API",
    //   "lastName": "User"
    // }

    // var body_data = Convert_IAM_TO_ELOQUA_DATA(req.body);

    // console.log(body_data);

    lge_eloqua.system.users.getOne(req.params.id).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
        res.json(err);
    });
});

router.get('/user/test_Search', function (req, res, next) {

    //예시 Request body 참고 URL : https://docs.oracle.com/en/cloud/saas/marketing/eloqua-rest-api/op-api-rest-2.0-system-user-post.html
    // {
    //   "name": "API User",
    //   "emailAddress": "api.user@oracle.com", 
    //   "loginName": "api.user",
    //   "firstName": "API",
    //   "lastName": "User"
    // }

    // var body_data = Convert_IAM_TO_ELOQUA_DATA(req.body);

    // console.log(body_data);
    let email = req.query.email ;
    let queryString = {};
    queryString['search'] = "emailAddress='" + email +"'";

    lge_eloqua.system.users.get(queryString).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
        res.json(err);
    });
});


router.post('/user/securityGroup', async function (req, res, next) {
    await securityGroup_Modify(req.body.id, req.body.add_sg_list, res);
});

//예시 Request body 참고 URL : https://docs.oracle.com/en/cloud/saas/marketing/eloqua-rest-api/op-api-rest-2.0-system-security-group-id-users-patch.html
// {
//   "id": "80",
//   "userinfo": {
//       "patchMethod": "add",
//       "user": {
//           "id": "292"
//       }
//   }
// }

//   {
// 	  "user_id" : 248 ,
// 	  "security_groupID" : 67 
//   }
async function securityGroup_Modify(user_id, add_sc_list, res) {

    var remove_sc_list = [];
    remove_sc_list = await get_user_securityGroup(user_id, res);
    console.log(remove_sc_list);
    var result_list = await securityGroup_Process(user_id, remove_sc_list, add_sc_list);
    console.log(result_list);
    res.json(result_list);
    // return;
    // lge_eloqua.system.users.security_groups_add_remove(body_id, body_user_data).then((result) => {
    //     console.log(result.data);
    //     res.json(result.data);
    // }).catch((err) => {
    //     console.error(err);
    //     res.json(err);
    // });
};

async function get_user_securityGroup(user_id, res) {

    var queryString = {};
    queryString['depth'] = "complete";
    var return_list = [];
    console.log("get_user_securityGroup user_id : " + user_id);

    // lge_eloqua.system.users.getOne(req.params.id).then((result) => {
    //     console.log(result.data);
    //     res.json(result.data);
    // }).catch((err) => {
    //     console.error(err);
    //     res.json(err);
    // });

    await lge_eloqua.system.users.getOne(user_id, queryString).then(async (result) => {
        if (!result.data.securityGroups) {
            return_list = [];
            console.log(" not data list");
        }

        if (result.data.securityGroups) {
            return_list = await result.data.securityGroups.filter(row => { if (row.id && row.id !== '1') return row.id });
        }
    }).catch((err) => {
        console.log(err);
        res.json({
            id: user_id,
            status: err.response.status,
            message: err.message
        })
    });

    return return_list;
}



async function securityGroup_Process(user_id, remove_sc_group, add_sc_group) {
    // process : add 와 remove 만 가능
    // data : Eloqua 사용자 정보 조회 return 값

    // console.log(user_id);
    // console.log(remove_sc_group);
    // console.log(add_sc_group);

    let result_list = [];

    let patch = {
        patchMethod: "remove",
        user: {
            "id": user_id
        }
    }


    let all_list = remove_sc_group.concat(add_sc_group);
    console.log(1234)
    console.log(all_list);
    for (var i = 0; all_list.length > i; i++) {

        let id = all_list[i];


        if (remove_sc_group.length <= i) {
            id = add_sc_group[i - remove_sc_group.length];
            patch.patchMethod = "add";
        }

        await lge_eloqua.system.users.security_groups_add_remove(id, patch).then((result) => {
            // console.log(process+ " done");
            // console.log("after : remove  , id : " + id);
            result_list.push({
                id: user_id,
                method: patch.patchMethod,
                status: 200,
                message: "success"
            })
        }).catch((err) => {
            console.log(err.message);
            result_list.push({
                id: user_id,
                method: patch.patchMethod,
                status: err.response.status,
                message: err.message
            })
        })
    }


    return result_list;
}

//#endregion

//#region (진행중) IAM USER Update Endpoint 호출 영역
router.post('/update/:id', function (req, res, next) {

    lge_eloqua.system.users.update(req.params.id, req.body).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
    });
});
// #endregion

//#region 위험!! (완료) IAM USER Delete Endpoint 호출 영역

// router.delete('/user/delete/:id', function (req, res, next) {
//     lge_eloqua.system.users.delete(req.params.id).then((result) => {
//         console.log(result);
//         res.json(result);
//       }).catch((err) => {
//         console.error(err);
//       });
// });

//#endregion

//#region (완료) IAM USER Search Endpoint 호출 영역
router.get('/user/:id', function (req, res, next) {
    console.log("user/id");
    var queryString = {}

    queryString['search'] = "id=" + req.params.id;
    //queryString['search'] = "loginName='Stephanie.An'";
    queryString['depth'] = "complete"; //["minimal", "partial " ,"complete"]
    //federationId LG전자 사번 ( 페더레이션 ID )
    //queryString['count'] = 10;
    //queryString['page'] = 1;

    lge_eloqua.system.users.get(queryString).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
        res.json(false);
    });
});
//#endregion


//#region Functions 

function GetBusinessExtraction(_name) {
    //예시값 "IT_LV_Marketer"
    //_ 기준 Split 첫번째값 리턴 "IT";
    //예외 _기준으로 Split 하였을 경우 3개의 값이 나오지 않은 값의 경우 처리 HQ처리
    var name = _name;
    var words = name.split('_');
    var return_value = "";
    if (words.length == 3) {
        return words[0];
    }
    else {
        return "HQ";
    }
}

function GetCorporationExtraction(_name) {
    //예시값 "IT_LV_Marketer"
    //_ 기준 Split 두번째값 리턴 "LV";
    //예외 _기준으로 Split 하였을 경우 3개의 값이 나오지 않은 값의 경우 처리 HQ처리
    var name = _name;
    var words = name.split('_');
    var return_value = "";
    if (words.length == 3) {
        return words[1];
    }
    else {
        return "HQ";
    }
}

function GetRullExtraction(_name) {
    //예시값 "IT_LV_Marketer"
    //_ 기준 Split 두번째값 리턴 "LV";
    //예외 _기준으로 Split 하였을 경우 3개의 값이 나오지 않은 값의 경우 처리 HQ처리
    var name = _name;
    var words = name.split('_');
    var return_value = "";
    if (words.length == 3) {
        return words[2];
    }
    else {
        return name;
    }
}

function GetDataValue(_fieldvalue) {
    try {
        if (_fieldvalue != undefined) {
            return _fieldvalue;
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

function GetIFNumber(_first_default_number, _last_number) {
    var result = _first_default_number + lpad(_last_number, 4, "0");
    return Number(result);
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

//#endregion



router.get('/all_securityGroups', function (req, res, next) {
    var queryString = {
        //search : search_value,
        depth: "complete" //["minimal", "partial " ,"complete"]
    }
    lge_eloqua.system.users.security_groups(queryString).then((result) => {
        res.json(result.data);

        //console.log(request_data

    }).catch((err) => {
        console.error(err);
        res.json(false);
    });
});

router.post('/user/create', function (req, res, next) {

    //예시 Request body 참고 URL : https://docs.oracle.com/en/cloud/saas/marketing/eloqua-rest-api/op-api-rest-2.0-system-user-post.html
    // {
    //   "name": "API User",
    //   "emailAddress": "api.user@oracle.com", 
    //   "loginName": "api.user",
    //   "firstName": "API",
    //   "lastName": "User"
    // }

    

    var body_data = Convert_IAM_TO_ELOQUA_DATA(req.body);

    let essential = true;
    if(body_data.EMAIL){
        res.status(404).json({
            "Result" : "Failed" ,
            "ErrorMessage" : "Send Data Not Include Email"

        });
        essential = false;
    }else if(!validateEmail(body_data.EMAIL)){
        res.status(404).json({
            "Result" : "Failed" ,
            "ErrorMessage" : "Invalid Email Type"
            
        });
        essential = false;
    }

    console.log(body_data);
    if(essential){
        lge_eloqua.system.users.create(body_data).then(async (result) => {
            console.log(result.data);
            let result_list = await securityGroup_Modify(result.data.id, req.body.add_sc_list, res);
            res.json(result_list);
        }).catch((err) => {
            console.error(err);
            res.json(err);
        });
    }
  
});

// 퇴직자 구분 데이터
router.post('/htgubun_data', async function (req, res, next) {
 
    let ht_data = req.body;
    let essential = true;

    if(ht_data.EMAIL){
        res.status(404).json({
            "Result" : "Failed" ,
            "ErrorMessage" : "Send Data Not Include Email"

        });
        essential = false;
    }else if(!validateEmail(ht_data.EMAIL)){
        res.status(404).json({
            "Result" : "Failed" ,
            "ErrorMessage" : "Invalid Email Type"

        });
        essential = false;
    }
    
    if(essential){

        // HTGUBUN = T  : 퇴직자 , HTGUBUN 
        let eloqua_datas = await HT_GUBUN_DATA(ht_data);
        let retiree_list = await Convert_IAM_TO_RE_ELOQUA_DATA(eloqua_datas);
    
        for(const item of retiree_list){
           
            if(item.HTGUBUN == 'T' || item.HTGUBUN == 'M'){
                await securityGroup_Modify(item.id, item.add_sc_list, res);
            }
    
            if(item.HTGUBUN != 'M'){
                lge_eloqua.system.users.update(item.id , item ).then((result) => {
                    res.json(result.data);           
                    //console.log(request_data);
                }).catch((err) => {
                    console.error(err);
                    res.json(false);
                });
            }
        }
    }
   
});


function req_res_logs(filename, data) {
    // filename : request , response 
    // business_name : 사업부별 name
    // data : log 저장할 데이터

    var dirPath = utils.logs_makeDirectory("IAM_SYSTEM_" + moment().format('YYYYMMDD'));
    console.log("fileWrite Path : " + dirPath);

    fs.writeFile(dirPath + filename + ".txt", JSON.stringify(data), 'utf8', function (error) {
        if (error) {
            console.log(err);
        } else {
            console.log('write end');
        }
    });
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

//이메일 확인 함수
function validateEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(String(email).toLowerCase());
}

module.exports = router;
