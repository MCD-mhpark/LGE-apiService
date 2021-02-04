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
  queryString['count'] = 10;

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
    search : search_value
    //depth : "complete"
    //depth : "complete"
  }
    iam_eloqua.system.users.security_groups(queryString).then((result) => {
      console.log(result.data);
      res.json(result.data);
    }).catch((err) => {
      console.error(err);
    });
});



module.exports = router;
