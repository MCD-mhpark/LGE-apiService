var request = require('request');
exports.sender = async function(url , method  , data){
  
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
  else if(method == "LGE_GERP_GLOBAL_POST" ){
    headers.Value = "da7d5553-5722-4358-91cd-9d89859bc4a0";

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
  var result ;
  await request(options, function (error, response, body) {

    console.log(123);
    if(error){
      console.log("에러에러(wise 점검 및 인터넷 연결 안됨)");
      console.log(error);
    } 
    if (!error && response.statusCode == 200) {
      result = body;
      console.log(body);
      console.log(response);
      
    }
  });

  return result;
}