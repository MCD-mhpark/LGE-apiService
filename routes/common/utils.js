var moment = require('moment');

exports.timeConverter = function (status , time){
    //ex date = 2019-12-29 19:48:08
    //ex unix =  1577616544

    if(!time || time == null ) return null
    else if(status == "GET_UNIX") return moment(time).unix();
    else if(status == "GET_DATE") return moment.unix(time).format("YYYY-MM-DD HH:mm:ss");
}