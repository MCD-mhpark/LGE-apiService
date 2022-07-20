var express = require('express');
var router = express.Router();

router.get('/fields', function (req, res, next) {
	var queryString = {
		depth: "complete",
		// search : "?isStandard=false"
	}
	console.log(1234);
	console.log(lge_eloqua.assets.contacts);
	lge_eloqua.assets.contacts.fields.get(queryString).then((result) => {
		console.log(result.data);
		res.json(result.data);
	}).catch((err) => {
		console.error(err.message);
	});
});

// option list api 
router.get('/optionlist_search', function (req, res, next) {
	var queryString = {
	}

	console.log();
	
	lge_eloqua.assets.optionLists.getOne(27 , queryString).then((result) => {
		console.log(result.data);
		res.json(result.data);
	}).catch((err) => {
		console.error(err);
	});
});


// // option list api 
// router.get('/optionlist_search', function (req, res, next) {
// 	var queryString = {
// 	}

// 	console.log();
	
// 	lge_eloqua.assets.optionLists.get(queryString).then((result) => {
// 		console.log(result.data);
// 		res.json(result.data);
// 	}).catch((err) => {
// 		console.error(err);
// 	});
// });





module.exports = router;