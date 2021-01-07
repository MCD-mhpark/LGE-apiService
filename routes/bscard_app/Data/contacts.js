var express = require('express');
var router = express.Router();
var converters = require('../../common/converters');
//명함앱 계정 contacts 값 187 인 녀석으로 계산 
/* Contacts */


//하나의 이메일 검색값으로 여러 contacts id를 조회 
// 조회순서에 따른 데이터는 보장되지 않는다 (ex labeltest_2 , labeltest_1로 조회했을 경우 결과값이 labeltest_1, labeltest_2로 나옴)
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


router.get('/all', async function (req, res, next) {
  var queryString = {
    depth : req.query.depth
  };
  await bscard_eloqua.data.contacts.get(queryString).then((result) => { 
    console.log(result.data);
    // res.json(true);
    res.json(result.data);
  }).catch((err) => {
    console.error(err);
    res.json(false);
  });
 
});

router.get('/test', async function (req, res, next) {

  var ids = req.query.ids;

  var queryString = {
    search :  "?emailAddress='labeltest_2@goldenplanet.co.kr'emailAddress='labeltest_1@goldenplanet.co.kr'" ,
    depth : "minimal"
  };

  
  console.log(converter);
  await bscard_eloqua.data.contacts.get(queryString).then((result) => { 
    console.log(result.data);
    // res.json(true);
    res.json(result.data);
  }).catch((err) => {
    console.error(err);
    res.json(false);
  });
 
});


//다수의 이메일 검색값으로 여러 contacts id를 조회
router.post('/search_all', async function (req, res, next) {
  // emails 예제 ["jtlim1@goldenplanet.co.kr" , "jtlim2@goldenplanet.co.kr" .. ]
  var email_list =  req.body.email_list;
  var data = await getIDs(email_list , "minimal" , "id");

  if(data.total > 0) res.json(data);
  else res.json(false);
  
});

router.get('/search_one', function (req, res, next) {
  var email = req.query.email;
 
  var queryString = {}  ;

  // var id = getIDs(email , "minimal");
  var id = req.query.id;

  bscard_eloqua.data.contacts.getOne( id , queryString).then((result) => {
    console.log(result.data);
    res.json(result.data);
    // res.json(true);
  }).catch((err) => {
    console.error(err);
    res.json(false);
  });
});

router.post('/create', async function (req, res, next) {

  console.log("create call");
    //body 예시
    // req.body = {
    //   "address1": "P.O.Box 72202 - 00200",
    //   "address2": "6th Floor, Lonrho House ",
    //   "address3": "Standard Street, City Centre",
    //   "businessPhone": "2540312885",
    //   "city": "Copenhagen1",
    //   "country": "Denmark1",
    //   "emailAddress": "fortinbras1@norway.com",
    //   "fax": "2540312886",
    //   "firstName": "Fort",
    //   "lastName": "Fortinbras",
    //   "mobilePhone": "2540312887",
    //   "postalCode": "2620",
    //   "province": "Malmo",
    //   "salesPerson": "Hamlet",
    //   "title": "Actor",
    // }

  
    var data = req.body;
    console.log(req.body);
    
    
    return;
    for(var i = 0 ; data.length > i ; i++ ){
      await bscard_eloqua.data.contacts.create( data[i] ).then((result) => {
        console.log(result.data);
        // res.json(result.data);
        res.json(true);
      }).catch((err) => {
        console.error(err);
        res.json(false);
      });
    }

    
});

router.put('/update/:id', async function (req, res, next) {

  // email 검색 예시 jtlim* , *@goldenplanet.co.kr 같이 쓴다.
  // var email = req.body.email;
  // var ids = getIDs(email);

  // for(var i = 0; ids.length > i ; i++){
  //   ids[i]
  // }
  
  bscard_eloqua.data.contacts.update(req.params.id, req.body ).then((result) => {
      console.log(result.data);
      // res.json(result.data);
      res.json(true);
    }).catch((err) => {
      console.error(err);
      res.json(false);
    });
});

router.delete('/delete/:id', function (req, res, next) {
  bscard_eloqua.data.contacts.delete(req.params.id).then((result) => {
        console.log(result.data);
        // res.json(result.data);
        res.json(true);
      }).catch((err) => {
        console.error(err.message);
        res.json(false);
      });
});






module.exports = router;
