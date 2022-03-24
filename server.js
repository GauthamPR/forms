require('dotenv').config();
const nodemailer = require('nodemailer')
const express = require('express')
const Paytm = require('paytm-pg-node-sdk');
const bodyParser = require('body-parser');
const multer = require('multer')
const path = require('path');
const Applicant = require('./models/applicant')
const mongoose = require('mongoose')
const cors = require("cors");
const succesMsg = require('./mail/registerSuccess')
const port = process.env.PORT || 5000
const logger = require("./logger");
const app = express();

app.use(cors());
app.options("*", cors());
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


connectToPaytm()
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

    const applicant = new Applicant({
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

      const applicant = await Applicant.findOneAndUpdate({ orderId: req.body.ORDERID }, {
        amount: response.responseObject.body.txnAmount,
        paymentStatus: "success",
        bankId: response.responseObject.body.bankTxnId,
        txnDate: response.responseObject.body.txnDate,
        txnId: response.responseObject.body.txnId,
      })


      const content = {
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
        logger.info("Send:" + info.response)
      })
      return res.redirect(process.env.NODE_ENV === "production" ? `https://form.ieee-mint.org/confirmation/jobfair/${req.body.ORDERID}` : `http://localhost:3000/confirmation/jobfair/${req.body.ORDERID}`)

    }
    else {
      await Applicant.findOneAndUpdate({ orderId: req.body.ORDERID }, {
        paymentStatus: "failed",
        bankId: "failed",
        txnDate: response.responseObject.body.txnDate,
        txnId: response.responseObject.body.txnId
      })



      const content = {
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
        logger.info("Send:" + info.response)
      })
      return res.redirect(process.env.NODE_ENV === "production" ? `https://form.ieee-mint.org/confirmation/jobfair/${req.body.ORDERID}` : `http://localhost:3000/confirmation/jobfair/${req.body.ORDERID}`)
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

mongoose.connect(process.env.dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => app.listen(port, (err) => {
    logger.info(`> Connected to MongoDB`)
    if (err) throw err
    logger.info(`> Ready on http://localhost:${port}`)
  }))
  .catch((err) => logger.error(err))




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

const generateTxnId = async (req) => {
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


// const express = require("express");
// const bodyParser = require("body-parser");
// const Paytm = require("paytm-pg-node-sdk");
// const { v4: uuidv4 } = require("uuid");
// const path = require("path");
// const cors = require("cors");
// require("dotenv").config();
// const MongoClient = require('mongodb').MongoClient;
// const ObjectID = require("mongodb").ObjectID;
// const dotenv = require("dotenv");
// const app = express();
// const PORT = process.env.PORT || 3000;

// dotenv.config();
// app.use(cors());
// app.options("*", cors());
// app.use(bodyParser.json());

// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'build')));
// app.use(express.static(__dirname + '/public'));

// const url = process.env.DBNAME;
// const db = "paytm";

// async function getDBObject() {
//   var conn = await MongoClient.connect(url, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
//   console.log("Connected to DB");
//   return { db: conn.db(db), conn: conn };
// }
// function middleware() {
//   try {
//     var env = Paytm.LibraryConstants.STAGING_ENVIRONMENT;
//     var mid = process.env.Merchant_Id;
//     var key = process.env.Merchant_Key;
//     var website = process.env.Website;
//     var client_id = process.env.client_id;
//     var callbackUrl = process.env.Callback;
//     Paytm.MerchantProperties.setCallbackUrl(callbackUrl);
//     Paytm.MerchantProperties.initialize(env, mid, key, client_id, website);
//     Paytm.MerchantProperties.setConnectionTimeout(5000);
//     console.log("Connection Established");
//   } catch (e) {
//     console.log("Exception caught: ", e);
//     Paytm.LoggingUtil.addLog(
//       Paytm.LoggingUtil.LogLevel.INFO,
//       "DemoApp",
//       "Exception caught: ",
//       e
//     );
//     console.log("Failed");
//   }
// }

// middleware();

// function generateRandomString(count) {
//   var ALPHA_NUMERIC_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//   var charactersLength = ALPHA_NUMERIC_STRING.length;
//   var rand = "";
//   for (var i = 0; i < count; i++) {
//     var start = Math.floor(Math.random() * charactersLength) + 1;
//     rand += ALPHA_NUMERIC_STRING.substr(start, 1);
//   }
//   return rand;
// }
// app.post("/api/pay", async (req, res) => {
//   try {
//     if (
//       req.body.email == "" ||
//       req.body.firstName == "" ||
//       req.body.lastName == "" ||
//       req.body.phone == ""
//     ) {
//       return res.json({
//         validation: false,
//         message: "Please fill all the details",
//       });
//     }
//     var channelId = Paytm.EChannelId.WEB;
//     var orderId = generateRandomString(10);
//     var txnAmount = Paytm.Money.constructWithCurrencyAndValue(
//       Paytm.EnumCurrency.INR,
//       "10.00"
//     );
//     var customerId = generateRandomString(10);
//     var userInfo = new Paytm.UserInfo(customerId);
//     userInfo.setEmail(req.body.email);
//     userInfo.setFirstName(req.body.firstName);
//     userInfo.setLastName(req.body.lastName);
//     userInfo.setMobile(req.body.phone);

//     var paymentDetailBuilder = new Paytm.PaymentDetailBuilder(
//       channelId,
//       orderId,
//       txnAmount,
//       userInfo
//     );
//     var paymentDetail = paymentDetailBuilder.build();
//     var response = await Paytm.Payment.createTxnToken(paymentDetail);

//     let amount = "10.00";
//     var details = {
//       mid: process.env.Merchant_Id,
//       orderId,
//       CHECKSUMHASH: response.responseObject.head.signature,
//       txnToken: response.responseObject.body.txnToken,
//       TXN_AMOUNT: amount,
//       WEBSITE: "WEBSTAGING",
//     };
//     let dbObj = await getDBObject();
//     let obj = await dbObj.db.collection(db).insertOne({
//       orderId,
//       email: req.body.email,
//       firstName: req.body.firstName,
//       lastName: req.body.lastName,
//       phone: req.body.phone,
//       status: "pending",
//       amount

//     });
//     dbObj.conn.close();
//     console.log(details);
//     res.send(details);
//   } catch (err) {
//     console.log(err);
//     res.send(err);
//   }
// });

// app.post("/api/callback", async (req, res) => {
//   try {
//     console.log(req.body);
//     var orderId = req.body.ORDERID;
//     var readTimeout = 80000;
//     var paymentStatusDetailBuilder = new Paytm.PaymentStatusDetailBuilder(
//       orderId
//     );
//     var paymentStatusDetail = paymentStatusDetailBuilder
//       .setReadTimeout(readTimeout)
//       .build();
//     var response = await Paytm.Payment.getPaymentStatus(paymentStatusDetail);
//     console.log(response);
//     if (
//       response.responseObject.body.resultInfo.resultStatus === "TXN_SUCCESS"
//     ) {
//       res.status(200);
//       let dbObj = await getDBObject();
//       await dbObj.db.collection(db).updateOne({ "orderId": orderId }, {
//         $set: {
//           "amount": response.responseObject.body.txnAmount,
//           "status": "success",
//           "bankid": response.responseObject.body.bankTxnId,
//           "txnDate": response.responseObject.body.txnDate,
//           "txnId": response.responseObject.body.txnId,
//         }
//       }, { "upsert": true });
//       dbObj.conn.close();
//       // const params = new URLSearchParams("/confirmation")
//       // params.append("orderId", orderId);
//       // params.append("orderId", orderId);
//       // params.append("orderId", orderId);
//       res.redirect("/confirmation/" + orderId);
//       // res.send(response.responseObject.body)
//     } else {
//       let dbObj = await getDBObject();
//       await dbObj.db.collection(db).updateOne({ "orderId": orderId }, {
//         $set: {
//           "status": "failed",
//         }
//       }, { "upsert": true });
//       dbObj.conn.close();
//       res.redirect("/confirmation/" + orderId);
//     }
//   } catch (err) {
//     console.log(err);
//   }
// });
// app.get("/api/confirmation/:orderId", async (req, res) => {
//   try {
//     const orderid = req.params.orderId;
//     let dbObj = await getDBObject();
//     let obj = await dbObj.db.collection(db).findOne({ "orderId": orderid });
//     dbObj.conn.close();
//     res.json({
//       "orderId": obj.orderId,
//       "txnId": obj.txnId,
//       "txnDate": obj.txnDate,
//       "amount": obj.amount,
//       "status":obj.status
//     });
//   } catch { }
// });

// // app.get("/", function (req, res) {
// //   res.sendFile("index.html", { root: path.join(__dirname, "./build/") });
// // });
// app.get('*', (req, res) => {
//   res.sendFile(process.cwd() + '/build/index.html');
// })
// app.listen(PORT, () =>
//   console.log(`Server running on port: http://localhost:${PORT}`)
// );

