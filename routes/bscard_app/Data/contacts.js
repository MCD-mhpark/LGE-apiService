var express = require('express');
var router = express.Router();

//명함앱 계정 contacts 값 187 인 녀석으로 계산 
/* Contacts */
router.get('/search_all', function (req, res, next) {
  var emailAddress =  req.query.email;
  var depth =  req.query.depth; 
  var viewId = req.query.viewId;
  
  var queryString = {};

  queryString['search'] = emailAddress ? "?emailAddress=" + emailAddress  : "";
  queryString['depth'] = depth ? depth : "";
  queryString['viewId'] = viewId ? viewId : "";

  
  eloqua.data.contacts.get(queryString).then((result) => {
    console.log(result.data);
    // res.json(result.data);
    res.json(true);
  }).catch((err) => {
    console.error(err);
    res.json(false);
  });
});

router.get('/search_one', function (req, res, next) {
  var id = req.query.id ; 
  var depth =  req.query.depth; 
  // var queryString = {
  //   search : '?emailAddress=' + emailAddress,
  //   depth : depth,
  // }
  
  var queryString = { }  ;

  queryString['depth'] = depth ? depth : "";

  eloqua.data.contacts.getOne( id , queryString).then((result) => {
    console.log(result.data);
    res.json(result.data);
    // res.json(true);
  }).catch((err) => {
    console.error(err);
    res.json(false);
  });
});

router.post('/create', function (req, res, next) {

  console.log("create call");
    //body 예시
    req.body = {
      "address1": "P.O.Box 72202 - 00200",
      "address2": "6th Floor, Lonrho House ",
      "address3": "Standard Street, City Centre",
      "businessPhone": "2540312885",
      "city": "Copenhagen1",
      "country": "Denmark1",
      "emailAddress": "fortinbras1@norway.com",
      "fax": "2540312886",
      "firstName": "Fort",
      "lastName": "Fortinbras",
      "mobilePhone": "2540312887",
      "postalCode": "2620",
      "province": "Malmo",
      "salesPerson": "Hamlet",
      "title": "Actor",
    }

    eloqua.data.contacts.create( req.body ).then((result) => {
        console.log(result.data);
        // res.json(result.data);
        res.json(true);
      }).catch((err) => {
        console.error(err);
        res.json(false);
      });
});

router.put('/update/:id', function (req, res, next) {

    //body 예시
   
 
    eloqua.data.contacts.update(req.params.id, req.body ).then((result) => {
        console.log(result.data);
        // res.json(result.data);
        res.json(true);
      }).catch((err) => {
        console.error(err);
        res.json(false);
      });
});

router.delete('/delete/:id', function (req, res, next) {
    eloqua.data.contacts.delete(req.params.id).then((result) => {
        console.log(result.data);
        // res.json(result.data);
        res.json(true);
      }).catch((err) => {
        console.error(err.message);
        res.json(false);
      });
});

router.get('/test', function (req, res, next) {
  console.log(eloqua.assets.contacts);

  eloqua.assets.contacts.fields.get().then((result) => {
      console.log(result.data);
      res.json(result.data);
      // res.json(true);
    }).catch((err) => {
      console.error(err.message);
      res.json(false);
    });
});

router.get('/test2', function (req, res, next) {
  console.log(eloqua.data.contacts);
    var queryString = {
    depth : "complete"
  }
  var id = 187;
  var viewid = 0;
  eloqua.bulk.contacts.filters.get().then((result) => {
      console.log(result.data);
      res.json(result.data);
      // res.json(true);
    }).catch((err) => {
      console.error(err.message);
      res.json(false);
    });
});



router.get('/test3', function (req, res, next) {
  console.log(eloqua.data.contacts);
    var queryString = {
    depth : "complete"
  }
  var id = 187;
  var viewid = 100007;
  eloqua.data.contacts.filters.get(id , viewid).then((result)=>{
      console.log(result.data);
      res.json(result.data);
      // res.json(true);
    }).catch((err) => {
      console.error(err.message);
      res.json(false);
    });
});



router.get('/test4', function (req, res, next) {
  console.log(eloqua.data.contacts);
    var queryString = {
    depth : "complete"
  }
  var id = 187;
  // var viewid = 100007;
  eloqua.bulk.contacts.lists.get(id).then((result)=>{
      console.log(result.data);
      res.json(result.data);
      // res.json(true);
    }).catch((err) => {
      console.error(err.message);
      res.json(false);
    });
});


module.exports = router;
