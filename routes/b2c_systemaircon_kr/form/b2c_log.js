var fs = require("mz/fs");
var express = require('express');
var router = express.Router();
var moment = require('moment-timezone');
const winston = require('winston');
require('winston-daily-rotate-file');
moment.locale('kr');

//const path = "C:/LGE_logs/"
const path = "/home/LGE_logs/"
const today = moment().tz('Asia/Seoul').format("YYYYMMDD");
const projectName = "_" + "B2C_Online_inquiry_KR" + "/"

function dirCreate(){
	const dirExist = fs.existsSync(path + today + projectName)
	//const dirExist = fs.existsSync("/home/LGE_logs/" + today  + "/")
	if(!dirExist){
		var resultDirPath = path + today + projectName;
        console.log("dir Create : " + resultDirPath)
        fs.mkdirSync( resultDirPath, { recursive: true } )
	}else{
        resultDirPath = path + today + projectName
    }
    return resultDirPath
}

const timezoned = () => {
    return new Date().toLocaleString('ko-KR', {
        timeZone: 'Asia/Seoul'
    });
}

const logDir = dirCreate();

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
    winston.format.timestamp({ format: timezoned }),
    winston.format.printf(
        (info) => 
        {
            if (typeof info.message === 'object') {
            info.message = JSON.stringify(info.message, null, 2)
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
            zippedArchive: false,	
            handleExceptions: true,
            //maxFiles: 30,  
        }),

        new winston.transports.DailyRotateFile({
            level: 'error',
            datePattern: 'YYYY-MM-DD',
            dirname: logDir,  
            filename: `%DATE%.error.log`,
            zippedArchive: false,
            //maxFiles: 30,
        }),

        //콘솔용 로그 정의
        new winston.transports.Console({
            level: 'debug',
            format: winston.format.combine(
                winston.format.colorize({ all: true }),
                winston.format.timestamp({ format: timezoned }),
                winston.format.printf((info) => `${info.timestamp} [${info.level}] ▶ ${info.message}`)
              ),
            colorize: true,
            handleExceptions: true,
        })
    ]
});

module.exports = logger;
