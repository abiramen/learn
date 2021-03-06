const fs = require('fs');
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const sitename = 'learn.abiram.me';

// const sass = require('node-sass-middleware');

const data = require('./classes.json');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// app.use(
//   sass({
//     src: __dirname + '/sass',
//     dest: __dirname + '/public',
//     debug: false
// }));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res, next) => {
  // list all classes and sessions on homepage.
  res.render('index', { sessions: data.sessions, title: `home | ${sitename}` });
});

data.sessions.forEach((session) => {
  // redirect individual sessions to homepage listing.
  app.get(`/${session.year}T${session.term}/`, (req, res, next) => {
    res.redirect(`/#${session.year}T${session.term}`);
  });
  
  session.classes.forEach((cls) => {
    // render the class page for a session.

    const classPath = `/${session.year}T${session.term}/${cls.class}`;

    app.get([classPath, `/${classPath}/week`], (req, res, next) => {
      res.render('class', {
        title: `${cls.class} | ${sitename}`,
        name: cls.class, 
        assist: cls.assist,
        course: cls.course,
        weeks: cls.weeks,
        term: session.term,
        year: session.year })
    });

    cls.weeks.forEach((week) => {
      const weekPath = `/${session.year}T${session.term}/${cls.class}/week/${week.week}`;
      app.get(weekPath, (req, res, next) => {
        res.render('week', {
          title: `${cls.class} week ${week.week} | ${sitename}`,
          course: cls.course,
          week: week.week,
          slides: week.slides,
          files: week.files,
          desc: week.desc,
          text: week.text,
          repo: cls.repo,
          weekPath: weekPath,
          classPath: classPath,
          links: week.links
        });
      });

      app.get(weekPath + '/feedback', (req, res, next) => {
        res.render('feedback', {
          title: `Week ${week.week} Feedback | ${sitename}`,
          name: cls.class,
          week: week.week,
          weekPath: weekPath
        });
      });

      app.post(weekPath + '/feedback', (req, res, next) => {
        // mostly yoinked from github.com/insou22/teach-web
        const formatDate = new Date().toISOString().replace(/T/, '_').replace(/\..+/, '');
        const name = `${session.year}T${session.term}-${cls.class}-wk${week.week}-${formatDate}`;
        fs.writeFile(`./feedback/${name}.json`, JSON.stringify(req.body, null, 4), ()=>{});
          res.render('feedback_thanks', {title: `Week ${week.week} Feedback | ${sitename}`, weekPath: weekPath});
      });


    });
  });
});

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
