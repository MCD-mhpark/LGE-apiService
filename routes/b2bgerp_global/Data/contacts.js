var express = require('express');
var router = express.Router();


/* Contacts */
console.log(__dirname);
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
  
    b2bgerp_eloqua.data.contacts.get(queryString).then((result) => {
      console.log(result.data);
      res.json(result.data);
    }).catch((err) => {
      console.error(err);
    });
});


router.get('/', function (req, res, next) {

  b2bgerp_eloqua.data.contacts.get(req.query.queryString).then((result) => {
    console.log(result.data);
    res.json(result.data);
  }).catch((err) => {
    console.error(err);
  });
});

router.get('/one/:id', function (req, res, next) {
    b2bgerp_eloqua.data.contacts.getOne(req.params.id  ).then((result) => {
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

    b2bgerp_eloqua.data.contacts.create( req.body ).then((result) => {
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
 
    b2bgerp_eloqua.data.contacts.update(req.params.id, req.body ).then((result) => {
        console.log(result.data);
        res.json(result.data);
      }).catch((err) => {
        console.error(err);
      });
});

router.delete('/delete/:id', function (req, res, next) {
    b2bgerp_eloqua.data.contacts.delete(req.params.id).then((result) => {
        console.log(result.data);
        res.json(result.data);
      }).catch((err) => {
        console.error(err.message);
      });
});

router.get('/dbtest', function (req, res, next) {
    // console.log("b2bgerp_eloqua OracleXE DB test");
    // console.log(history);
    // history.resultLog(res , "SELECT");
});



module.exports = router;
