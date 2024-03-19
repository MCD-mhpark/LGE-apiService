var fs = require("mz/fs");
var moment = require('moment-timezone');
const winston = require('winston');
require('winston-daily-rotate-file');
moment.locale('kr');
var os = require('os'); 

path = "/home/LGE_logs/IAM/"; 

function getDirPath(){
    let today = moment().tz('Asia/Seoul').format("YYYYMM");
    let dirExist = fs.existsSync(path + today);
    let dirPath;
    if(!dirExist){
        var logPath = path + today;
        fs.mkdirSync( logPath, { recursive: true } ); 
    }else{
        dirPath = path + today;
    }
    // console.log("dir Create : " + dirPath);
    return dirPath;
} 

const logDir = getDirPath();

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
            datePattern: 'YYYY-MM',
            dirname: logDir,
            filename: `%DATE%.log`,
            zippedArchive: true,	
            handleExceptions: true,
            //maxFiles: 30,  
        }),

        new winston.transports.DailyRotateFile({
            level: 'error',
            datePattern: 'YYYY-MM',
            dirname: logDir,  
            filename: `%DATE%.error.log`,
            zippedArchive: true,
            //maxFiles: 30,
        }), 
    ]
});


module.exports = logger;
