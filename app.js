var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var signupRoute = require('./routes/signup');
var loginRoute = require('./routes/login');
var changePasswordRoute = require('./routes/change_password');
var profileRoute = require('./routes/profile');
var eventRoute = require('./routes/events');
var studentGroupRoute = require('./routes/studentGroups');
var studentGroupFollowRoute = require('./routes/followGroup');
var memberGroupRoute = require('./routes/memberGroups');
var RSVPRoute = require('./routes/rsvpRoute');

const basicAuth = require('./middleware/BasicAuth');
const cors = require('cors');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(cors())

const API_PREFIX = '/api';

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(API_PREFIX + '/', indexRouter);
app.use(API_PREFIX + '/users', basicAuth, usersRouter);
app.use(API_PREFIX + '/signup', signupRoute);
app.use(API_PREFIX + '/login', loginRoute);
app.use(API_PREFIX + '/change_password', basicAuth, changePasswordRoute);
app.use(API_PREFIX + '/profile', profileRoute);
app.use(API_PREFIX + '/events/RSVP', RSVPRoute);
app.use(API_PREFIX + '/events', eventRoute);
app.use(API_PREFIX + '/studentGroups', studentGroupRoute);
app.use(API_PREFIX + '/followGroup', studentGroupFollowRoute);
app.use(API_PREFIX + '/memberGroups', memberGroupRoute);

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
