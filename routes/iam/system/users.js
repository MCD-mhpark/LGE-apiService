var moment = require('moment-timezone');
var utils = require('../../common/utils');
var express = require('express');
var request = require('request');
var router = express.Router();

//=====================================================================================================================================================================================================
// Last Update Date : 2021-02-10
// IAM 테이블 연동 관련 API Endpoint 정의
// IAM USER TABLE
// IAM USER REPONSIBILITY
// IAM RESPONSIBILITY
//=====================================================================================================================================================================================================

//#region IAM ENTITY 정의 함수 영역

function IAM_IF_USER_ENTITY() {
    this.IF_USER_ID = 0;            	// number pk Interface 사용자 테이블 ID (1000 + Elouqa UserID {0000 4자리})
    this.SYSTEM_CODE = "ELOQUA";    	// "ELOQUA"
    this.USER_CODE = "";            	// federationId 사번
    this.USER_NAME = "";            	// name
    this.MAIL_ADDR = "";            	// emailAddress
    this.EMPLOYEE_ENG_NAME = "";    	// loginName
    this.DEPARTMENT_NAME = "";      	// department
    this.POSITION_NAME = "";        	// jobTitle
    this.USE_FLAG = "Y";            	// isDisabled  Y/N  사용하는 값만 전달 하기로 함
    this.ATTRIBUTE1 = "";
    this.ATTRIBUTE2 = "";
    this.ATTRIBUTE3 = "";
    this.ATTRIBUTE4 = "";
    this.ATTRIBUTE5 = "";
    this.ATTRIBUTE6 = "";
    this.ATTRIBUTE7 = "";
    this.ATTRIBUTE8 = "";
    this.ATTRIBUTE9 = "";
    this.ATTRIBUTE10 = "";
    this.ATTRIBUTE11 = "";
    this.ATTRIBUTE12 = "";
    this.ATTRIBUTE13 = "";
    this.ATTRIBUTE14 = "";
    this.ATTRIBUTE15 = "";
    this.CREATION_DATE = "";        //createdAt  생성일자
    this.CREATED_BY_CODE = "";      //createdBy  생성자코드
    this.LAST_UPDATE_DATE = "";     //updatedAt  최종수정일자
    this.LAST_UPDATED_BY_CODE = ""; //updatedBy  최종수정자코드
    this.TRANSMISSION_ID = 0;       //id 송신ID "Eloqua ID"
    this.TRANSMISSION_COUNT = 0;    //total; 전체 송신 건수
    this.INTERFACE_TYPE_CODE = "ELOQUA";  //고정값 "ELOQUA" 
    this.TRANSFER_FLAG = "N";       //고정값 "N"
    this.TRANSFER_DATE = "";        //전송일자
}

function IAM_IF_USER_RESPONSIBILITY_ENTITY() {
    this.IF_USER_RESPONSIBILITY_ID = 0;     // number pk Interface 사용자 테이블 ID (1000 + Elouqa UserID {0000 4자리})
    this.SYSTEM_CODE = "ELOQUA";            //"ELOQUA"
    this.USER_CODE = "";                    //federationId 사번
    this.USER_AFFILIATE_CODE = "";          //"Agency" (룰정보)
    this.USER_CORPORATION_CODE = "";        //"AG" (법인정보)
    this.RESPONSIBILITY_CODE = "";          //Eloqua 권한코드 ID
    this.RESPONSIBILITY_OPTION_CODE = "";   //"AS" (사업부정보)
    this.USE_FLAG = "Y";                    //사용여부 "Y" 고정값 Eloqua에서 사용하는 권한 정보만 전달 함
    this.ATTRIBUTE1 = "";
    this.ATTRIBUTE2 = "";
    this.ATTRIBUTE3 = "";
    this.ATTRIBUTE4 = "";
    this.ATTRIBUTE5 = "";
    this.ATTRIBUTE6 = "";
    this.ATTRIBUTE7 = "";
    this.ATTRIBUTE8 = "";
    this.ATTRIBUTE9 = "";
    this.ATTRIBUTE10 = "";
    this.ATTRIBUTE11 = "";
    this.ATTRIBUTE12 = "";
    this.ATTRIBUTE13 = "";
    this.ATTRIBUTE14 = "";
    this.ATTRIBUTE15 = "";
    this.CREATION_DATE = "";        //createdAt  생성일자 ( Eloqua 보안그룹 생성일 Unix time )
    this.CREATED_BY_CODE = "";      //createdBy  생성자코드 ( Eloqua 보안그룹 생성자 User Key )
    this.LAST_UPDATE_DATE = "";     //updatedAt  최종수정일자 ( Eloqua 보안그룹 수정일 )
    this.LAST_UPDATED_BY_CODE = ""; //updatedBy  최종수정자코드 ( Eloqua 보안그룹 수정자 User Key)
    this.TRANSMISSION_ID = 0;       //송신ID "Eloqua User ID"
    this.TRANSMISSION_COUNT = 0;    //total; 전체 송신 건수
    this.INTERFACE_TYPE_CODE = "ELOQUA";  //고정값 "ELOQUA" 
    this.TRANSFER_FLAG = "N";       //고정값 "N"
    this.TRANSFER_DATE = "";        //전송일자
}

function IAM_IF_RESPONSIBILITY_ENTITY() {
    this.IF_RESPONSIBILITY_ID = 0;            // number pk Interface 사용자 테이블 ID  3000 + Eloqua SecurityID {4자리 0000}
    this.SYSTEM_CODE = "ELOQUA";              // "ELOQUA"
    this.RESPONSIBILITY_CODE = "";            // "48" (ELOQUA 권한 Key 값)
    this.RESPONSIBILITY_OPTION_CODE = "";     // "AS" (사업부정보)
    this.RESPONSIBILITY_NAME = "";            // "AS_AG_Agency" (권한이름)
    this.RESPONSIBILITY_ENG_NAME = "";        // "AS_AG_Agency" (권한이름)
    this.RESP_AFFILIATE_MNG_FLAG = "N";       // "N" 고정값
    this.DOMAIN_CODE = "";                    // "AG" (법인정보)
    this.MODULE_CODE = "";                    // "Agency" (룰정보)
    this.USE_FLAG = "Y";                       // Y , N ( 사용하는 정보만 보냄 Y ) 
    this.ATTRIBUTE1 = "";
    this.ATTRIBUTE2 = "";
    this.ATTRIBUTE3 = "";
    this.ATTRIBUTE4 = "";
    this.ATTRIBUTE5 = "";
    this.ATTRIBUTE6 = "";
    this.ATTRIBUTE7 = "";
    this.ATTRIBUTE8 = "";
    this.ATTRIBUTE9 = "";
    this.ATTRIBUTE10 = "";
    this.ATTRIBUTE11 = "";
    this.ATTRIBUTE12 = "";
    this.ATTRIBUTE13 = "";
    this.ATTRIBUTE14 = "";
    this.ATTRIBUTE15 = "";
    this.CREATION_DATE = "";                //createdAt  생성일자
    this.CREATED_BY_CODE = "";              //createdBy  생성자코드
    this.LAST_UPDATE_DATE = "";             //updatedAt  최종수정일자
    this.LAST_UPDATED_BY_CODE = "";         //updatedBy  최종수정자코드
    this.TRANSMISSION_ID = 0;               //id 송신ID "Eloqua ID"
    this.TRANSMISSION_COUNT = 0;            //total; 전체 송신 건수
    this.INTERFACE_TYPE_CODE = "ELOQUA";    //고정값 "ELOQUA" 
    this.TRANSFER_FLAG = "N";               //고정값 "N"
    this.TRANSFER_DATE = "";                //전송일자
}

function ELOQUA_CREATE_ENTITY() {
    //로그인 정보
    this.name = "";                 //필수값 (한글 가능)
    this.emailAddress = "";         //필수값 (이메일)
    this.loginName = "";            //필수값 "dongjin.shin", ( 영문 LastName + '.' + FirstName)
    this.firstName = "";            //필수값 firstName (한글 가능)
    this.lastName = "";             //필수값 lastName (한글 가능)
    this.federationId = "";         //LG전자 사번 필드
    this.preferences = { "type": "UserPreferences", "timezoneId": "40" };  //시간 한국 시간 설정

    //일반정보 (서명 필드)
    this.companyDisplayName = "1";     //회사 표시 이름:	LGElectronics
    this.companyUrl = "2";             //웹사이트 URL
    this.jobTitle = "3";               //직책
    this.phone = "4";                  //회사 전화	82-02-3777-5546
    this.senderDisplayName = "5";      //전자메일 발신자 표시 이름:	Stephanie An
    this.replyToAddress = "";         //전자메일 회신 대상 주소:	ansy@lgcns.com
    this.department = "7";             //부서
    this.cellPhone = "8";              //휴대폰:	82-10-3931-3352
    this.fax = "9";                    //팩스
    this.address1 = "10";               //주소 1
    this.address2 = "11";               //주소 2
    this.city = "12";                   //구/군/시
    this.state = "13";                  //시/도
    this.country = "14";                //국가
    this.zipCode = "15";                //우편 번호
    this.senderEmailAddress = "";     //전자메일 발신자 주소:	ansy@lgcns.com
    this.personalUrl = "17";            //개인 URL
    this.personalMessage = "18";        //개인 메시지

    //보안그룹
    //   this.securityGroups = [
    //     {
    //       "id" : "80"
    //     }
    //   ];         //보안그룹 리스트

    // 테스트용 보안그룹

    this.securityGroups = {};



    //라이센스 (기본적으로 모두 선택)
    this.productPermissions = [
        {
            "type": "ProductPermission",
            "productCode": "SecureHypersites"
        },
        {
            "type": "ProductPermission",
            "productCode": "EngageiPad"
        },
        {
            "type": "ProductPermission",
            "productCode": "EngageWeb"
        },
        {
            "type": "ProductPermission",
            "productCode": "ProspectProfiler"
        }
    ];

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

            data.IF_USER_ID = GetIFNumber("1000", item.id);          // number pk Interface 사용자 테이블 ID  1000 + Eloqua UserID {4자리 0000}
            data.SYSTEM_CODE = "ELOQUA";                            // 고정값 "ELOQUA"
            data.USER_CODE = GetDataValue(item.federationId);       // 사번 
            data.USER_NAME = GetDataValue(item.name);               // 이름
            data.MAIL_ADDR = GetDataValue(item.emailAddress);       // 이메일
            data.EMPLOYEE_ENG_NAME = GetDataValue(item.loginName);  // 영문 이름 (Eloqua Login)
            data.DEPARTMENT_NAME = GetDataValue(item.department);   // 사업부명
            data.POSITION_NAME = GetDataValue(item.jobTitle);       // 직책명
            data.USE_FLAG = "Y"                                     // 유요한 사용자 만 전달함  고정값 "Y"
            data.ATTRIBUTE1 = "";
            data.ATTRIBUTE2 = "";
            data.ATTRIBUTE3 = "";
            data.ATTRIBUTE4 = "";
            data.ATTRIBUTE5 = "";
            data.ATTRIBUTE6 = "";
            data.ATTRIBUTE7 = "";
            data.ATTRIBUTE8 = "";
            data.ATTRIBUTE9 = "";
            data.ATTRIBUTE10 = "";
            data.ATTRIBUTE11 = "";
            data.ATTRIBUTE12 = "";
            data.ATTRIBUTE13 = "";
            data.ATTRIBUTE14 = "";
            data.ATTRIBUTE15 = "";
            data.CREATION_DATE = utils.timeConverter("GET_DATE", item.createdAt);     //createdAt  생성일자
            data.CREATED_BY_CODE = GetDataValue(item.createdBy);                      //createdBy  해당 유저를 생성한 user id
            data.LAST_UPDATE_DATE = utils.timeConverter("GET_DATE", item.updatedAt);  //updatedAt  최종수정일자
            data.LAST_UPDATED_BY_CODE = GetDataValue(item.updatedBy);                 //updatedBy  해당 유저를 수정한 user id
            data.TRANSMISSION_ID = Number(item.id);                                   //id 송신ID "Eloqua ID"
            data.TRANSMISSION_COUNT = items.total;                                    //total; 전체 송신 건수
            data.INTERFACE_TYPE_CODE = "ELOQUA";                                      //고정값 "ELOQUA" 
            data.TRANSFER_FLAG = "N";                                                 //고정값 "N"
            data.TRANSFER_DATE = moment().tz('Asia/Seoul').format('YYYY-MM-DD hh:mm:ss');              //전송일자

            result.push(data);
        }
    }
    return result;
}

// 최초 연계시 Eloqua 에서 전체 유저 조회 후 IAM 측으로 전달
router.get('/user', function (req, res, next) {
    console.log("user call");
    var queryString = {};

    //queryString['search'] = "loginName='Stephanie.An'";
    //   queryString['search'] = "emailAddress='pk.suh@lge.com'emailAddress='jeongjun.kim@lge.com'emailAddress='doyeon0.kim@lge.com'emailAddress='jong.park@lge.com'emailAddress='goeun2.kim@lge.com'";
    queryString['depth'] = "complete"; //["minimal", "partial " ,"complete"]
    queryString['search'] = "federationId!=''"
    //federationId LG전자 사번 ( 페더레이션 ID )
    //    queryString['count'] = 5;
    //queryString['page'] = 1;


    iam_eloqua.system.users.get(queryString).then(async (result) => {

        // console.log(result.data);

        var return_data = {};

        res.json(result.data);
        return;
        var responsibility_data = CONVERT_IAM_USER_DATA(result.data);
       
        
 
        if (responsibility_data.length > 0) {
            return_data.ContentList = responsibility_data;
            return_data.page = result.data.page;
            return_data.pageSize = result.data.pageSize;
            return_data.total = result.data.total;
            res.json(return_data);
            return;
            //console.log(request_data);
            //res.json({ ContentList: request_data });

            var send_url = "https://dev-apigw-ext.lge.com:7221/gateway/lgiam/api2db/put/SODUSER_SB";
            var headers = {
                'Content-Type': "application/json",
                'x-Gateway-APIKey' : "da7d5553-5722-4358-91cd-9d89859bc4a0"
            }
            
            options = {
                url : send_url,
                method: "POST",
                headers:headers,
                body : return_data ,
                json : true
            };
            
            //return res.json(return_data);
            //최초 연계시 Eloqua 데이터 전체를 IAM 쪽으로 이관
            var result = await request(options, async function (error, response, body) {
        
                // console.log(11);
                // console.log(response);
                if(error){
                    console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
                    console.log(error);
                } 
                if (!error && response.statusCode == 200) {
                    result = body;
                    // console.log(11);
                    console.log(body);
                    
                    res.json(body);
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

//#endregion



//====================================================
//IF_USER_RESPONSIBILITY_ID 시퀀스 수정필요
//====================================================
//#region IAM User Responsibility Endpoint 호출 영역

function CONVERT_IAM_USER_RESPONSIBILITY_DATA(_eloqua_items) {
    var result = [];
    var items = _eloqua_items;

    if (items != null && items.total > 0) {
        for (var i = 0; i < items.elements.length; i++) {

            var item = items.elements[i];

            for (var j = 0; j < item.securityGroups.length; j++) {
                var security_data = item.securityGroups[j];

                // 롤정보는 IAM 측에서 필드 max length 가 4자이기때문에 4자로 자르도록 해서 전송
                // 법인 정보 필드가 IAM 측에서 필드 max length가 8자이기떄문에 9글자가 넘는건 테스트로 제외하고 보내도록 변경
                if(GetCorporationExtraction(security_data.name).length >= 9) continue;

                var data = new IAM_IF_USER_RESPONSIBILITY_ENTITY();
                data.IF_USER_RESPONSIBILITY_ID = GetIFNumber("1000", item.id);                // number pk Interface 사용자 테이블 ID  1000 + Eloqua UserID {4자리 0000}
                data.SYSTEM_CODE = "ELOQUA";                                                 // 고정값 "ELOQUA"
                data.USER_CODE = GetDataValue(item.federationId);                            // 사번 
                data.USER_AFFILIATE_CODE = GetRullExtraction(security_data.name).substring(0,4);            // 룰정보
                data.USER_CORPORATION_CODE = GetCorporationExtraction(security_data.name);   // 법인정보
                data.RESPONSIBILITY_CODE = security_data.id;                                 // Eloqua Security ID
                data.RESPONSIBILITY_OPTION_CODE = GetBusinessExtraction(security_data.name); // 사업부정보
                data.USE_FLAG = "Y"                                                          // 고정값 Y
                data.ATTRIBUTE1 = "";
                data.ATTRIBUTE2 = "";
                data.ATTRIBUTE3 = "";
                data.ATTRIBUTE4 = "";

                data.ATTRIBUTE5 = "";
                data.ATTRIBUTE6 = "";
                data.ATTRIBUTE7 = "";
                data.ATTRIBUTE8 = "";
                data.ATTRIBUTE9 = "";
                data.ATTRIBUTE10 = "";
                data.ATTRIBUTE11 = "";
                data.ATTRIBUTE12 = "";
                data.ATTRIBUTE13 = "";
                data.ATTRIBUTE14 = "";
                data.ATTRIBUTE15 = "";
                data.CREATION_DATE = utils.timeConverter("GET_DATE", item.createdAt);     //createdAt  생성일자
                data.CREATED_BY_CODE = GetDataValue(item.createdBy);                      //createdBy  생성자코드
                data.LAST_UPDATE_DATE = utils.timeConverter("GET_DATE", item.updatedAt);  //updatedAt  최종수정일자
                data.LAST_UPDATED_BY_CODE = GetDataValue(item.updatedBy);                 //updatedBy  최종수정자코드
                data.TRANSMISSION_ID = Number(item.id);                                   //id 송신ID "Eloqua ID"
                data.TRANSMISSION_COUNT = items.total;                                    //total; 전체 송신 건수
                data.INTERFACE_TYPE_CODE = "ELOQUA";                                      //고정값 "ELOQUA" 
                data.TRANSFER_FLAG = "N";                                                 //고정값 "N"
                data.TRANSFER_DATE = moment().tz('Asia/Seoul').format('YYYY-MM-DD hh:mm:ss');              //전송일자
                result.push(data);
            }
        }
    }
    return result;
}


router.get('/user_responsibility', function (req, res, next) {
    var queryString = {}

    //queryString['search'] = "loginName='Stephanie.An'";
    //   queryString['search'] = "emailAddress='pk.suh@lge.com'emailAddress='jeongjun.kim@lge.com'emailAddress='doyeon0.kim@lge.com'emailAddress='jong.park@lge.com'emailAddress='goeun2.kim@lge.com'";
    queryString['depth'] = "complete"; //["minimal", "partial " ,"complete"]
    queryString['search'] = "federationId!=''";
    //queryString['count'] = 5;
    //federationId LG전자 사번 ( 페더레이션 ID )
    //queryString['page'] = 1;
    
    
    iam_eloqua.system.users.get(queryString).then(async(result) => {

        console.log(result.data);
        // res.json(result.data);
        
        var return_data = {};

        var user_responsibility_data = CONVERT_IAM_USER_RESPONSIBILITY_DATA(result.data);
        // console.log(user_responsibility_data);

      
        if (user_responsibility_data.length > 0) {
            return_data.ContentList = user_responsibility_data;
            return_data.total = user_responsibility_data.length;
            // res.json(return_data);
            res.json(return_data);
            return;
            //console.log(request_data);
            //res.json({ ContentList: request_data });

            var send_url = "https://dev-apigw-ext.lge.com:7221/gateway/lgiam/api2db/put/SODUSERRESP_SB";
            var headers = {
                'Content-Type': "application/json",
                'x-Gateway-APIKey' : "da7d5553-5722-4358-91cd-9d89859bc4a0"
            }
          
            options = {
                url : send_url,
                method: "POST",
                headers:headers,
                body : return_data ,
                json : true
            };

            //return res.json(return_data);

            var result = await request(options, async function (error, response, body) {
      
                // console.log(11);
                // console.log(response);
                if(error){
                    console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
                    console.log(error);
                } 
                if (!error && response.statusCode == 200) {
                    result = body;
                    // console.log(11);
                    console.log(body);
                    
                    res.json(body);
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



//====================================================
//IAM_IF_RESPONSIBILITY_ENTITY 시퀀스 수정필요
//====================================================
//#region IAM Responsibility Endpoint 호출 영역

function CONVERT_IAM_RESPONSIBILITY_DATA(_eloqua_items) {
    var result = [];
    var items = _eloqua_items;

    if (items != null && items.total > 0) {
        for (var i = 0; i < items.elements.length; i++) {
            var item = items.elements[i];
            var data = new IAM_IF_RESPONSIBILITY_ENTITY();

            data.IF_RESPONSIBILITY_ID = GetIFNumber("3000", item.id)              // number pk Interface 사용자 테이블 ID  3000 + Eloqua SecurityID {4자리 0000}
            data.SYSTEM_CODE = "ELOQUA";                                          // "ELOQUA"
            data.RESPONSIBILITY_CODE = item.id;                                   // "48" (ELOQUA 권한 Key 값)
            data.RESPONSIBILITY_OPTION_CODE = GetBusinessExtraction(item.name);   // "AS" (사업부정보)
            data.RESPONSIBILITY_NAME = item.name;                                 // "AS_AG_Agency" (권한이름)
            data.RESPONSIBILITY_ENG_NAME = item.name;                             // "AS_AG_Agency" (권한이름)
            data.RESP_AFFILIATE_MNG_FLAG = "N";                                   // "N" 고정값
            data.DOMAIN_CODE = GetCorporationExtraction(item.name);               // "AG" (법인정보)
            data.MODULE_CODE = GetRullExtraction(item.name);                      // "Agency" (룰정보)
            data.USE_FLAG = "Y";                                                  // Y , N ( 사용하는 정보만 보냄 Y ) 
            data.ATTRIBUTE1 = "";
            data.ATTRIBUTE2 = "";
            data.ATTRIBUTE3 = "";
            

            // 사업부별 관리자 사번 전달
            switch(data.RESPONSIBILITY_OPTION_CODE){
                case "ID" : 
                case "IT" :
                data.ATTRIBUTE4 = "268965" //  // ID / IT : 서판규 선임 268965
                break;

                case "Solar" : 
                case "CM" :
                case "CLS" : 
                data.ATTRIBUTE4 = "261922" // Solar / CM / CLS / Solution  김효진 선임 261922
                break;

                case "AS" : 
                data.ATTRIBUTE4 = "255147" // AS : 김정준 선임 255147
                break;

                case "KR" : 
                data.ATTRIBUTE4 = "239827" // KR : 박종명 책임 239827 
                default :
                data.ATTRIBUTE4 = "268965" // HQ 서판규 선임 268965
                break;
            }

            data.ATTRIBUTE5 = "";
            data.ATTRIBUTE6 = GetBusinessExtraction(item.name);
            data.ATTRIBUTE7 = GetCorporationExtraction(item.name);
            data.ATTRIBUTE8 = GetRullExtraction(item.name);
            data.ATTRIBUTE9 = "";
            data.ATTRIBUTE10 = "";
            data.ATTRIBUTE11 = "";
            data.ATTRIBUTE12 = "";
            data.ATTRIBUTE13 = "";
            data.ATTRIBUTE14 = "";
            data.ATTRIBUTE15 = "";
            data.CREATION_DATE = utils.timeConverter("GET_DATE", item.createdAt);      //createdAt  생성일자
            data.CREATED_BY_CODE = GetDataValue(item.createdBy);                                     //createdBy  생성자코드
            data.LAST_UPDATE_DATE = utils.timeConverter("GET_DATE", item.updatedAt);  //updatedAt  최종수정일자
            data.LAST_UPDATED_BY_CODE = GetDataValue(item.updatedBy);         //updatedBy  최종수정자코드
            data.TRANSMISSION_ID = Number(item.id);         //id 송신ID "Eloqua ID"
            data.TRANSMISSION_COUNT = items.total;  //total; 전체 송신 건수
            data.INTERFACE_TYPE_CODE = "ELOQUA";    //고정값 "ELOQUA" 
            data.TRANSFER_FLAG = "N";               //고정값 "N"
            data.TRANSFER_DATE = moment().tz('Asia/Seoul').format('YYYY-MM-DD hh:mm:ss');                //전송일자

            result.push(data);
        }
    }
    return result;
}

router.get('/responsibility', async function (req, res, next) {
    var queryString = {
        //search : search_value,
        depth: "partial", //["minimal", "partial " ,"complete"]
        count: 1000
    }

    iam_eloqua.system.users.security_groups(queryString).then(async(result) => {
      var return_data = {};
        var responsibility_data = CONVERT_IAM_RESPONSIBILITY_DATA(result.data);
        if (responsibility_data.length > 0) {
            
            //console.log(responsibility_data);
            return_data.ContentList = responsibility_data;
            //return_data.elements = responsibility_data;
            return_data.page = result.data.page;
            return_data.pageSize = result.data.pageSize;
            return_data.total = result.data.total;
            console.log(return_data);
            //res.json(return_data);
         
            var send_url = "https://dev-apigw-ext.lge.com:7221/gateway/lgiam/api2db/put/SODRESPONSIBILITY_SB";
            var headers = {
                'Content-Type': "application/json",
                'x-Gateway-APIKey' : "da7d5553-5722-4358-91cd-9d89859bc4a0"
            }
          
            options = {
                url : send_url,
                method: "POST",
                headers:headers,
                body : return_data ,
                json : true
            };

          //return res.json(return_data);

          var result = await request(options, async function (error, response, body) {
      
            // console.log(11);
            // console.log(response);
            if(error){
              console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
              console.log(error);
            } 
            if (!error && response.statusCode == 200) {
              result = body;
              // console.log(11);
              console.log(body);
              
              res.json(body);
            }
          });
            //console.log(request_data);
            //res.json({ ContentList: request_data });
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

function Convert_IAM_TO_ELOQUA_DATA(_body) {

    var body_data = _body;

    var eloqua_data = new ELOQUA_CREATE_ENTITY();

    if( body_data.ContentList != null && body_data.ContentList.length > 0)
    {
        eloqua_data.firstName = body_data.ContentList[0].firstName;
        eloqua_data.lastName = body_data.ContentList[0].lastName;
        eloqua_data.federationId = body_data.ContentList[0].federationId;
        eloqua_data.loginName = body_data.ContentList[0].loginName;
        eloqua_data.name = body_data.ContentList[0].Name;
        eloqua_data.emailAddress = body_data.ContentList[0].emailAddress;
        eloqua_data.address1 = body_data.ContentList[0].ORGAN;   
        eloqua_data.address2 = body_data.ContentList[0].ORGAN_NAME;
        eloqua_data.city = body_data.ContentList[0].MANAGEMENT_ORGAN;
        eloqua_data.state = body_data.ContentList[0].MANAGEMENT_ORGAN_NAME;
        eloqua_data.country = body_data.ContentList[0].X_ORGAN;
        eloqua_data.zipCode = body_data.ContentList[0].X_ORGAN_NAME;
        eloqua_data.jobTitle = body_data.ContentList[0].POSITION_NAME;
        eloqua_data.department = body_data.ContentList[0].DIVISION;

        for(i=0; i<body_data.ContentList.length; i++)
        {
            eloqua_data.security_groups.push( body_data.ContentList[i].RESPONSIBILITY_CODE );
        }

    }

    return eloqua_data;
}

router.post('/user_data', function (req, res, next) {

    var body_data = Convert_IAM_TO_ELOQUA_DATA(req.body);

    iam_eloqua.system.users.create(body_data).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
        res.json(err);
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

    console.log(body_data);

    iam_eloqua.system.users.create(body_data).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
        res.json(err);
    });
});

router.post('/user/securityGroup', async function (req, res, next) {

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
    console.log(req.body);

    var user_id = req.body.user_id;
    var add_sc_list = req.body.security_groupID;

    var remove_sc_list = [];
    remove_sc_list = await get_user_securityGroup(user_id, res);
    console.log(remove_sc_list);
    var result_list = await securityGroup_Process(user_id, remove_sc_list, add_sc_list);
    console.log(result_list);
    // res.json(result_list);
    return;
    iam_eloqua.system.users.security_groups_add_remove(body_id, body_user_data).then((result) => {
        console.log(result.data);
        res.json(result.data);
    }).catch((err) => {
        console.error(err);
        res.json(err);
    });
});

async function get_user_securityGroup(user_id, res) {

    var queryString = {};
    queryString['depth'] = "complete";
    var return_list = [];
    await iam_eloqua.system.users.getOne(user_id, queryString).then(async (result) => {
        if (!result.data.securityGroups) console.log(process, " not data list");
        if (result.data.securityGroups) {

            return_list = result.data.securityGroups.map(row => { return row.id; });
            // console.log(user_securityGroups);
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


    let result_list = [];

    let patch = {
        patchMethod: "remove",
        user: {
            "id": user_id
        }
    }


    let all_list = remove_sc_group.concat(add_sc_group);
    console.log(all_list);
    console.log(all_list.length);
    for (var i = 0; all_list.length > i; i++) {

        let id = all_list[i];


        if (remove_sc_group.length <= i) {
            id = add_sc_group[i - remove_sc_group.length];
            patch.patchMethod = "add";
        }

        console.log("id : " + id);
        console.log("patch.patchMethod : " + patch.patchMethod);

        await iam_eloqua.system.users.security_groups_add_remove(id, patch).then((result) => {
            // console.log(process+ " done");
            console.log("after : remove  , id : " + id);
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

    // await remove_sc_group.forEach(async id => {
    // 	console.log("before : remove  , id : " +  id);
    // 	patch.patchMethod = "remove";
    // 	await iam_eloqua.system.users.security_groups_add_remove( id , patch ).then((result) =>{
    // 		// console.log(process+ " done");
    // 		console.log("after : remove  , id : " +  id);
    // 		result_list.push({
    // 			id : user_id , 
    // 			method : "remove",
    // 			status : 200,
    // 			message : "success"
    // 		})
    // 	}).catch((err) => {
    // 		console.log(err.message);
    // 		result_list.push({
    // 			id : user_id , 
    // 			method : "remove",
    // 			status : err.response.status,
    // 			message : err.message
    // 		})
    // 	})
    // });

    // await add_sc_group.forEach(async id => {
    // 	console.log("before : add  , id : " +  id);
    // 	patch.patchMethod = "add";
    // 	await iam_eloqua.system.users.security_groups_add_remove( id , patch ).then((result) =>{
    // 		// console.log(process+ " done");
    // 		console.log("after : add  , id : " +  id);
    // 		result_list.push({
    // 			id : user_id , 
    // 			method : "add",
    // 			status : 200,
    // 			message : "success"
    // 		})
    // 	}).catch((err) => {
    // 		console.log(err.message);
    // 		result_list.push({
    // 			id : user_id , 
    // 			method : "add",
    // 			status : err.response.status,
    // 			message : err.message
    // 		})
    // 	})
    // });

    return result_list;
}

//#endregion

//#region (진행중) IAM USER Update Endpoint 호출 영역
// router.put('/update/:id', function (req, res, next) {

//     iam_eloqua.system.users.update(req.params.id, req.body ).then((result) => {
//         console.log(result.data);
//         res.json(result.data);
//       }).catch((err) => {
//         console.error(err);
//       });
// });
//#endregion

//#region 위험!! (완료) IAM USER Delete Endpoint 호출 영역

// router.delete('/user/delete/:id', function (req, res, next) {
//     iam_eloqua.system.users.delete(req.params.id).then((result) => {
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
    queryString['depth'] = "partial"; //["minimal", "partial " ,"complete"]
    //federationId LG전자 사번 ( 페더레이션 ID )
    //queryString['count'] = 10;
    //queryString['page'] = 1;

    iam_eloqua.system.users.get(queryString).then((result) => {
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
    iam_eloqua.system.users.security_groups(queryString).then((result) => {
        res.json(result.data);

        //console.log(request_data

    }).catch((err) => {
        console.error(err);
        res.json(false);
    });
});

module.exports = router;
