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
  var queryString = {
    depth : "complete"
  }
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

router.get('/security_groups', function (req, res, next) {
  var queryString = {
    depth : "complete"
  }
    iam_eloqua.system.users.security_groups(queryString).then((result) => {
      console.log(result.data);
      res.json(result.data);
    }).catch((err) => {
      console.error(err);
    });
});



module.exports = router;
