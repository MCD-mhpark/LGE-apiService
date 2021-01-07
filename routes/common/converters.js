exports.b2bgerp = function(eloqua_data){
    console.log("b2bgerp_Convert");

},
exports.b2bkr = function(eloqua_data){
    console.log("b2bkr_Convert");
},
exports.csintergration - function(eloqua_data){
    console.log("csintergration_Convert");
},
//data 20개
exports.bscard = function(request_data){

    var return_data = [];
   
    console.log(1234);

    for( var i = 0; i< request_data.length; i++){
        var key = Object.keys(request_data[i]);
        var item = request_data[i];
        var return_item = {};

      
      
        // console.log(request_data[i]);
  
            console.log(item);
            // return_item.userId = item.userId;
            // return_item.userCode = item.userCode;
            // return_item.product = item.product;
           
            
            item.first_name == "" ? null : return_item.firstName = item.first_name; 
            item.last_name == "" ? null : return_item.lastName = item.last_name; 
            item.company == "" ? null : return_item.accountname = item.company;
            // return_item.rank = item.rank;
            item.hp == "" ? null : return_item.mobilePhone = item.hp;
            // return_item.tel = item.tel;
            item.fax == "" ? null : return_item.fax = item.fax;
            item.addr1 == "" ? null : return_item.address1 = item.addr1; //== "" ? undefined : item.addr1;
            item.addr2 == "" ? null : return_item.address2 = item.addr2; //
            item.email == "" ? null : return_item.emailAddress = item.email; // 필수값
            item.etc1 == "" ? null : return_item.description = item.etc1;
            item.userId == "" ? null : return_item.salesPerson = item.userId;
            // return_item.etc2 = item.etc2;
            // return_item.mailingDate = item.mailingDate;
            // return_item.subscriptionDate = item.subscriptionDate;

            return_item.fieldValues = [];
            
            if(item.rank != ""){
                var rank_data = { "id" : "100238" , "value" : item.rank}; //100238 Department custom field
                return_item.fieldValues.push(rank_data);
            } 
            if(item.homepage != ""){
                var website_data = { "id" : "100252" , "value" : item.homepage}; //100252 website custom field
                return_item.fieldValues.push(website_data);
            }
            if(item.userCode != ""){
                var usercode_data = { "id" : "100196" , "value" : item.userCode}; //100252 Subsidiary custom field
                return_item.fieldValues.push(usercode_data);
            }
            if(item.product != ""){
                var product_data = { "id" : "100229" , "value" : item.product}; //100252 Business Unit custom field
                return_item.fieldValues.push(product_data);
        
            }
            return_data.push(return_item);
            
    }

    console.log(return_data);
    console.log(return_data[0].fieldValues);
    return return_data;

// ex :   [
//   {
//     "userId":"dslim", 
//     "userCode":"LGEKR", 
//     "product":"all", 
//     "first_name":"대선", 
//     "last_name":"임", 
//     "company":"intellicode", 
//     "rank":"데이터 서비스 사업부 /부장", 
//     "hp":"010.7402.0722", 
//     "tel":"031 252.9127", 
//     "fax":"031.629.7826",                    
//     "addr1":"(16229) 경기도 수원시 영통구광교로 105 경기R&DB센터 705호", 
//     "addr2":"", 
//     "email":"dslim@intellicode.co.kr", 
//     "homepage":"",
//     "etc1":"", 
//     "etc2":"", 
//     "mailingDate":"2019-12-29 19:48:08", 
//     "subscriptionDate":"2019-12-29 19:49:04" 
//   }, 
// ]
}



