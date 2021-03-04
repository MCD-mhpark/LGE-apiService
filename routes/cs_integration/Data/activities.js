var express = require('express');
var router = express.Router();
var moment = require('moment');
// var eloqua_config = {
//     sitename: 'TechnologyPartnerGoldenPlanet',
//     username: 'Keonhee.Lee',
//     password: 'Gp7181811!@'
// };

function getUnixTime(term){
    //ex date = 2019-12-29 19:48:08
    //ex unix =  1577616544 

    // var today = moment().format("YYYY-MM-DD");
    var today_start = moment().add(term,"d").format("YYYY-MM-DD");
    var today_end = moment().format("YYYY-MM-DD"); 
   

    console.log(today_start);
    console.log(today_end);

    var startUnix = moment(today_start).unix();
    var endUnix = moment(today_end).unix();

    console.log(startUnix);
    console.log(endUnix);

    return {
        start : startUnix , 
        end : endUnix
    }
}



router.get('/:id/:type', function (req, res, next) {
  console.log(1234);
  var dayInfo = getUnixTime(-7);
  var queryString ={
      startAt : dayInfo.start,
      endAt : dayInfo.end,
      // type : "emailSend"
      // type : //event 에 대한 type 지정
  }

  // type list
  // campaignMembership
  // automation/campaignentry
  // emailClickThrough
  // emailOpen
  // emailSend
  // emailSubscribe
  // emailUnsubscribe
  // formSubmit
  // webVisit
  
  csintergration_eloqua.data.activities.new_Get(req.params.id , req.params.type,  queryString ).then((result) => {
    console.log(result.data);
    res.json(result.data);
  }).catch((err) => {
    console.error(err);
    res.json(false);
  });
});

module.exports = router;