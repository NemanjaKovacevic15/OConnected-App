const { createLogger, format, transports } = require('winston');
const mongoDB = require('./default.json');

require('winston-mongodb');

const logger = createLogger({
  transports: [
    new transports.File({
      filename: 'info.log',
      level: 'info',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
    }),

    new transports.MongoDB({
      level: 'error',
      db: mongoDB.mongoURI,
      options: { useUnifiedTopology: true },
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
    }),
  ],
});

module.exports = logger;
