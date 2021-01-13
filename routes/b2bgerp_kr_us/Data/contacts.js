var express = require('express');
var router = express.Router();



/* Contacts */

function B2B_GERP_KR_ENTITY(){
  this.INTERFACE_ID = "Eloqua",
  this.LEAD_NAME = "";        //리드네임
  this.SITE_NAME = "";				//사이트네임
  this.LEAD_SOURCE_TYPE = "09"	//default 09
  this.ENTRY_TYPE  = "L"        //default L
  this.ACCOUNT = "";          //회사
  this.CONTACT_POINT = "";    //연락처(현업 협의 정의)
  this.CORPORATION = "";      //법인정보
  this.OWNER = "";            //데이터 없음
  this.ADDRESS = "";          //현업확인
  this.DESCRIPTION = "";      //설명 Comments, message, inquiry-to-buy-message 필드 중 하나
  this.ATTRIBUTE_3 = "";      //픽리스트 eloqua 확인 
  this.ATTRIBUTE_4 = "";      //이메일
  this.ATTRIBUTE_5 = "";      //전화번호
  this.ATTRIBUTE_6 = "";      //확인필요
  this.ATTRIBUTE_7 = "";      //지역 - 국가 eloqua filed 정보
  this.ATTRIBUTE_8 = "";      //넷중 하나 또는 4개의 필드 정보 합 ( 확인 필요 )
  this.ATTRIBUTE_10 = "";     //데이터 없음
  this.ATTRIBUTE_11 = "";     //사업부코드( 코드마스터 필요 ) 예) HE    LGE 앞자리 빼는지 확인 필요
  this.REGISTER_DATE = "";    //어떤 날짜 정보인지 확인 필요
  this.TRANSFER_DATE = "";    //어떤 날짜 정보인지 확인 필요
  this.TRANSFER_FLAG = "";		//TRANSFER_FLAG N , Y 값의 용도 확인 필요
  this.LAST_UPDATE_DATE = ""; //데이터 없음
  this.API_G_CODE = "";       //API 구분코드 추가요건 사항
}

// 조건검색 참고 자료
router.get('/:email/:depth', function (req, res, next) {
  var emailAddress =  req.params.email;
  var depth = req.params.depth ; 
  // var queryString = {
  //   search : '?emailAddress=' + emailAddress,
  //   depth : depth,
  // }
  
  var queryString = {
    search : '?emailAddress=' + emailAddress,
    depth : depth,
    count : 1000,
    limit : 1000
  }
  
    b2bkr_eloqua.data.contacts.get(queryString).then((result) => {
      console.log(result.data);
      res.json(result.data);
    }).catch((err) => {
      console.error(err);
    });
});

/* Contacts */
router.get('/', function (req, res, next) {

  // var queryString = {
  //   depth : "complete"
  // }
  
  
    b2bkr_eloqua.data.contacts.get(req.query.queryString).then((result) => {
      res.json(result.data);
    }).catch((err) => {
      console.error(err);
    });
});

router.get('/one/:id', function (req, res, next) {

 
    b2bkr_eloqua.data.contacts.getOne(req.params.id  ).then((result) => {
      console.log(result.data);
      res.json(result.data);
    }).catch((err) => {
      console.error(err);
    });
});

router.post('/create', function (req, res, next) {

    //body 예시
    /*const data = this.#parent._validate(
      [
        'accessedAt',
        'accountId',
        'accountname',
        'address1',
        'address2',
        'address3',
        'bouncebackDate',
        'businessPhone',
        'city',
        'country',
        'createdAt',
        'createdBy',
        'currentStatus',
        'depth',
        'description',
        'emailAddress',
        'emailFormatPreference',
        'fax',
        'fieldValues',
        'firstName',
        'id',
        'isBounceback',
        'isSubscribed',
        'lastName',
        'mobilePhone',
        'name',
        'permissions',
        'postalCode',
        'province',
        'salesPerson',
        'subscriptionDate',
        'title',
        'type',
        'unsubscriptionDate',
        'updatedAt',
        'updatedBy',
      ],
      contact,
    );
    */

    b2bkr_eloqua.data.contacts.create( req.body ).then((result) => {
        console.log(result.data);
        res.json(result.data);
      }).catch((err) => {
        console.error(err);
      });
});

router.put('/update/:id', function (req, res, next) {

    //body 예시
    /*{
        "type": "ContactField",
    "id": "100248",
    "createdAt": "1591600620",
    "createdBy": "9",
    "depth": "complete",
    "name": "SPC_CARD_REGI_DATE",
    "updatedAt": "1591600620",
    "updatedBy": "9",
    "dataType": "date",
    "displayType": "text",
    "internalName": "C_SPC_CARD_REGI_DATE1",
    "isCaseSensitive": "false",
    "isReadOnly": "false",
    "isRequired": "false",
    "isStandard": "false",
    "outputFormatId": "5",
    "isAccountLinkageField": "false",
    "isProtected": "false",
    "showTrustedVisitorsOnly": "true",
    "updateType": "always"
    }*/
 
    b2bkr_eloqua.data.contacts.update(req.params.id, req.body ).then((result) => {
        console.log(result.data);
        res.json(result.data);
      }).catch((err) => {
        console.error(err);
      });
});

router.delete('/delete/:id', function (req, res, next) {
    b2bkr_eloqua.data.contacts.delete(req.params.id).then((result) => {
        console.log(result.data);
        res.json(result.data);
      }).catch((err) => {
        console.error(err.message);
      });
});

module.exports = router;
