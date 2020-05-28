const mongoose = require('mongoose');
const config = require('config');
const db = config.get('mongoURI');
const logger = require('./logger');

const conncetDB = async () => {
  try {
    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    logger.info('MongoDB connected');
  } catch (err) {
    logger.error(err.message);
    //Exit process with failure
    process.exit(1);
  }
};
module.exports = conncetDB;
