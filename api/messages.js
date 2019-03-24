const express = require('express');
const router = express.Router();
const bodyParser = require("body-parser");
const jsonParser = bodyParser.json();
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AMOUNT_RECORDS_FOR_ONE_PAGE = 10;

// установка схемы
const messageSheme = new Schema({
  id: Number,
  info: {
    authorEmail: {
      type: String,
    },
    text: {
      type: String,
    },
    dateCreate: {
      type: Number,
      default: 0,
    },
  },
});

const Message = mongoose.model("Message", messageSheme);


module.exports = (collectionMessages = null) => {

  /**
   * @api {post} /insert Request to add messages to the database
   * @apiName AddMessage
   * @apiGroup Messages
   *
   * @apiParam {String} authorEmail Sender email.
   * @apiParam {String} text Message text.
   */
  router.post('/insert', jsonParser, (req, res) => {
    if (!req.body) return res.sendStatus(400);

    const authorEmail = req.body.authorEmail;
    const text = req.body.text;
    const dateCreate = Date.now();
    const newRecord = { authorEmail, text, dateCreate };
    const emailRegExp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

    if (text === undefined || authorEmail === undefined) {
      return res.send({
        message: "Please check request parameters",
        success: false
      });
    }

    if (text.length == 0 || text.length > 100) {
      return res.send({
        message: "Text length must be from 1 to 99 characters",
        success: false
      });
    }

    if (!emailRegExp.test(authorEmail)) {
      return res.send({
        message: "Incorrect email",
        success: false
      });
    }

    // подключение
    mongoose.connect("mongodb://batler12:qwerty22@ds121636.mlab.com:21636/chatdb", { useNewUrlParser: true });

    const message = new Message({
      id: Date.now(),
      info: newRecord
    });

    message.save()
      .then(() => {
        mongoose.disconnect();

        return res.send({
          message: "Document inserted",
          success: true
        });
      })
      .catch(err => {
        console.error(`Failed to insert document: ${err}`);
      });
  });


  /**
   * @api {get} /single/:id Request for one message
   * @apiName GetOneMessage
   * @apiGroup Messages
   *
   * @apiParam {Number} id Id message.
   *
   * @apiSuccess {Object} data  Desired message information.
   */
  router.get('/single/:id', (req, res) => {

    const id = parseInt(req.params.id, 10);

    collectionMessages
      .findOne({ id })
      .then(callBackForGetSingleMessageRequestToDB.bind(null, res));
  });

  /**
   * @api {get} /list/:page Request for list message
   * @apiName GetListMessage
   * @apiGroup Messages
   *
   * @apiParam {Number} page Page number of the message list.
   *
   * @apiSuccess {Array} data Array of messages.
   */
  router.get('/list/:page', (req, res) => {

    const page = parseInt(req.params.page, 10);
    const skipAmount = page * AMOUNT_RECORDS_FOR_ONE_PAGE;
    const limitAmount = AMOUNT_RECORDS_FOR_ONE_PAGE;

    collectionMessages
      .find()
      .skip(skipAmount)
      .limit(limitAmount)
      .toArray(callBackForGetListMessagesRequestToDB.bind(null, res));
  });

  return router;
}

function callBackForGetListMessagesRequestToDB(res, err, dataMessage) {

  try {
    if (dataMessage) {
      const finalArray = dataMessage.map((item) => {
        return item.info;
      });

      res.send({
        data: finalArray,
        message: "",
        success: true
      });
    } else {
      res.send({
        message: "Document not found",
        success: false
      });
    }
  } catch (err) {
    console.error(`Failed to find document: ${err}`)
  }
}

function callBackForGetSingleMessageRequestToDB(res, dataMessage) {

  try {
    if (dataMessage) {
      res.send({
        data: dataMessage.info,
        message: "",
        success: true
      });
    } else {
      res.send({
        message: "Document not found",
        success: false
      });
    }
  } catch (err) {
    console.error(`Failed to find document: ${err}`);
  }
}