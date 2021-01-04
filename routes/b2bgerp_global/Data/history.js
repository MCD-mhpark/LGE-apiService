
var resultLog = function resultLog(res , api_function){

  var sql = "INSERT INTO ELOQUA_API_LOG \
  ( TARGET , API_FUNCTION , SEND_START_TIME , SEND_END_TIME , RES_CODE , RES_MESSAGE , DATA_COUNT , CREATE_DT , UPDATE_DT) \
  VALUES ('CS INTERGRATION' , 'SELECT' , SYSDATE , SYSDATE , '404' , 'OK' , 1000 , SYSDATE, SYSDATE) " ;
  console.log("Oracle SQL : " + sql);
  ora_conn.execute(sql , [], function (err, result) {
    if (err) {
        console.error(err.message);
        doRelease(ora_conn);
        res.send(false);
        return;
    }
    ora_conn.commit();
    console.log(result.metaData);  //테이블 스키마
    console.log(result.rows);  //데이터
    console.log(result);
    doRelease(ora_conn);
    res.json(result);
});

}

function doRelease(connection) {
  console.log("doRelease");
  connection.release(function (err) {
      if (err) {
          console.error(err.message);
      }
  });
}

module.exports.resultLog = resultLog;