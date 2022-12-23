var moment = require('moment-timezone');
var utils = require('../../common/utils');
var express = require('express');
var request = require('request');
var router = express.Router();
var fs = require("mz/fs"); 
const logger = require('./iamLog');   // ../../log 
// const { reset } = require('nodemon');
// const e = require('express'); 

//=====================================================================================================================================================================================================
// Last Update Date : 2021-02-10
// IAM 테이블 연동 관련 API Endpoint 정의
// IAM USER TABLE
// IAM USER REPONSIBILITY
// IAM RESPONSIBILITY

// 2022-10-12 전달사항
// ELOQUA => IAM으로 송신 변경이 있는 경우만 송신
// IAM => ELOQUA로 수신 매시 15분에 호출
//=====================================================================================================================================================================================================

// #region IAM ENTITY 정의 함수 영역

function IAM_IF_USER_ENTITY(){ 
    this.systemCode = "ELOQUA";
    this.userCode = "";
    this.affiliateCode = "XXXX";
    this.corporationCode = null;
    this.ssoUserId = "";
    this.userName = "";
    this.mailAddr = "";
    this.employeeNo = "";
    this.korEmployeeNo = "";
    this.employeeEngName = null;
    this.administratorFlag = null;
    this.divisionCode = null;
    this.organizationId = null;
    this.departmentCode = "";
    this.departmentName = "";
    this.jobName = null;
    this.positionName = null;
    this.sodExceptionFlag = null;
    this.sodExceptionReasonDesc = null;
    this.effectiveStartYyyymmdd = null;     // NULL 
    this.effectiveEndYyyymmdd = null;       // NULL 
    this.remarks = null;
    this.useFlag = "";
    this.gerpUserName = null;
    this.lastLogonDate = null;
    this.attribute1 = null;
    this.attribute2 = null;
    this.attribute3 = null;
    this.attribute4 = null;
    this.attribute5 = null;
    this.attribute6 = null;
    this.attribute7 = null;
    this.attribute8 = null;
    this.attribute9 = null;
    this.attribute10 = null;
    this.attribute11 = null;
    this.attribute12 = null;
    this.attribute13 = null;
    this.attribute14 = null;
    this.attribute15 = null;
    this.creationDate = "";
    this.createdByCode = null;
    this.lastUpdateDate = "";
    this.lastUpdatedByCode = null;
    this.transmissionId = 0;
    this.transmissionCount = 0;
    this.interfaceTypeCode = "API";
    this.postingStatusCode = "READY";
    this.postingDate = null;
    this.postingErrorDesc = null;
    this.transferFlag = "N";
    this.transferDate = "";
    this.globalUniqueId = null;
    this.bamSequenceId = null;
    this.oldGlobalUniqueId = null;
    this.attribute16 = null;
    this.attribute17 = null;
    this.attribute18 = null;
    this.attribute19 = null;
    this.attribute20 = null;
    this.attribute21 = null;
    this.attribute22 = null;
    this.attribute23 = null;
    this.attribute24 = null;
    this.attribute25 = null;
    this.apigwTransferFlag = null;
    this.apigwTransferDate = null;
    this.apigwErrormsg = null;
}

function IAM_IF_USER_RESPONSIBILITY_ENTITY(){
    this.systemCode = "ELOQUA";
    this.userCode = "";                     // 사번
    this.userAffiliateCode = null;
    this.userCorporationCode = null;
    this.responsibilityCode = "";           // 보안그룹 ID
    this.responsibilityOptionCode = 0;
    this.inquiryAuthorityFlag = null;
    this.effectiveStartYyyymmdd = null;
    this.effectiveEndYyyymmdd = null;
    this.useFlag = "Y";
    this.remarks = null;
    this.gerpUserName = null;
    this.applicationShortName = null;
    this.attribute1 = null;
    this.attribute2 = null;
    this.attribute3 = null;
    this.attribute4 = null;
    this.attribute5 = null;
    this.attribute6 = "";
    this.attribute7 = "";
    this.attribute8 = null;
    this.attribute9 = null;
    this.attribute10 = null;
    this.attribute11 = null;
    this.attribute12 = null;
    this.attribute13 = null;
    this.attribute14 = null;
    this.attribute15 = null;
    this.creationDate = "";
    this.createdByCode = null;
    this.lastUpdateDate = "";
    this.lastUpdatedByCode = null;
    this.transmissionId = 0;
    this.transmissionCount = 0;
    this.interfaceTypeCode = "API";
    this.postingStatusCode = "READY";
    this.postingDate = "";
    this.postingErrorDesc = null;
    this.transferFlag = "N";
    this.transferDate = "";
    this.globalUniqueId = null;
    this.bamSequenceId = null;
    this.oldGlobalUniqueId = null;
    this.attribute16 = null;
    this.attribute17 = null;
    this.attribute18 = null;
    this.attribute19 = null;
    this.attribute20 = null;
    this.attribute21 = null;
    this.attribute22 = null;
    this.attribute23 = null;
    this.attribute24 = null;
    this.attribute25 = null;
    this.apigwTransferFlag = null;
    this.apigwTransferDate = null;
    this.apigwErrormsg = null;
}

function IAM_IF_RESPONSIBILITY_ENTITY() {
    this.systemCode = "ELOQUA";
    this.responsibilityCode = "";
    this.responsibilityOptionCode = "";
    this.responsibilityName = "";
    this.responsibilityEngName = null;
    this.respAffiliateMngFlag = "Y";
    this.domainCode = null;
    this.moduleCode = null;
    this.divisionCode = null;
    this.inquiryAuthorityFlag = null;
    this.sodExceptionFlag = null;
    this.responsibilityDesc = null;
    this.remarks = null;
    this.useFlag = "Y";
    this.effectiveStartYyyymmdd = null;
    this.effectiveEndYyyymmdd = null;
    this.topMenuId = null;
    this.topMenuName = null;
    this.applicationShortName = null;
    this.applicationName = null;
    this.attribute1 = null;
    this.attribute2 = null;
    this.attribute3 = null;
    this.attribute4 = "";
    this.attribute5 = null;
    this.attribute6 = "";
    this.attribute7 = "";
    this.attribute8 = null;
    this.attribute9 = null;
    this.attribute10 = null;
    this.attribute11 = null;
    this.attribute12 = null;
    this.attribute13 = null;
    this.attribute14 = null;
    this.attribute15 = null;
    this.creationDate = "";
    this.createdByCode = null;
    this.lastUpdateDate = "";
    this.lastUpdatedByCode = null;
    this.transmissionId = 0;
    this.transmissionCount = 0;
    this.interfaceTypeCode = "API";
    this.postingStatusCode = "READY";
    this.postingDate = null;
    this.postingErrorDesc = null;
    this.transferFlag = "N";
    this.transferDate = "";
    this.globalUniqueId = null;
    this.bamSequenceId = null;
    this.oldGlobalUniqueId = null;
    this.attribute16 = null;
    this.attribute17 = null;
    this.attribute18 = null;
    this.attribute19 = null;
    this.attribute20 = null;
    this.attribute21 = null;
    this.attribute22 = null;
    this.attribute23 = null;
    this.attribute24 = null;
    this.attribute25 = null;
    this.apigwTransferFlag = null;
    this.apigwTransferDate = null;
    this.apigwErrormsg = null;
}

function ELOQUA_USER_ENTITY(){

    // 로그인 정보
    // this.id = "";
    this.emailAddress = "";
    this.firstName = "";    
    this.isDisabled = "True";   // 사용자 사용 여부
    this.lastName = "";
    this.loginName = "";
    this.name = "";
    this.passwordExpires = "";
    this.ssoOnly = "";    

    // 일반정보 (서명필드)
    this.address1 = "";
    this.address2 = "";
    this.cellPhone = "";
    this.city = "";
    this.companyDisplayName = "";
    this.companyUrl = "";
    this.country = "";
    this.department = "";
    this.fax = "";
    this.jobTitle = "";
    this.personalMessage = "";
    this.personalPhotoId = "";
    this.personalUrl = "";
    this.phone = "";
    this.replyToAddress = "";
    this.senderDisplayName = "";
    this.senderEmailAddress = "";
    this.zipCode = "";

    this.crmUsername = "";              
    this.currentStatus = "";
    this.defaultAccountViewId = "";
    this.defaultContactViewId = "";
    this.description = "";
    this.digitalSignatureId = "";       // 사용자 서명
    this.federationId = "";             // 사번
    this.folderId = "";
    this.isDeleted = "";
    this.isUsingBrightenTemplate = "";
    this.scheduledFor = "";
    this.sendWelcomeEmail = "";
    this.sourceTemplateId = "";
    this.state = "";                    // 시/도
    this.type = "";
    this.preferences = { "type": "UserPreferences", "timezoneId": "40" };  //시간 한국 시간 설정

    // 보안그룹
    this.securityGroups = [];
} 

// #endregion


// #region IAM User Endpoint Endpoint 호출 영역
function CONVERT_IAM_USER_DATA(_eloqua_items) {
    let result = [];
    let items = _eloqua_items;

    if (items != null && items.total > 0) {
        for (let i = 0; i < items.elements.length; i++) {
            let item = items.elements[i];
            let data = new IAM_IF_USER_ENTITY();
            
            data.systemCode = "ELOQUA";         // 고정값 "ELOQUA"
            data.userCode = item.federationId;  // 사번
            data.affiliateCode = "XXXX";        // 고정값
            data.ssoUserId = item.loginName;    // "ssoUserId": "tim.kim"
            data.userName = item.name;          // "userName": "김홍석"
            data.mailAddr = item.emailAddress;
            data.employeeNo = item.federationId;
            data.korEmployeeNo = item.federationId;
            data.departmentCode = "";           // 엘로코아 없음
            data.departmentName = item.companyDisplayName != undefined ? item.companyDisplayName : "부서명";
            data.effectiveStartYyyymmdd = null;
            data.effectiveEndYyyymmdd = null;
            data.useFlag = "Y";
            data.creationDate = utils.timeConverter("GET_DATE", item.createdAt);
            data.lastUpdateDate = utils.timeConverter("GET_DATE", item.updatedAt);
            data.transmissionId = i+1;                        // 송신ID
            data.transmissionCount = items.total;             // 송신건수 : 한번에  IF 되는 건수 총 합(row 당 동일 값)
            data.interfaceTypeCode = "API";
            data.postingStatusCode = "READY";
            data.transferFlag = "N";
            data.transferDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD hh:mm:ss');

            result.push(data);
        }
    }
    return result;
}

// 1) 사용자
// 운영 최초 전달 - lgepartner.com , lge.com 유저 전체 전송
router.get('/user', function (req, res, next){
    logger.info("[USER] user call");
    console.log("[USER] user call");
    let send_url = "";
    let searchEmail = "";

    let queryString = {};
    queryString['depth'] = "complete";
    
    if(req.body.data != undefined){
        for(let i in req.body.data) 
            searchEmail += "emailAddress='" + req.body.data[i].email + "'";
        queryString['search'] = searchEmail;
    }else{
        queryString['search'] = "emailAddress='*@lgepartner.com'emailAddress='*@lge.com'";  //
    }
    
    lge_eloqua.system.users.get(queryString).then(async (result) => {
        logger.debug(result.data);
        let return_data = {};
        let user_data = CONVERT_IAM_USER_DATA(result.data); 

        if (user_data.length > 0) {

            return_data['systemId'] = "ELOQUA";
            return_data['x-apikey'] = "X1";
            return_data['gubun'] = "Q";
            return_data['data'] = user_data;
            logger.info("[USER] user_data : " + JSON.stringify(user_data));

            // 개발 URL
            // send_url = "https://dev-apigw-ext.lge.com:7221/gateway/lgiam_api/api2api/api/v1/saveIamIfUser.do"

            // 운영 URL
            send_url = "https://apigw-ext.lge.com:7211/gateway/lgiam_api/api2api/api/v1/saveIamIfUser.do"

            let headers = {
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
            
            let result = await request(options, async function (error, response, body) {
                console.log(response);
                if (error) {
                    console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
                    console.log(error);
                    logger.error("[USER] RESPONSE ERROR : " + body);
                }
                if (response.statusCode != 200) {
                    logger.error("[USER] RESPONSE ERROR : " + body);
                }

                if (!error && response.statusCode == 200) {
                    logger.info("[USER] " + JSON.stringify(body)); 
                    res.json(body);
                }
            });
        }
        else {
            logger.info("[USER] user data length : 0"); 
            res.json(body);
        }
    }).catch((err) => {
        console.error(err);
        logger.error("[USER] RESPONSE ERROR : " + err);
        res.json(err);
    }); 
});


// #region IAM User Responsibility Endpoint 호출 영역
function CONVERT_IAM_USER_RESPONSIBILITY_DATA(_eloqua_items) {
    let result = [];
    let items = _eloqua_items; 
    let transId = 1;    // transmisionId 값

    if (items != null && items.total > 0) { 
        for (let i = 0; i < items.elements.length; i++) { 
            let item = items.elements[i];
            // console.log("사번 " + item.federationId + " : " + JSON.stringify(item.securityGroups));

            for (let j = 0; j < item.securityGroups.length; j++) {
                let security_data = item.securityGroups[j];                 
                if (security_data.name.split('_').length != 3) 
                    continue;    // AS_MC_Marketer 형식만 전달

                let data = new IAM_IF_USER_RESPONSIBILITY_ENTITY();
                data.systemCode = "ELOQUA";
                data.userCode =  item.federationId;             // 사번
                data.responsibilityCode = security_data.name.split('_')[2];
                data.responsibilityOptionCode = security_data.id;
                data.useFlag = "Y";
                data.attribute6 =  security_data.name.split('_')[0];
                data.attribute7 =  security_data.name.split('_')[1];
                data.creationDate = utils.timeConverter("GET_DATE", item.createdAt);
                data.lastUpdateDate = utils.timeConverter("GET_DATE", item.updatedAt);  
                data.transmissionId = transId;
                data.transmissionCount = items.total;
                data.interfaceTypeCode = "API";
                data.postingStatusCode = "READY";
                data.postingDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD hh:mm:ss');
                data.transferFlag = "N";
                data.transferDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD hh:mm:ss');

                transId = transId + 1;
                result.push(data);
            }
        }
    }
    return result;
}

// 2) 사용자 권한
router.get('/user_responsibility', function (req, res, next) {
    logger.info("call user reponsibilty !");
    console.log("call user reponsibilty !");

    let send_url = "";
    let queryString = {};
    queryString['depth'] = "complete";
    
    if(req.body.data != undefined){
        let searchEmail = "";
        for(let i in req.body.data)
            searchEmail += "emailAddress='" + req.body.data[i].email + "'";
        queryString['search'] = searchEmail;
    }else{
        queryString['search'] = "emailAddress='*@lgepartner.com'emailAddress='*@lge.com'";
    }

    lge_eloqua.system.users.get(queryString).then(async (result) => {
        let return_data = {};

        let user_responsibility_data = CONVERT_IAM_USER_RESPONSIBILITY_DATA(result.data);
        
        user_responsibility_data =  await get_IAM_USER_RESPONSIBILITY_SET_TOTAL_COUNT(user_responsibility_data);  // 각 row 의 transmissionCount 를 전체 row 를 맞게 다시 세팅

        if (user_responsibility_data.length > 0) {
            return_data['systemId'] = "ELOQUA";
            return_data['x-apikey'] = "X1";
            return_data['gubun'] = "Q";
            return_data['data'] = user_responsibility_data;

            // 개발 URL
            // send_url = "https://dev-apigw-ext.lge.com:7221/gateway/lgiam_api/api2api/api/v1/saveIamIfUserResponsibility.do";
            
            // 운영 URL
            send_url = "https://apigw-ext.lge.com:7211/gateway/lgiam_api/api2api/api/v1/saveIamIfUserResponsibility.do";

            let headers = {
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

            let result = await request(options, async function (error, response, body) { 
                if (error) {
                    logger.error("[USER RESPONSIBILITY] RESPONSE ERROR : " + error);
                    // console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
                    console.log(error);
                }
                if (!error && response.statusCode == 200) {
                    logger.info("[USER RESPONSIBILITY] " + body); 
                    res.json(body);
                }
            });
        }
        else {
            logger.error("[USER RESPONSIBILITY] data length : 0");
            res.json(body);
        }
    }).catch((err) => {
        logger.error("[USER RESPONSIBILITY] RESPONSE ERROR : " + err);
        res.json(err);
    });
});

//#endregion

// 송신건수
function get_IAM_USER_RESPONSIBILITY_SET_TOTAL_COUNT(user_responsibility_data){
    for(let i = 0 ; i < user_responsibility_data.length ; i++  ){
        user_responsibility_data[i].transmissionCount = user_responsibility_data.length;
    }
    return user_responsibility_data;
} 

//#region IAM Responsibility Endpoint 호출 영역
function CONVERT_IAM_RESPONSIBILITY_DATA(_eloqua_items) {
    let result = [];
    let items = _eloqua_items; 
    
    if (items != null && items.total > 0) {
        for (let i = 0; i < items.elements.length; i++) {
            let item = items.elements[i];

            let data = new IAM_IF_RESPONSIBILITY_ENTITY();

            if(item.name.split('_').length != 3) {
                delete items.elements[i]; 
                continue;
            }

            data.systemCode = "ELOQUA";
            data.responsibilityCode = item.name.split('_')[2];
            data.responsibilityOptionCode = item.id;
            data.responsibilityName = item.name.split('_')[2];
            data.respAffiliateMngFlag = "Y";
            data.creationDate = utils.timeConverter("GET_DATE", item.createdAt);
            data.lastUpdateDate = utils.timeConverter("GET_DATE", item.updatedAt);
            data.transmissionId = i;                                                // 100개 전송 시 1~100 순차로 전송 (전송 순번)
            data.transmissionCount = items.total;                                   // 총 송신 건수
            data.interfaceTypeCode = "API";
            data.postingStatusCode = "READY";
            data.transferFlag = "N";
            data.transferDate = moment().tz('Asia/Seoul').format('YYYY-MM-DD hh:mm:ss');  // 전송일자

            switch (data.responsibilityCode) {  // "attribute4": 승인자 사번 >> 사업부별 관리자 사번 전달
                case "ID":
                case "IT":
                    data.attribute4 = "268965" //  // ID / IT : 서판규 선임 268965
                    break;

                case "Solar":
                case "CM":
                case "CLS":
                    data.attribute4 = "261922" // Solar / CM / CLS / Solution  김효진 선임 261922
                    break;

                case "AS":
                    data.attribute4 = "255147" // AS : 김정준 선임 255147
                    break;

                case "KR":
                    data.attribute4 = "239827" // KR : 박종명 책임 239827 
                default:
                    data.attribute4 = "268965" // HQ 서판규 선임 268965
                    break;
            }

            data.attribute6 = item.name.split('_')[0];
            data.attribute7 = item.name.split('_')[1];

            result.push(data);
            console.log(item.name);
        }
    }
    return result;
}

// 송신건수 수정
function get_IAM_RESPONSIBILITY_SET_TOTAL_COUNT(responsibility_data){
    for(let i = 0 ; i < responsibility_data.length ; i++ ){
        responsibility_data[i].transmissionCount = responsibility_data.length;
        responsibility_data[i].transmissionId = i+1;
    }
    return responsibility_data;
} 

// 3) 권한 (보안그룹) : 운영 최초 전달 22-11-17 권한 전체 전송 (614건)
router.get('/responsibility', async function (req, res, next) {
    console.log('call responsibility !');
    logger.info("[RESPONSIBILITY] call reponsibilty");

    let queryString = {
        depth: "complete"  //["minimal", "partial " ,"complete"] 
    };

    lge_eloqua.system.users.security_groups(queryString).then(async (result) => {
        let send_url = ""; 
        let return_data = {};
        let responsibility_data = CONVERT_IAM_RESPONSIBILITY_DATA(result.data);
        responsibility_data = get_IAM_RESPONSIBILITY_SET_TOTAL_COUNT(responsibility_data);

        if (responsibility_data.length > 0) {

            return_data['systemId'] = "ELOQUA";
            return_data['x-apikey'] = "X1";
            return_data['gubun'] = "Q";
            return_data['data'] = responsibility_data;
            // res.json(return_data);

            // 개발 URL
            // send_url = "https://dev-apigw-ext.lge.com:7221/gateway/lgiam_api/api2api/api/v1/saveIamIfResponsibility.do";

            // 운영 URL
            send_url = "https://apigw-ext.lge.com:7211/gateway/lgiam_api/api2api/api/v1/saveIamIfResponsibility.do";

            let headers = {
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

            let result = await request(options, async function (error, response, body) {
                console.log(response);
                if (error) {
                    logger.error("[RESPONSIBILITY] RESPONSE ERROR : " + error);
                    console.log("에러에러 (wise 점검 및 인터넷 연결 안됨)");
                    console.log(error);
                }
                if (!error && response.statusCode == 200) {
                    result = body; 
                    console.log(body);
                    logger.info("[RESPONSIBILITY] RESPONSE : " + body.msg); 
                    res.json(body);
                }
            })
        }
        else {
            logger.info("[RESPONSIBILITY] data length : 0");
            res.json(body);
        }
    }).catch((err) => {
        logger.error("[RESPONSIBILITY] RESPONSE ERROR : " + err);
        console.error(err);
    });
});
//#endregion

// 4) IAM TO ELOQUA 
// 송신은 변경 있을 때만
// 운영 -> 매시 15분마다 하기
// ================================================================================================
router.get('/authResponseList', async function (req, res, next) {
    await authRespList();            
});

async function authRespList(){ 
    logger.info("call authResponseList ! ");
    console.log("call authResponseList ! ");

    let convert_user_data = "";
    let patchMethod = "";
    let response_data = [];
    let send_url = "";

    let param = {};
    param['systemId'] = "ELOQUA";
    param['x-apikey'] = "X1";
    param.gubun = "Q";
    
    // 개발 URL
    // send_url = "https://dev-apigw-ext.lge.com:7221/gateway/lgiam_api/api2api/api/v1/authRespList.do";
    
    // 운영 URL 
    send_url = "https://apigw-ext.lge.com:7211/gateway/lgiam_api/api2api/api/v1/authRespList.do";

    let headers = {
        'Content-Type': "application/json",
        'x-Gateway-APIKey': "da7d5553-5722-4358-91cd-9d89859bc4a0"
    }

    options = {
        url: send_url,
        method: "POST",
        headers: headers,
        body: param,
        json: true
    };

    let result = request(options, async function (error, response, body) {
        if (error) { 
            logger.error("[AUTH_RESPONSE] ERROR : " + body); 
            // res.json(body);
        }
        if (response.statusCode != 200) {
            logger.error("[AUTH_RESPONSE] ERROR : " + body);
            // res.json(body);
        }

        if (!error && response.statusCode == 200) {
            // logger.info("[AUTH_RESPONSE] " + JSON.stringify(body));
            if(body.data.length > 0){
                for(let i = 0; i < body.data.length; i++){ 
                    let result_msg = '';
                    let eloqua_id = await getEloquaUserId(body.data[i].mailAddr); 
                    
                    if(body.data[i].suspResignFlag === 'RT'){ 
                        logger.info("[AUTH_RESPONSE] DELETE USER : " + body.data[i].mailAddr);
                        
                        if(eloqua_id === 0){
                            result_msg = "S";
                            logger.info(JSON.stringify(body.data[i]))
                        }else{
                            await lge_eloqua.system.users.delete(eloqua_id).then((rs)=>{
                                result_msg = 'S'; 
                            }).catch((err)=>{
                                
                                if (err.message.includes("Dependencies Found")){
                                    result_msg = 'S';
                                    logger.error("[Dependencies Found] 활성화 유저 : " + JSON.stringify(body.data[i]));
                                }else{
                                    result_msg = 'F';
                                    logger.error("[ERROR] user delete : " + JSON.stringify(err.message));
                                    logger.error(JSON.stringify(body.data[i]));
                                }
                            });
                        }
                    }else{
                        convert_user_data = await CONVERT_ELOQUA_USER(body.data[i]); 
    
                        // 생성 구분 -  NEW DELETE UNCHANGE 
                        switch(body.data[i].dtlRespReqTypeCd){
                            case 'NEW':
                                if (eloqua_id == 0){
                                    // 유저 정보가 없을 경우 생성 후 권한 추가
                                    await lge_eloqua.system.users.create(convert_user_data).then(async (result) => {
                                        patchMethod = "add";
                                        result_msg = await addSecurityGroups(patchMethod, result.data.id, convert_user_data.securityGroups[0].id);
                                    }).catch((err) => {
                                        result_msg = 'F';
                                        logger.info('[ERROR] CREATE USER ERROR : ' + JSON.stringify(err.message));
                                    });
                                }else{
                                    await lge_eloqua.system.users.update(eloqua_id, convert_user_data).then(async (result) => {
                                        patchMethod = "add";
                                        result_msg = await addSecurityGroups(patchMethod, eloqua_id, convert_user_data.securityGroups[0].id);
                                    }).catch((err) => {
                                        result_msg = 'F';
                                        logger.info('[ERROR] CREATE USER ERROR : ' + JSON.stringify(err.message));
                                    });
                                }
                                break;
    
                            case 'UNCHANGE': 
                                // logger.info("[UNCHANGE] data : " + JSON.stringify(body.data[i]));   // 변경X
                                result_msg = 'S';
                                break;
    
                            case 'DELETE':
                                if (eloqua_id === 0) continue;  // 유저 정보가 없을 경우 삭제 진행 X
                                patchMethod = "remove";
                                result_msg = await addSecurityGroups(patchMethod, eloqua_id, convert_user_data.securityGroups[0].id);
                                break; 
                        } 
                    }
    
                    if(result_msg === 'F') logger.info("[AUTH_RESPONSE] return 'F' : " + JSON.stringify(body.data[i]));  // 실패 데이터 로그
                    response_data.push({
                        'id' : body.data[i].id,
                        'result' : result_msg
                    });
                }
    
                // 유관 시스템이 요청한 권한 승인 데이터 송신 결과 회신
                if(response_data.length > 0){
                    let return_param = {};
                    return_param['systemId'] = "ELOQUA";
                    return_param['x-apikey'] = "X1";
                    return_param.gubun = "S";
                    return_param.data = response_data; 
    
                    return_options = {
                        url: send_url,
                        method: "POST",
                        headers: headers,
                        body: return_param,
                        json: true
                    };
    
                    let return_result = request(return_options, async function (error, response, body){
                        if (error) { 
                            logger.error("[AUTH_RESPONSE] ERROR : " + body); 
                        }
                        if (response.statusCode != 200) {
                            logger.error("[AUTH_RESPONSE] ERROR : " + body);
                        }
                        if (!error && response.statusCode == 200) {
                            console.log(body);
                            logger.info("[AUTH_RESPONSE] 송신 결과 회신 : " + JSON.stringify(body));
                            // res.json(body);
                        }
                    }); 
                } 
            }else{
                logger.info("[AUTH_RESPONSE] data length : 0 => " + JSON.stringify(body));
                // res.json(body);
            }
        }
    }); 
}

// 권한 추가 및 삭제 
async function addSecurityGroups(patchMethod, user_id, security_id){ 
    let returnMsg = '';
    let user = {};
    user = {
        "patchMethod" : patchMethod,
        "user": {
            "id": user_id
        }
    };

    await lge_eloqua.system.users.security_groups_add_remove(security_id, user).then((rs)=>{
        logger.info("[AUTH_RESPONSE]" + JSON.stringify(rs.data));
        returnMsg = 'S';
    }).catch((err)=>{
        logger.error("[AUTH_RESPONSE] [ERROR] security_groups_add_remove : " + err.message);
        returnMsg = 'F';
    });

    return returnMsg; 
}

// 엘로코아 데이터 형식으로 변환
async function CONVERT_ELOQUA_USER(item){
    // 하나씩 변환 
    let data = new ELOQUA_USER_ENTITY();
    data.ssoOnly = "True";
    data.isDisabled = "False";
    data.passwordExpires = "False" ;     // 넘어온 데이터에 상관없이 추가적으로 들어가야 할 필드

    // data.id = item.id;
    data.emailAddress = item.mailAddr;
    data.firstName = item.firtName;
    data.lastName = item.lastName;
    data.loginName = item.ssoId;
    data.name = item.empName;
    data.address1 = "";
    data.address2 = "";
    data.cellPhone = item.moblTel;
    data.city = "";
    data.companyDisplayName = "";       // 회사 표시 이름
    data.companyUrl = "";
    data.country = item.nationality;    // nationality : 국적코드
    data.department = item.orgName;
    data.fax = item.faxTem;
    data.federationId = item.empNo;
    data.jobTitle = item.titleName;
    data.personalMessage = "";
    data.personalPhotoId = "";
    data.personalUrl = "";
    data.phone = item.workTel;
    data.replyToAddress = "";                      // 전자메일 회신대상 주소
    data.senderDisplayName = item.ssoId;           // 전자 메일 발신자 표시 이름
    data.senderEmailAddress = item.mailAddr;       // 전자메일 발신자 주소

    securitygroup_name = item.attribute6 + "_" + item.attribute7 + "_" + item.respName; 
    scgroups = {
        "id" : await getSecuritygroupId(securitygroup_name),
        "name": securitygroup_name
    };
    data.securityGroups.push(scgroups); 

    return data; 
}

// 엘로코아 유저 아이디
async function getEloquaUserId(email){ 
    let queryString = {};
    let eloqua_user_id = "";

    queryString['search'] = "emailAddress='" + email + "'";
    await lge_eloqua.system.users.get(queryString).then((rs) => {
        // logger.info('[USER] ' + JSON.stringify(rs.data));
        if(rs.data.elements && rs.data.elements.length > 0){
            eloqua_user_id = rs.data.elements[0].id;
        }else{
            eloqua_user_id = 0;
        }
    }).catch((err) => {
        console.error(err);
    });
    return eloqua_user_id;
}

// 권한 (보안그룹) ID
async function getSecuritygroupId(name){
    let responsibilityId = ""; 

    let queryString = {};
    queryString = {
        'depth' : 'complete',
        'search' : "name='" + name + "'"
    };

    await lge_eloqua.system.users.security_groups(queryString).then((rs)=>{ 
        responsibilityId = rs.data.elements[0].id;
    }).catch((err)=>{
        console.error(err.message);
    }); 
    return responsibilityId;
}

// ================================================================================================ end

// [송신] 삭제된 권한에 대한 정보 테스트  >>  삭제된 권한에 대한 정보 XX

router.get('/securityDeleteUserTest', async function (req, res, next) {
    var testEmail = "minhee.jung@lge.com"; 
    console.log(testEmail);

    await logs_test("log_test", testEmail);

    let queryString = {};
    queryString = {
        'depth' : 'complete',
        'search' : "emailAddress='" + testEmail + "'"
    };

    await lge_eloqua.system.users.get(queryString).then(async (result) => {
        addSecurityGroups("remove", result.data.elements[0].id, 36)
        console.log(result.data);
    }).catch((err)=>{
        console.log(err);
    });
});

// ================================================================================================





//====================================================
//Create는 되나 보안그룹은 별도 API 
//Product 메뉴 비활성화 되어있음 체크 방법 찾아야함
//====================================================
//#region (진행중) IAM USER Create Endpoint 호출 영역

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

// async function CREATE_UPDATE_GUBUN_DATA(data_list ) {
//     let convert_data = [];

//     // console.log(data_list);
//     for(const item of data_list){
//         let email = item.EMAIL ;
//         let queryString = {};
//         queryString['search'] = "emailAddress='" + email + "'";

//         await lge_eloqua.system.users.get(queryString).then((result) => {
//             if(result.data.elements && result.data.elements.length > 0){
//                 item.GUBUN = "UPDATE";
//                 item.ID = result.data.elements[0].id;
//                 console.log(result.data.elements[0]);
//                 convert_data.push(item);
//             }else{
//                 item.GUBUN = "CREATE";
//                 convert_data.push(item);
//             }
//         }).catch((err) => {
//             item.GUBUN = "CREATE";
//             convert_data.push(item);
//         });
//     }

//     return convert_data;
    
// }

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

router.post('/test_update', function (req, res, next) {
    console.log(1234);
    let overlap_remove_data = OVERLAP_REMOVE_IAM_RESPOSIBILITY(req.body , res);
    let convet_data = Convert_IAM_TO_ELOQUA_DATA(overlap_remove_data)
    res.json(convet_data);
    // req_res_logs("update_eloqua", overlap_remove_data);
    // req_res_logs("update_convert", convet_data);
 
    for(const create_item of convert_data){
        lge_eloqua.system.users.create(create_item).then( async (result) => {

            if(result.data){
                console.log(result.data);
                // req_res_logs("create_after", result_data);
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

    lge_eloqua.system.users.getOne(req.params.id).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
        res.json(err);
    });
});

router.get('/user/test_Search', function (req, res, next) {

    // Request body 참고 URL : https://docs.oracle.com/en/cloud/saas/marketing/eloqua-rest-api/op-api-rest-2.0-system-user-post.html
    console.log("/user/test_Search");
    let email = req.query.email;
    let queryString = {};
    queryString['search'] = "emailAddress='" + email +"'";
    queryString['search'] = "isDisabled='True'";
    queryString['depth'] = "minimal";   // minimal complete

    lge_eloqua.system.users.get(queryString).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
        res.json(err);
    });
});

router.get('/user/test_enabled', function (req, res, next) {

    // Request body 참고 URL : https://docs.oracle.com/en/cloud/saas/marketing/eloqua-rest-api/op-api-rest-2.0-system-user-id-enabled-put.html
    console.log("/user/test_enabled");

    let id = 49;
    let email = req.query.email;
    let enabled = {
        "enabled": false
    }

    lge_eloqua.system.users.userEnabled(id, enabled).then((result) => {
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
//    "user_id" : 248 ,
//    "security_groupID" : 67 
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
    var name = "CM_HQ_Agency";
    var queryString = {
        'search' : "name='" + name + "'",
        'depth': "complete" //["minimal", "partial " ,"complete"]
    }
    lge_eloqua.system.users.security_groups(queryString).then((result) => {
        res.json(result.data);

        //console.log(request_data)

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
module.exports.authRespList = authRespList;