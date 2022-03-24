import axios from "axios";
import { useEffect, useState } from "react";
import Loader from "./loader";
import Error from "./error";
import styles from '../styles/Confirmation.module.css'
import { useParams } from 'react-router-dom';
import {Helmet} from "react-helmet";

export default function Confirmation() {
    const { id, type } = useParams();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [data, setData] = useState({
    })

    useEffect(async () => {
        try {
            const res = await axios.get(`/api/confirmation?id=${id}&type=${type}`);
            console.log(res.data)
            setLoading(false);
            setData(res.data)
        }
        catch (err) {
            setError(true)
            setErrorMsg(err.response !== undefined ? String(err) : String(err))
            // setLoading(false);
        }
    }, [id])

    return (
        <main className="main">
            <Helmet>
                <title>Confirmation</title>
            </Helmet>
            <div className="eventform">
                {error ? <Error setError={setError} msg={errorMsg} /> : null}
                {loading ?
                    <Loader msg="Loading receipt details" /> :
                    <div className="eventform_con">
                        <div className="eventdetails">
                            <p className="eventdetails_dnt">Event Registration Confirmation</p>
                            <h3 className="eventdetails_title">IEEE Job Fair 2022</h3>
                            {data.paymentStatus !== undefined && data.paymentStatus === "success" ? <p className="eventdetails_des">Thank you for registering for the event. A copy of the receipt has been sent to your registered email</p> :
                                <p className="eventdetails_des red">{data.paymentStatus !== "failed" ? "The payment is yet to be recieved" : "The transaction has failed"}</p>
                            }
                            {/* <p className="confirm"></p> */}
                        </div>
                        <div className="paymentDetails">
                            <p className="paymentDetails_title">Payment Details</p>
                            <div className="paymentDetails_grid">
                                {data.orderId !== undefined ?
                                    <><p>Order Id</p> <p>{data.orderId}</p></> : null}
                                {data.txnId !== undefined ?
                                    <><p >Transaction Id</p> <p className={styles.txn}>{data.txnId}</p></> : null}
                                {data.paymentStatus !== undefined ?
                                    <><p>Payment Status</p> <p className={styles[data.paymentStatus]}>{data.paymentStatus}</p></> : null}
                                {data.amount !== undefined ?
                                    <><p>Amount</p> <p>{data.amount}</p></> : null}
                                {data.txnDate !== undefined ?
                                    <><p>Date</p> <p>{new Date(data.txnDate).toLocaleDateString()} {new Date(data.txnDate).toLocaleTimeString()}</p></> : null}



                            </div>
                        </div>
                        <div className="paymentDetails">
                            <p className="paymentDetails_title">Event Details</p>
                            <div className="paymentDetails_grid">
                                <p>Date and Time</p> <p>12th Mar 2022 11:00 PM IST</p>
                                <p>Venue</p> <p>Kottayam, Kerala</p>
                                {/* <p>Amount</p> <p>Rs 10.00</p>
                            <p>Date</p> <p>12th Mar 2022 11:00 PM IST</p> */}

                            </div>

                        </div>

                        <div className={styles.buttons}>
                            <button className={styles.button} onClick={()=>window.print()}>Print</button>
                            <button className={styles.button}>Submit another</button>
                        </div>
                    </div>
                }
            </div>
        </main>
    );
}