var express = require('express');
var router = express.Router();

// var eloqua_config = {
//     sitename: 'TechnologyPartnerGoldenPlanet',
//     username: 'Keonhee.Lee',
//     password: 'Gp7181811!@'
// };

router.get('/', function (req, res, next) {
    console.log(1234);
    var dayInfo = getUnixTime(-7);
    var queryString ={
        startDate : dayInfo.start,
        endDate : dayInfo.end,
        type : "webVisit"
        // type : //event 에 대한 type 지정
    }
    console.log(queryString);
    eloqua.data.campaigns.get(req.params.id , queryString ).then((result) => {
      console.log(result.data);
      res.json(result.data);
    }).catch((err) => {
      console.error(err);
      res.json(false);
    });
});

module.exports = router;