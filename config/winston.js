var appRoot = require('app-root-path');
const { createLogger, loggers, format, transports } = require('winston');

var options = {
    file: {
        level: 'info',
        filename: `${appRoot}/logs/app.log`,
        handleExceptions: true,
        humanReadableUnhandledException: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: true,
    },
    errorfile: {
        level: 'error',
        filename: `${appRoot}/logs/error.log`,
        handleExceptions: true,
        json: true,
        maxsize: 5242880, // 5MB
        maxFiles: 5,
        colorize: true,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

//Init Logging
loggers.add('appLogger',{
    format: format.combine(
        format.simple(),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new transports.File(options.errorfile),
        new transports.File(options.file)
    ],
    exitOnError: false
});
const logger = loggers.get('appLogger');

if (process.env.NODE_ENV !== 'prod') {
    logger.add(new transports.Console({
        level:'debug',
        format: format.combine(
            format.simple(),
            format.colorize(),
            format.timestamp({
                format: 'YYYY-MM-DD HH:mm:ss'
            }),
            format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
        ),
    }));
}
logger.stream = {
    write: function(message, encoding) {
        // use the 'info' log level so the output will be picked up by both transports (file and console)
        logger.info(message);
    },
};

process.on('uncaughtException', function (error) {
    logger.error(error.message);
    logger.error(error.stack);
});

logger.debug('Logging into '+options.file.filename);
module.exports = logger;
