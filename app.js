var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var EloquaApi = require('eloqua-sdk');
var engine = require('ejs-locals');
var oracledb = require('oracledb');
var dbConfig = require('./config/dbconfig.js');

var eloqua_config = {
  sitename: 'TechnologyPartnerGoldenPlanet',
  username: 'Keonhee.Lee',
  password: 'Gp7181811!@'
};

global.eloqua = new EloquaApi(eloqua_config);

// console.log(process.platform);
console.log(dbConfig);

oracledb.getConnection(dbConfig, function (err, conn) {
  console.log(123);
    if(err){
        console.log('접속 실패', err.stack);
        return;
    }
    global.ora_conn = conn;
    console.log('접속 성공');
    
});

var index =  require('./routes/index'); 
var log =  require('./routes/log'); 
// Data/contacts 만 쓰는 project
var b2bgerp_global_data_contacts= require('./routes/b2bgerp_global/Data/contacts');
var b2bgerp_kr_us_data_contacts= require('./routes/b2bgerp_kr_us/Data/contacts');
var cs_integration_data_contacts= require('./routes/cs_integration/Data/contacts');

// bulk 혹은 system user 를 사용하는 project
var bscard_app_bulk_contacts= require('./routes/bscard_app/Bulk/contacts/imports');
var bscard_app_bulk_syncAction= require('./routes/bscard_app/Bulk/contacts/syncAction');
var bscard_app_data_contacts = require('./routes/bscard_app/Data/contacts');

var iam_system_users = require('./routes/iam/system/users');
const dbconfig = require('./config/dbconfig.js');

var app = express();
 
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
app.engine('html', engine);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/index', index);
app.use('/log', log);
app.use('/b2bgerp_global/data/contacts', b2bgerp_global_data_contacts);
app.use('/b2bgerp_kr_us/data/contacts', b2bgerp_kr_us_data_contacts);
app.use('/cs_integration/data/contacts', cs_integration_data_contacts);

app.use('/bscard_app/bulk/contacts/syncAction', bscard_app_bulk_syncAction);
app.use('/bscard_app/bulk/contacts/imports', bscard_app_bulk_contacts);
app.use('/bscard_app/data/contacts', bscard_app_data_contacts);

app.use('/iam/system/users', iam_system_users);




// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});





module.exports = app;
