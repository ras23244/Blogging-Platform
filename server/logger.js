const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  level: 'info', 
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.printf(({ level, message, timestamp, stack }) => {
      return stack
        ? `${timestamp} [${level}]: ${message}\n${stack}`
        : `${timestamp} [${level}]: ${message}`;
    })
  ),
  transports: [
 
    new transports.Console(),


    new transports.File({ filename: 'logs/error.log', level: 'error' }),

    new transports.File({ filename: 'logs/combined.log' }),
  ],
});

module.exports = logger;
