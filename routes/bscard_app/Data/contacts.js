const { json } = require('express');
var express = require('express');
var router = express.Router();
var converters = require('../../common/converters');
//명함앱 계정 contacts 값 187 인 녀석으로 계산 
/* Contacts */


//하나의 이메일 검색값으로 여러 contacts id를 조회 
// 조회순서에 따른 데이터는 보장되지 않는다 (ex labeltest_2 , labeltest_1로 조회했을 경우 결과값이 labeltest_1, labeltest_2로 나옴)
async function getContacts(email_list, depth , api_type){
  
  var queryString = {};
  var emailString = "?";
  for(var i = 0 ; email_list.length > i ; i++ ){
    emailString += "emailAddress='" + email_list[i] + "'";
  }
  queryString['search'] = emailString;
  queryString['depth'] = depth ? depth : "";

  console.log(queryString);
  var contacts_data ;
  await bscard_eloqua.data.contacts.get(queryString).then((result) => { 
    // console.log(result.data);
    // console.log(result.data.total);
    
    if(result.data.total && result.data.total > 0 ){

      if(api_type == 'id') contacts_data =  result.data.elements.map(function(k){   return k.id;   });
      else if(api_type == 'data') contacts_data = result.data;
      console.log(contacts_data);

    }
  }).catch((err) => {
    console.error(err);
    
  });
  console.log(12345);
  console.log(contacts_data);
  return contacts_data;
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
  var depth = req.body.depth;
  var contacts_data = await getContacts(email_list , depth , "data");

  if(contacts_data && contacts_data.total > 0) res.json(contacts_data);
  else res.json(false);
    
});

router.get('/search_one', function (req, res, next) {
  var email = req.query.email;
 
  var queryString = {}  ;

  // var id = getContacts(email , "minimal");
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


    // req.body =  [
    //     {
    //       "userId":"dslim", 
    //       "userCode":"LGEKR", 
    //       "product":"all", 
    //       "first_name":"대선17", 
    //       "last_name":"임17", 
    //       "company":"intellicode", 
    //       "rank":"데이터 서비스 사업부 /부장", 
    //       "hp":"010.7402.0722", 
    //       "tel":"031 252.9127", 
    //       "fax":"031.629.7826",                    
    //       "addr1":"(16229) 경기도 수원시 영통구광교로 105 경기R&DB센터 705호", 
    //       "addr2":"", 
    //       "email":"dslim17@intellicode.co.kr", 
    //       "homepage":"http://goldenplanet.co.kr",
    //       "etc1":"test용", 
    //       "etc2":"", 
    //       "mailingDate":"2019-12-29 19:48:08", 
    //       "subscriptionDate":"1577616544" ,
          
    //     },
    //     {
    //       "userId":"dslim", 
    //       "userCode":"LGEKR", 
    //       "product":"all", 
    //       "first_name":"대선18", 
    //       "last_name":"임18", 
    //       "company":"intellicode", 
    //       "rank":"데이터 서비스 사업부 /부장", 
    //       "hp":"010.7402.0722", 
    //       "tel":"031 252.9127", 
    //       "fax":"031.629.7826",                    
    //       "addr1":"(16229) 경기도 수원시 영통구광교로 105 경기R&DB센터 705호", 
    //       "addr2":"", 
    //       "email":"dslim18@intellicode.co.kr", 
    //       "homepage":"http://goldenplanet.co.kr",
    //       "etc1":"test용", 
    //       "etc2":"", 
    //       "mailingDate":"2019-12-29 19:48:08", 
    //       "subscriptionDate":"1577616544" ,
          
    //     }
    //   ]
    // create 쪽 산기평에 반영하고 박기범님한테 메일전송 ,
    // search_all 쪽 알려주고 input 값 전달할것
    console.log(req.body);
    var data =  converters.bscard(req.body);
    console.log(data);
    var result_count = 0;
    var result_list = [];

    for(var i = 0 ; data.length > i ; i++){
      await bscard_eloqua.data.contacts.create( data[i] ).then((result) => {
        console.log(result.data);
        // res.json(result.data);
        result_list.push({
          email : data[i].email,
          status : 200 ,
          message : "success"
        });
        result_count++;
      }).catch((err) => {
        console.log(err.response.status);
        console.log(err.response.statusText);
        // console.error(err);
      });

    }

    console.log("send_data count : " + data.length + "  ::: result_count : " + result_count );
    if(result_list.length > 0) res.json(result_list);
    else res.json(false);
    
    
    

    
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

router.post('/test1/', async function (req, res, next) {
  var eloqua_send_data;
  
  var array_cnt = Object.keys(req.body).length;     console.log('받은 JSON ARRAY COUNT : ' +  Object.keys(req.body).length);

  if( array_cnt > 0)
  {
    eloqua_send_data = Convert_bscard_data(req.body);  

    for(var i = 0 ; eloqua_send_data.length > i ; i++ ){
      await bscard_eloqua.data.contacts.create( eloqua_send_data[i] ).then((result) => {
        
        //배열 명함정보 상태값 채크 - 성공여부 등

        res.json(true);


      }).catch((err) => {

        //배열 명함정보 상태값 채크 - 성공여부 등
        console.error(err);
        res.json(false);
      });
    }

    console.log(eloqua_send_data);
  }

  //리턴정보 필요 ( 배열 명함정보 상태값 채크 - 성공여부 등 )

  res.json((req.body));
});


function Convert_bscard_data(bscard_json_array_data)
{
  
  var return_data = [{}];
  var array_cnt = Object.keys(bscard_json_array_data).length;
  if( array_cnt > 0)
  {
    for( var i = 0; i< array_cnt; i++)
    {
      return_data[i].userId = bscard_json_array_data[i].userId;
      return_data[i].userCode = bscard_json_array_data[i].userCode;
      return_data[i].product = bscard_json_array_data[i].product;
      return_data[i].first_name = bscard_json_array_data[i].first_name; //필수값
      return_data[i].last_name = bscard_json_array_data[i].last_name; //필수값
      return_data[i].company = bscard_json_array_data[i].company;
      return_data[i].rank = bscard_json_array_data[i].rank;
      return_data[i].hp = bscard_json_array_data[i].hp;
      return_data[i].tel = bscard_json_array_data[i].tel;
      return_data[i].fax = bscard_json_array_data[i].fax;
      return_data[i].addr1 = bscard_json_array_data[i].addr1; //== "" ? undefined : bscard_json_array_data[i].addr1;
      return_data[i].addr2 = bscard_json_array_data[i].addr2; //
      return_data[i].email = bscard_json_array_data[i].email; // 필수값
      return_data[i].homepage = bscard_json_array_data[i].homepage;
      return_data[i].etc1 = bscard_json_array_data[i].etc1;
      return_data[i].etc2 = bscard_json_array_data[i].etc2;
      return_data[i].mailingDate = bscard_json_array_data[i].mailingDate;
      return_data[i].subscriptionDate = bscard_json_array_data[i].subscriptionDate;

      valdationCheck(return_data[i]);
    }
  }
  return return_data;
}




module.exports = router;
