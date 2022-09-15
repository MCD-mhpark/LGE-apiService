var fs = require("mz/fs");
var moment = require('moment-timezone');
const winston = require('winston');
require('winston-daily-rotate-file');
moment.locale('kr');

let projectName = "B2C_Online_inquiry_KR"

function logs_makeDirectory(dirPath){

    //var OS_TYPE = 'Windows'
    var OS_TYPE = 'Linux'
    if(OS_TYPE === 'Windows'){
        dirPath = "C:/LGE_logs/" + dirPath + "/";
        fs.mkdirSync( dirPath, { recursive: true } );
    }else if(OS_TYPE === "Linux" ){
        dirPath = "/home/LGE_logs/" + dirPath + "/";
        fs.mkdirSync( dirPath, { recursive: true } );
    }
    return dirPath;
}

let today = moment().tz('Asia/Seoul').format("YYYYMMDD") + "_" + projectName;
	const dirExist = fs.existsSync("C:/LGE_logs/" + today)
	if(!dirExist){
		var dirPath = logs_makeDirectory(today)
		console.log("dir Create : " + dirPath)
	}else{
        dirPath = "C:/LGE_logs/" + today
    }

//로그 파일을 남기는 위치
const logDir = dirPath;

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
}

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue',
}

winston.addColors(colors);

const format = winston.format.combine(
    winston.format.splat(),
    winston.format.json(),
    winston.format.timestamp({ format: ' YYYY-MM-DD HH:mm:ss ||' }),
    winston.format.printf(
        (info) => 
        {
            if (typeof info.message === 'object') {
            info.message = JSON.stringify(info.message)
            }
            return `${info.timestamp} [${info.level}] ▶ ${info.message}`
        }
    ),
)

const logger = winston.createLogger({

    format,
    levels,
    transports: [

        new winston.transports.DailyRotateFile({
            level: 'info',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,
            filename: `%DATE%.log`,
            zippedArchive: true,	
            handleExceptions: true,
            //maxFiles: 30,  
        }),

        new winston.transports.DailyRotateFile({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,  
            filename: `%DATE%.error.log`,
            zippedArchive: true,
            //maxFiles: 30,
        }),

        //콘솔용 로그 정의
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms ||' }),
                winston.format.printf((info) => `${info.timestamp} [${info.level}] ▶ ${info.message}`)
              ),
            colorize: true,
            handleExceptions: true,
        })
    ]
});


module.exports = logger;
