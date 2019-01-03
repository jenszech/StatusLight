var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var morgan = require('morgan');
var winston = require('./config/winston');

var indexRouter = require('./routes/index');
var statusRouter = require('./routes/status');
var adminRouter = require('./routes/admin');
var statusManager = require('./public/javascripts/statusManager');

var app = express();

const { loggers } = require('winston')
const logger = loggers.get('appLogger');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

//app.use(morgan('dev'));
app.use(morgan('combined', { stream: winston.stream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/status', statusRouter);
app.use('/admin', adminRouter);

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

//Starte Application
statusManager.init();  //Set Debug State
setTimeout(statusManager.runSingleCheck, 5000);
setTimeout(statusManager.runIntervallCheck, 10000);

module.exports = app;
