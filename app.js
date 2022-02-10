var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var methodOverride = require('method-override');
var EloquaApi = require('./public/modules/eloqua-sdk');
var moment = require('moment');
const bodyParser = require('body-parser');
require('console-stamp')(console, {
    formatter: function() {
        return moment().tz('Asia/Seoul').format('YYYY-MM-DD HH:mm:ss');
    }
});
var os = require('os');




const schedule = require('node-schedule-tz');
// var engine = require('ejs-locals');


var Global_Jobs;
var KR_Jobs;
var Global_Lead_Jobs;
var cs_integration_jobs;
var integrated_Pipeline_Jobs;

// var oracledb = require('oracledb');
// var dbConfig = require('./config/dbconfig.js');

var FolderPath = '../';
var fs = require('fs');



function get_system_foldername()
{
	var result_data = "";

	fs.readdir(FolderPath, function(error, filelist){

		
	
		if (filelist != null && filelist.length > 0) {
			for(i=0; i<filelist.length; i++)
			{
				switch(filelist[i])
				{
					case "bscard": result_data = "bscard"; break;
					case "iam": result_data = "iam"; break;
					case "b2bgerp_global": result_data = "b2bgerp_global"; break;
					case "b2bgerp_kr": result_data = "b2bgerp_kr"; break;
					case "cs_intergration": result_data = "cs_intergration"; break;
				}
			}
		}
	});

	return result_data;
}



// 회사명 : LGElectronicsd
// 명함앱 : Lg_api.Card - 8001
// B2B GERP : Lg_api.B2b_global - 8002
// B2B KR : Lg_api.B2b_kr- 8003
// 고객통합 : Lg_api.Integrated- 8004
// IAM : Lg_api.Iam- 8005
// 전부 비밀번호 :  QWer1234!@

var bscard_eloqua_config = {
	sitename: 'LGElectronics',
	username: 'Lg_api.Card',
	password: 'QWer1234!@'
};
var b2bgerp_eloqua_config = {
	sitename: 'LGElectronics',
	username: 'Lg_api.B2b_global',
	password: 'QWert1234!@'
};
var b2bkr_eloqua_config = {
	sitename: 'LGElectronics',
	username: 'Lg_api.B2b_kr',
	password: 'QWer1234!@'
};
var csintergration_eloqua_config = {
	sitename: 'LGElectronics',
	username: 'Lg_api.Integrated',
	password: 'QWer1234!@'
};
var iam_eloqua_config = {
	sitename: 'LGElectronics',
	username: 'Lg_api.Iam',
	password: 'QWer1234!@'
};

var for_old_eloqua_config = {
	sitename: 'LGElectronics',
	username: 'Lg_api.Integrated',
	password: 'QWer1234!@', 
	restVersion : '1.0'

}

global.bscard_eloqua = new EloquaApi(bscard_eloqua_config);
global.b2bgerp_eloqua = new EloquaApi(b2bgerp_eloqua_config);
global.b2bkr_eloqua = new EloquaApi(b2bkr_eloqua_config);
global.csintergration_eloqua = new EloquaApi(csintergration_eloqua_config);
global.iam_eloqua = new EloquaApi(iam_eloqua_config);
global.old_eloqua = new EloquaApi(for_old_eloqua_config);
global.logManager = require('./routes/common/history.js');
// console.log(process.platform);
// console.log(dbConfig);

// oracle XE를 로컬에 설치하여 산기평에서 테스트 불가
// oracledb.getConnection(dbConfig, function (err, conn) {
//   console.log(123);
//     if(err){
//         console.log('접속 실패', err.stack);
//         return;
//     }
//     global.ora_conn = conn;
//     console.log('접속 성공');
// });

var index =  require('./routes/index'); 
var log =  require('./routes/log'); 
// Data/contacts 만 쓰는 project
var b2bgerp_global_data_contacts = require('./routes/b2bgerp_global/Data/contacts');
var b2bgerp_kr_us_data_contacts = require('./routes/b2bgerp_kr_us/Data/contacts');
var cs_integration_data_contacts = require('./routes/cs_integration/Data/contacts');
var cs_integration_data_activities = require('./routes/cs_integration/Data/activities');
var cs_integration_Assets_campaign = require('./routes/cs_integration/Assets/campaigns');


// bulk 혹은 system user 를 사용하는 project
var bscard_app_bulk_contacts= require('./routes/bscard_app/Bulk/contacts/imports');
var bscard_app_bulk_syncAction= require('./routes/bscard_app/Bulk/contacts/syncAction');
var bscard_app_data_contacts = require('./routes/bscard_app/Data/contacts');


var etc_function = require('./routes/common/etc_function');

var iam_system_users = require('./routes/iam/system/users');
const dbconfig = require('./config/dbconfig.js');
const { url } = require('inspector');

var app = express();

var module_files = path.join(process.cwd(), '../modules');
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/modules', express.static(module_files));

app.use(bodyParser.json({limit: '50mb'})); //body 의 크기 설정
app.use(bodyParser.urlencoded({limit: '50mb', extended: true})); //url의 크기 설정
 
// view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'html');
// app.engine('html', engine);

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/index', index);
app.use('/log', log);
app.use('/b2bgerp_global/contacts', b2bgerp_global_data_contacts);
app.use('/b2bgerp_kr/contacts', b2bgerp_kr_us_data_contacts);
app.use('/cs_integration/contacts', cs_integration_data_contacts);
app.use('/cs_integration/activities', cs_integration_data_activities);
app.use('/cs_integration/campaigns', cs_integration_Assets_campaign);


app.use('/bscard_app/contacts/syncAction', bscard_app_bulk_syncAction);
app.use('/bscard_app/contacts/imports', bscard_app_bulk_contacts);
app.use('/bscard_app/contacts', bscard_app_data_contacts);

app.use('/etc_function/', etc_function);

app.use('/iam', iam_system_users);


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



function schedule_Request_GLOBAL(){
	let uniqe_jobs_name = "B2B GERP GLOBAL" +  moment().format('YYYYMMDD');
	let second = "0";
	let minutes = "05";
	let hours = "12";
	let dayofmonth = "*";
	let month = "*";
	let weekindex = "*";
	var schedate = second + ' ' + minutes + ' ' + hours + ' ' + dayofmonth + ' ' + month + ' ' + weekindex;

	//test data
	Global_Jobs = schedule.scheduleJob(uniqe_jobs_name,schedate,"Asia/Seoul" ,async function(){
		// let bant_list = ["AS" , "CLS" , "CM" , "ID" , "IT" , "Solution"];
		let bant_list = ["AS" , "CM" , "ID" , "IT" , "Solution"];
		bant_list.forEach( async BusinessName =>{
			await b2bgerp_global_data_contacts.bant_send(BusinessName);
		})
			
	});
}

function schedule_Request_GLOBAL_LEADNUMBER(){
	let uniqe_jobs_name = "B2B GERP GLOBAL" +  moment().format('YYYYMMDD');
	let second = "0";
	let minutes = "0";
	let hours = "7";
	let dayofmonth = "*";
	let month = "*";
	let weekindex = "*";
	var schedate = second + ' ' + minutes + ' ' + hours + ' ' + dayofmonth + ' ' + month + ' ' + weekindex;

	//test data
	Global_Lead_Jobs = schedule.scheduleJob(uniqe_jobs_name,schedate,"Asia/Seoul" ,async function(){
		// let bant_list = ["AS" , "CLS" , "CM" , "ID" , "IT" , "Solution"];
		await b2bgerp_global_data_contacts.LeadnumberAPI();
	});
}

function schedule_Request_KR(){
	let uniqe_jobs_name = "B2B GERP KR" +  moment().format('YYYYMMDD');
	let second = "0";
	let minutes = "*/10";
	let hours = "*";
	let dayofmonth = "*";
	let month = "*";
	let weekindex = "*";
	var schedate = second + ' ' + minutes + ' ' + hours + ' ' + dayofmonth + ' ' + month + ' ' + weekindex;

	//test data
	KR_Jobs = schedule.scheduleJob(uniqe_jobs_name,schedate,"Asia/Seoul" ,async function(){
		// let bant_list = ["AS" , "CLS" , "CM" , "ID" , "IT" , "Solution"];
		await b2bgerp_kr_us_data_contacts.senderToB2BGERP_KR();
	});
}

function schedule_Request_CS_Intergration(){
	let uniqe_jobs_name = "CS Intergration" +  moment().format('YYYYMMDD');
	let second = "0";
	let minutes = "0";
	let hours = "*";
	let dayofmonth = "*";
	let month = "*";
	let weekindex = "*";
	var schedate = second + ' ' + minutes + ' ' + hours + ' ' + dayofmonth + ' ' + month + ' ' + weekindex;

	//test data
	cs_integration_jobs = schedule.scheduleJob(uniqe_jobs_name,schedate,"Asia/Seoul" ,async function(){
		// let bant_list = ["AS" , "CLS" , "CM" , "ID" , "IT" , "Solution"];
		
	});
}


if(__dirname == "/home/opc/LGE/b2bgerp_global"){
	console.log("B2B GERP GLOBAL SCHEDULER REG");
	schedule_Request_GLOBAL();
	console.log("schedule_Request_GLOBAL_LEADNUMBER");
	schedule_Request_GLOBAL_LEADNUMBER();
} 

if(__dirname == "/home/opc/LGE/b2bgerp_kr"){
	console.log("B2B GERP KR SCHEDULER REG");
	schedule_Request_KR();
} 


if(__dirname == "/home/opc/LGE/cs_integration"){
	console.log("cs_integration SCHEDULER REG");
	schedule_Request_CS_Intergration();
} 


if(os.type().indexOf("Windows") > -1) global.OS_TYPE = "Windows"
else global.OS_TYPE = "Linux";

module.exports = app;