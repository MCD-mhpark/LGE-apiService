var express = require('express');
var router = express.Router();

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

module.exports = router;
