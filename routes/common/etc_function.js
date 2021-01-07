var express = require('express');
var router = express.Router();

router.get('/fields', function (req, res, next) {
    var queryString = {
      depth : "complete",
      // search : "?isStandard=false"
    }
    console.log(b2bgerp_eloqua.assets.contacts);
    b2bgerp_eloqua.assets.contacts.fields.get(queryString).then((result) => {
      console.log(result.data);
      res.json(result.data);
    }).catch((err) => {
      console.error(err.message);
    });
  });


module.exports = router;