const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const MongoClient = require('mongodb').MongoClient;


/**
 * Router dependencies.
 */
const messageApi = require('./api/messages');

const app = express();

/**
 * Added DB connections.
 */

MongoClient.connect("mongodb://batler12:qwerty22@ds121636.mlab.com:21636/chatdb", (err, client) => {
	if (err) return console.log(err);
	const collectionMessage = client.collection("messages");

	console.log("Connected to MongoDB");

	app.use(logger('dev'));
	app.use(express.json());
	app.use(express.urlencoded({ extended: false }));



	app.use('/api/messages', messageApi(collectionMessage));

	// catch 404 and forward to error handler
	app.use(function (req, res, next) {
		next(createError(404));
	});

	// error handler
	app.use(function (err, req, res, next) {
		// set locals, only providing error in development
		res.locals.message = err.message;
		res.locals.error = req.app.get('env') === 'development' ? err : {};

		// render the error page
		res.status(err.status || 500);
		res.render('error');
	});
});

module.exports = app;
