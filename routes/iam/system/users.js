var express = require('express');
var router = express.Router();

async function getIDs(email_list, depth , api_type){
  
  var queryString = {};
  var emailString = "?";
  for(var i = 0 ; email_list.length > i ; i++ ){
    emailString += "emailAddress='" + email_list[i] + "'";
  }
  queryString['search'] = emailString;
  queryString['depth'] = depth ? depth : "";

  console.log(queryString);
  var data ;
  await bscard_eloqua.data.contacts.get(queryString).then((result) => { 
    // console.log(result.data);
    console.log(result.data.total);
    if(result.data.total > 0 ){

      if(api_type == 'data') data =  result.data.elements.map(function(k){   return k.id;   });
      else if(api_type == 'id') data = result.data;
      // console.log(data);
    }
  }).catch((err) => {
    console.error(err);
    
  });
  return data;
}

/* Users */
router.get('/', function (req, res, next) {
  var queryString = {}
  var queryText = "";

  queryString['search'] = "loginName='Stephanie.An'";
  queryString['depth'] = "partial"; //["minimal", "partial " ,"complete"]
  //federationId LG전자 사번 ( 페더레이션 ID )
  //queryString['count'] = 10;
  //queryString['page'] = 1;
  
    iam_eloqua.system.users.get(queryString).then((result) => {
      console.log(result.data);
      
      res.json(result.data);
    }).catch((err) => {
      console.error(err);
    });
});

// test folder id = 5452 , id = 248
router.get('/one/:id', function (req, res, next) {
  var queryString = {
    depth : "complete"
  }
    iam_eloqua.system.users.getOne(req.params.id , queryString).then((result) => {
      console.log(result.data);
      res.json(result.data);
    }).catch((err) => {
      console.error(err);
    });
});

router.post('/create', function (req, res, next) {
  console.log(123);
    // var instance = {
    //   loginName: "jtt.Lim",
    //   emailAddress: "limsoftz1@naver.com",
    //   name : "jtt Lim"

    // }

    // var instance = {
    //   companyDisplayName: "TechnologyPartnerGoldenPlanet",
    //   companyUrl: "http://www.goldenplanet.co.kr/",
    //   passwordExpires: "False",
    //   type: "User",
    //   name: "Jtt Lim",
    //   emailAddress: "jtlim@goldenplanet.co.kr",
    //   loginName: "Jtt.Lim",
    //   firstName: "jtt",
    //   lastName: "lim",
      
    // }
    iam_eloqua.system.users.create( req.body).then((result) => {
        console.log(result.data);
        res.json(result.data);
      }).catch((err) => {
        console.error(err);
        res.json(false);
      });
});

router.put('/update/:id', function (req, res, next) {

    iam_eloqua.system.users.update(req.params.id, req.body ).then((result) => {
        console.log(result.data);
        res.json(result.data);
      }).catch((err) => {
        console.error(err);
      });
});

router.delete('/delete/:id', function (req, res, next) {
    iam_eloqua.system.users.delete(req.params.id).then((result) => {
        console.log(result.data);
        res.json(result.data);
      }).catch((err) => {
        console.error(err);
      });
});

function GetSecurityGroupSearchText(_dp, _cp, _ru) {
  var result = "";

  // switch( _dp)
  // {
  //   case "ALL":       result = "*";         break;
  //   case "AS":        result = "AS";        break;
  //   case "CLS":       result = "CLS";       break;
  //   case "CM":        result = "CM";        break;
  //   case "ID":        result = "ID";        break;
  //   case "IT":        result = "IT";        break;
  //   case "Solar":     result = "Solar";     break;
  //   case "Solution":  result = "Solution";  break;
  // }
  //사업부 [ AS , CLS , CM , ID , IT , Solar , Solution ]
  if (_dp == "ALL") {
    result = "*";
  }
  else {
    result = _dp;
  }

  if (_cp == "ALL") {
    result += "_*";
  }
  else {
    result += "_" + _cp;
  }

  if (_ru == "ALL") {
    result += "_*";
  }
  else {
    result += "_" + _ru;
  }

  return result;
}

router.get('/security_groups/:dp/:cp/:ru', function (req, res, next) {
  //부서 DP
  var dp_name = req.params.dp;
  //법인 CP
  var cp_name = req.params.cp;
  //룰 RU
  var ru_name = req.params.ru;

  var search_value = GetSecurityGroupSearchText(dp_name, cp_name, ru_name);

  console.log(search_value);
  var queryString = {
    search : search_value,
    depth : "partial" //["minimal", "partial " ,"complete"]
    //depth : "complete"
  }
    iam_eloqua.system.users.security_groups(queryString).then((result) => {
      console.log(result.data);
      res.json(result.data);
    }).catch((err) => {
      console.error(err);
    });
});

//=====================================================================================================================================================================================================
// 2021-02-09
// IAM 테이블 연동 관련 API Endpoint 정의
// IAM USER TABLE
// IAM USER REPONSIBILITY
// IAM RESPONSIBILITY
//=====================================================================================================================================================================================================

function IAM_IF_USER_ENTITY() {
  this.IF_USER_ID = 0;            // number pk Interface 사용자 테이블 ID (1000 + Elouqa UserID {0000 4자리})
  this.SYSTEM_CODE = "ELOQUA";    // "ELOQUA"
  this.USER_CODE = "";            // federationId 사번
  this.USER_NAME = "";            // name
  this.MAIL_ADDR = "";            // emailAddress
  this.EMPLOYEE_ENG_NAME = "";    // loginName
  this.DEPARTMENT_NAME = "";      // department
  this.POSITION_NAME = "";        // jobTitle
  this.USE_FLAG = "Y";            // isDisabled  Y/N  사용하는 값만 전달 하기로 함
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
  this.IF_USER_RESPONSIBILITY_ID = 0;            // number pk Interface 사용자 테이블 ID (1000 + Elouqa UserID {0000 4자리})
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

router.get('/user', function (req, res, next) {
  var queryString = {}
  var queryText = "";

  queryString['search'] = "loginName='Stephanie.An'";
  queryString['depth'] = "partial"; //["minimal", "partial " ,"complete"]
  //federationId LG전자 사번 ( 페더레이션 ID )
  //queryString['count'] = 10;
  //queryString['page'] = 1;
  
    iam_eloqua.system.users.get(queryString).then((result) => {
      console.log(result.data);
      res.json(result.data);
    }).catch((err) => {
      console.error(err);
    });
});

function CONVERT_IAM_RESPONSIBILITY_DATA(_eloqua_items)
{
  var result = {};
  var eloqua_items = _eloqua_items;

  
  return result;
}

router.get('/responsibility', function (req, res, next) {

  //Eloqua 전체 security_groups 조회
  var queryString = {
    search : search_value,
    depth : "partial" //["minimal", "partial " ,"complete"]
    //depth : "complete"
  }
    iam_eloqua.system.users.security_groups(queryString).then((result) => {

      console.log(result.data);

      var request_data = CONVERT_IAM_RESPONSIBILITY_DATA(result.data);

      res.json({ ContentList: request_data });

    }).catch((err) => {
      console.error(err);
    });


  var security_groups_data = await get_b2bgerp_global_bant_data();

  // res.json(contacts_data);
  // return;
  if (security_groups_data != null) {
    //Eloqua Contacts
    //business_department ( AS , CLS , CM , ID , IT , Solar , Solution, Kr )
    var request_data = Convert_B2BGERP_GLOBAL_DATA(contacts_data, business_name);

    res.json({ ContentList: request_data });

    return;
  }
  else {
    res.json(false);
  }
  //API Gateway 데이터 전송

  //Log
  //res.json(true);
  return;


  //부서 DP
  var dp_name = req.params.dp;
  //법인 CP
  var cp_name = req.params.cp;
  //룰 RU
  var ru_name = req.params.ru;

  var search_value = GetSecurityGroupSearchText(dp_name, cp_name, ru_name);

  console.log(search_value);
  var queryString = {
    search : search_value,
    depth : "complete"
    //depth : "complete"
  }
    iam_eloqua.system.users.security_groups(queryString).then((result) => {
      console.log(result.data);
      res.json(result.data);
    }).catch((err) => {
      console.error(err);
    });
});

router.get('/user_responsibility', function (req, res, next) {
  var queryString = {}
  var queryText = "";

  queryString['search'] = "loginName='Stephanie.An'";
  queryString['depth'] = "partial"; //["minimal", "partial " ,"complete"]
  //federationId LG전자 사번 ( 페더레이션 ID )
  //queryString['count'] = 10;
  //queryString['page'] = 1;
  
    iam_eloqua.system.users.get(queryString).then((result) => {
      console.log(result.data);
      
      res.json(result.data);
    }).catch((err) => {
      console.error(err);
    });
});
















module.exports = router;
