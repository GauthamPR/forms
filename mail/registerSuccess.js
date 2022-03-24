module.exports = function (req) {
    return (

       ` <html>
            <head>
                <style type="text/css">

                body {

                    font-family: "Poppins";
                    display:flex;
                    justify-content:center;
                    align-items:center;
                  
                  }
                .eventform_con {
                    max-width: 600px;
                    width: 100%;
                }
                
                .eventdetails_dnt {
                    color: gray;
                    margin-bottom: 10px;
                    font-weight: 500;
                    margin-top: 40px;
                
                }
                
                .eventdetails_title {
                    font-size: 30px;
                    margin-bottom: 10px;
                
                }
                
                .eventdetails_des {
                    color: gray;
                    margin-bottom: 30px;
                    font-size: 14px;
                    line-height: 26px;
                }
                
                .register {
                    margin-bottom: 20px;
                
                }
                
                .paymentDetails_title{
                    width: 100%;
                    padding: 10px;
                    height: 45px;
                    background-color: #eff2f5;
                    border: none;
                    border-radius: 10px;
                    font-size: 14px;
                    font-weight: 600;
                    display: flex;
                    align-items: center ;
                    margin-bottom: 10px;
                  }
                  .paymentDetails_grid{
                    padding: 10px;
                    font-size: 14px;
                    display: grid;
                    word-wrap: break-word;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 20px
                  }
                  .txn{
                    word-break: break-all;
                  }
                  .confirm{
                    /* margin-top: 20px; */
                    font-size: 16px;
                    font-weight: 500;
                  }
                  .red,.failed{
                    color: red;
                  }
                  .pending{
                    color: yellow;
                  }
                  .success{
                    color: rgb(16, 255, 144);
                  }
                  .button{
                    padding: 10px;
                    background-color: #eff2f5;
                    border-radius: 10px;
                    margin-left: 10px;
                    border: none;
                    cursor: pointer;
                  }
                  @media only screen and (max-width: 600px) {
                    .eventform_con {
                        width: 80%;
                    }
                }
                
}

                </style>
            </head>

            <body>
                <div class="eventform_con">
                    <div class="eventdetails">
                        <p class="eventdetails_dnt">Event Registration Confirmation</p>
                        <h3 class="eventdetails_title">IEEE Job Fair 2022</h3>
                        ${req.paymentStatus !== undefined && req.paymentStatus === "success" ? `<p class="eventdetails_des">Thank you for registering for the event. A copy of the receipt has been sent to your registered email</p>` :
                            `<p class="eventdetails_des red">${req.paymentStatus !== "failed" ? "The payment is yet to be recieved" : "The transaction has failed"}</p>`
                        }
                    </div>
                    <div class="paymentDetails">
                        <p class="paymentDetails_title">Payment Details</p>
                        <div class="paymentDetails_grid">
                            ${req.orderId !== undefined ?
                                `<p>Order Id</p> <p>${req.orderId}</p>` :''}
                            ${req.txnId !== undefined ?
                                `<p >Transaction Id</p> <p class={styles.txn}>${req.txnId}</p>` :''}
                            ${req.paymentStatus !== undefined ?
                                `<p>Payment Status</p> <p>${req.paymentStatus}</p>` :''}
                            ${req.amount !== undefined ?
                                `<p>Amount</p> <p>${req.amount}</p>` :''}
                            ${req.txnDate !== undefined ?
                                `<p>Date</p> <p>${new Date(req.txnDate).toLocaleDateString()} ${new Date(req.txnDate).toLocaleTimeString()}</p>` : ''}



                        </div>
                    </div>
                    <div class="paymentDetails">
                        <p class="paymentDetails_title">Event Details</p>
                        <div class="paymentDetails_grid">
                            <p>Date and Time</p> <p>12th Mar 2022 11:00 PM IST</p>
                            <p>Venue</p> <p>Kottayam, Kerala</p>

                        </div>

                    </div>


                </div>

            </body>
        </html>`

    );
}
