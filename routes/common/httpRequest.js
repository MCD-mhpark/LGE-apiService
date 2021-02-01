var request = require('request');
exports.sender = function(url , method  , data){
  
  // var headers = {
  //   'User-Agent': 'Super Agent/0.0.1',
  //   'Content-Type': "application/xml"
  // }
  var headers = {
    'User-Agent': 'Super Agent/0.0.1',
    'Content-Type': "application/json"
  }
 
  var options;
  if(method == "GET"){
    options = {
      url : url,
      method: method,
      headers:headers,
      encoding:'binary',
      qs : data
    };
  }
  else if(method == "POST" ){
    options = {
      url : url,
      method: method,
      headers:headers,
      encoding:'binary',
      body : data ,
      json : true
    };
  }
  

  console.log(new Date());
  console.log(options);
  
  request(options, function (error, response, body) {

    console.log(123);
    if(error){
      console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
      console.log(error);
    } 
    if (!error && response.statusCode == 200) {
      console.log(body);
      
    }
  });
}