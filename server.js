require('dotenv').config();
const nodemailer = require('nodemailer')
const express = require('express')
const Paytm = require('paytm-pg-node-sdk');
const bodyParser = require('body-parser');
const multer = require('multer')
const path = require('path');
const Applicant = require('./models/applicant')
const mongoose = require('mongoose')
const succesMsg = require('./mail/registerSuccess')
const port = process.env.PORT || 5000
const logger = require("./logger");
const app = express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'build')));
app.use(express.static(__dirname + '/public'));


const transporter = nodemailer.createTransport({
  host: process.env.NODE_ENV === 'production' ? process.env.MAIL_HOST : 'smtp.ethereal.email',
  port: process.env.NODE_ENV === 'production' ? process.env.MAIL_PORT : 587,
  auth: {
    user: process.env.NODE_ENV === 'production' ? process.env.MAIL_USER : 'graciela.keeling37@ethereal.email',
    pass: process.env.NODE_ENV === 'production' ? process.env.PASSWORD : 'qVUwpFEyVhBYVjR4VD'
  }
});


connectToPaytm();
mongoose.connect(process.env.dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(port, (err) => {
    logger.info(`> Connected to MongoDB`)
    if (err) throw err
    logger.info(`> Ready on http://localhost:${port}`)
  }))
  .catch((err) => logger.error(err))
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './files')
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "--" + file.originalname)
  }
})
const upload = multer({ storage: fileStorage })




app.get("/api/test", (req, res) => {
  return res.send("Hi")
})

app.post("/api/jobfair/pay", upload.single("resume"), async (req, res) => {
  try {
    var txnId = await generateTxnId(req)

    let applicant = new Applicant({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      institute: req.body.institute,
      branch: req.body.branch,
      yearofPassout: req.body.yearofPassout,
      CGPA: req.body.CGPA,
      backlog: req.body.backlog,
      ieeeMember: req.body.ieeeMember,
      resume: req.file.path,
      orderId: txnId.orderId,
      amount: txnId.TXN_AMOUNT,
      paymentStatus: "Pending",
      bankId: "Pending",
      txnDate: "Pending",
      txnId: "Pending"
    })
    applicant.save()
      .then(() => res.send(txnId))
      .catch((err) => {
        logger.error(err)
        res.status(400).send({ error: err.message })
      })
  }
  catch (err) {
    logger.error(err)
    return res.status(400).send(err);
  }
})

app.post("/api/pay", async (req, res) => {
  try {
    var txnId = await generateTxnId(req)
    return res.send(txnId)
  }
  catch (err) {
    return res.send(err)
  }

})
app.get("/api/confirmation", async (req, res) => {
  try {
    if (req.query.type === "jobfair") {
      var txnId = await Applicant.findOne({ orderId: req.query.id })
      return res.send(txnId)
    }
  }
  catch (err) {
    res.status(400).send({ error: err.message })
    logger.error(err)
  }

})


app.post("/api/callback", async (req, res) => {

  try {
    var orderId = req.body.ORDERID;
    var readTimeout = 80000;
    var paymentStatusDetailBuilder = new Paytm.PaymentStatusDetailBuilder(orderId);
    var paymentStatusDetail = paymentStatusDetailBuilder.setReadTimeout(readTimeout).build();
    var response = await Paytm.Payment.getPaymentStatus(paymentStatusDetail);

    if (response.responseObject.body.resultInfo.resultStatus === "TXN_SUCCESS") {

      let applicant = await Applicant.findOneAndUpdate({ orderId: req.body.ORDERID }, {
        amount: response.responseObject.body.txnAmount,
        paymentStatus: "success",
        bankId: response.responseObject.body.bankTxnId,
        txnDate: response.responseObject.body.txnDate,
        txnId: response.responseObject.body.txnId,
      })


      let content = {
        from: process.env.NODE_ENV === "production" ? process.env.MAIL_USER : "graciela.keeling37@ethereal.email",
        to: process.env.NODE_ENV === "production" ? applicant.email : "graciela.keeling37@ethereal.email",
        subject: "IEEE Job Fair 2022 | Registration Successful",
        html: succesMsg(
          {
            orderId,
            amount: response.responseObject.body.txnAmount,
            paymentStatus: "success",
            bankId: response.responseObject.body.bankTxnId,
            txnDate: response.responseObject.body.txnDate,
            txnId: response.responseObject.body.txnId
          }
        )

      }

      transporter.sendMail(content, (err, info) => {
        if (err) {
          logger.error(err)
          console.log(err)
          return;
        }
        logger.info("Send:" + info.response);
        if (process.env.NODE_ENV === "development")
          logger.info(nodemailer.getTestMessageUrl(info))
      })
      return res.redirect(process.env.NODE_ENV === "production" ? `${process.env.DOMAIN_NAME}/confirmation/jobfair/${req.body.ORDERID}` : `http://localhost:${process.env.PORT}/confirmation/jobfair/${req.body.ORDERID}`)

    }
    else {
      let applicant = await Applicant.findOneAndUpdate({ orderId: req.body.ORDERID }, {
        paymentStatus: "failed",
        bankId: "failed",
        txnDate: response.responseObject.body.txnDate,
        txnId: response.responseObject.body.txnId
      })



      let content = {
        from: process.env.NODE_ENV === "production" ? process.env.MAIL_USER : "graciela.keeling37@ethereal.email",
        to: process.env.NODE_ENV === "production" ? applicant.email : "graciela.keeling37@ethereal.email",
        subject: "IEEE Job Fair 2022 | Registration failed",
        html: succesMsg(
          {
            orderId,
            amount: response.responseObject.body.txnAmount,
            paymentStatus: "failed",
            bankId: "failed",
            txnDate: response.responseObject.body.txnDate,
            txnId: response.responseObject.body.txnId
          }
        )

      }

      transporter.sendMail(content, (err, info) => {
        if (err) {
          logger.error(err)
          return;
        }
        logger.info("Send:" + info.response);
        if (process.env.NODE_ENV === "development")
        logger.info(nodemailer.getTestMessageUrl(info))
      })
      return res.redirect(process.env.NODE_ENV === "production" ? `https://${process.env.DOMAIN_NAME}/confirmation/jobfair/${req.body.ORDERID}` : `http://localhost:${process.env.PORT}/confirmation/jobfair/${req.body.ORDERID}`)
    }

  }
  catch (err) {
    res.status(400).send(err)
    logger.error(err)
  }

})
app.get("/api/redirect", (req, res) => {

  return res.redirect("/confirmation")

})

// This code should be in the last portion
app.get("/", function (req, res) {
  res.sendFile("index.html", { root: path.join(__dirname, "./build/") });
});
app.get('*', (req, res) => {
  res.sendFile(process.cwd() + '/build/index.html');
})

function generateRandomString(count) {
  var ALPHA_NUMERIC_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  var charactersLength = ALPHA_NUMERIC_STRING.length;
  var rand = '';
  for (var i = 0; i < count; i++) {
    var start = Math.floor(Math.random() * charactersLength) + 1;
    rand += ALPHA_NUMERIC_STRING.substr(start, 1);
  }
  return rand;
}

let generateTxnId = async (req) => {
  try {
    var channelId = Paytm.EChannelId.WEB;
    var orderId = generateRandomString(10);
    var txnAmount = Paytm.Money.constructWithCurrencyAndValue(Paytm.EnumCurrency.INR, req.body.ieeeMember === "true" ? "250.00" : "500.00");
    var userInfo = new Paytm.UserInfo(generateRandomString(10));
    userInfo.setEmail(req.body.email);
    userInfo.setFirstName(req.body.firstName);
    userInfo.setLastName(req.body.lastName);
    userInfo.setMobile(req.body.phone);
    var paymentDetailBuilder = new Paytm.PaymentDetailBuilder(channelId, orderId, txnAmount, userInfo);
    var paymentDetail = paymentDetailBuilder.build();
    var response = await Paytm.Payment.createTxnToken(paymentDetail);

    var details = {
      mid: process.env.Merchant_Id,
      orderId,
      "CHECKSUMHASH": response.responseObject.head.signature,
      "txnToken": response.responseObject.body.txnToken,
      TXN_AMOUNT: "10.00",
      WEBSITE: "WEBSTAGING",
    }

    logger.info(`> Paytm token created for ${req.body.firstName + " " + req.body.lastName}`)

    return details
  }
  catch (err) {
    logger.error(err)
    return err
  }
}

function connectToPaytm() {
  try {
    var env = Paytm.LibraryConstants.STAGING_ENVIRONMENT;
    var mid = process.env.Merchant_Id;
    var key = process.env.Merchant_Key;
    var website = process.env.Website;
    var client_id = process.env.client_id;
    var callbackUrl = process.env.Callback;
    Paytm.MerchantProperties.setCallbackUrl(callbackUrl);
    Paytm.MerchantProperties.initialize(env, mid, key, client_id, website);
    Paytm.MerchantProperties.setConnectionTimeout(5000);
    logger.info(`> Connected to Paytm Servers`)
  }
  catch (e) {
    logger.error("Exception caught: ", e);
    Paytm.LoggingUtil.addLog(Paytm.LoggingUtil.LogLevel.INFO, "DemoApp", "Exception caught: ", e);
    logger.error("Failed")

  }

}