const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const sass = require('node-sass-middleware');

const data = require('./classes.json');
const usersRouter = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(
  sass({
    src: __dirname + '/sass', //where the sass files are 
    dest: __dirname + '/public', //where css should go
    debug: true // obvious
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
  res.render('index', { sessions: data.sessions });
});

data.sessions.forEach((session) => {
  session.classes.forEach((cls) => {
    app.get(`/${session.year}T${session.term}/${cls.class}`, (req, res, next) => {
      res.render('class', { name: cls.class, assist: cls.assist, course: cls.course, weeks: cls.weeks, term: session.term, year: session.year })
    });
  });
});


app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
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
