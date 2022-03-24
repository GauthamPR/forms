import styles from './Job.module.css';
import Input from '../../ui-components/input2';
import { Formik } from 'formik';
import * as yup from 'yup';
import axios from 'axios';
import Loader from '../../components/loader';
import { useState } from 'react';
import Error from '../../components/error';
import Select from '../../ui-components/select';
import DragandDrop from '../../ui-components/draganddrop';
import Radio from '../../ui-components/radio';
import Helmet from 'react-helmet';

export default function JobFair() {


    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const [errorMsg, setErrorMsg] = useState(false);

    // const user = {
    //     email: "",
    //     firstName: "",
    //     lastName: "",
    //     phone: undefined,
    //     institute: "",
    //     branch: "",
    //     CGPA: "",
    //     backlog: 0,
    //     membershipId: undefined,
    //     yearofPassout: undefined,
    //     ieeeMember: undefined,
    //     resume: undefined,
    //     package: undefined
    // }
    const user = {
        email: "abhijithkannan452@gmail.com",
        firstName: "A",
        lastName: "BB",
        phone: 123685,
        institute: "CEK",
        branch: "EEE",
        CGPA: 1.25,
        backlog: 0,
        membershipId: 1299696,
        yearofPassout: 2021,
        ieeeMember: true,
        resume: undefined,
        package: 250
    }

    let schema = yup.object().shape({
        email: yup.string().email().required(),
        firstName: yup.string().required(),
        lastName: yup.string().required(),
        phone: yup.number().required(),
        institute: yup.string().required(),
        branch: yup.string().required(),
        CGPA: yup.number().required(),
        backlog: yup.number(),
        membershipId: yup.number(),
        yearofPassout: yup.number().required(),
        ieeeMember: yup.boolean().required(),
        resume: yup.mixed().required(),
        package: yup.number().required()
    });
    function isDate(val) {
        // Cross realm comptatible
        return Object.prototype.toString.call(val) === '[object Date]'
    }

    function isObj(val) {
        return typeof val === 'object'
    }

    function stringifyValue(val) {
        if (isObj(val) && !isDate(val)) {
            return JSON.stringify(val)
        } else {
            return val
        }
    }

    function buildForm({ action, params }) {
        const form = document.createElement('form')
        form.setAttribute('method', 'post')
        form.setAttribute('action', action)

        Object.keys(params).forEach(key => {
            const input = document.createElement('input')
            input.setAttribute('type', 'hidden')
            input.setAttribute('name', key)
            input.setAttribute('value', stringifyValue(params[key]))
            form.appendChild(input)
        })

        return form
    }

    function post(details) {
        const form = buildForm(details)
        document.body.appendChild(form)
        form.submit()
        form.remove()
    }
    const handleUpload = async (values) => {
        setLoading(true);
        try {

            var formData = new FormData()
            var key = Object.keys(values)
            console.log(values["email"])
            console.log(key)
            key.forEach((val) => {
                formData.append(val, values[val])
            })
            console.log(formData)
            const res = await axios.post("/api/jobfair/pay", formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    }

                }
            )
            var details = {
                action: "https://securegw-stage.paytm.in/order/process",
                params: res.data
            }

            post(details);
        }
        catch (err) {
            // console.log(err.response.data);
            setError(true)
            setErrorMsg(err.response !== undefined ? err.response.data.error : err)
            setLoading(false);
        }

    }

    const yop = [
        { value: '2022', label: '2022' },
        { value: '2021', label: '2021' },
        { value: '2020', label: '2020' }
    ]
    const options = [
        { value: true, label: 'Yes' },
        { value: false, label: 'No' },

    ]
    return (


        <div className={styles.container}>
            <Helmet>
                <title>IEEE Job Fair 2022</title>
            </Helmet>
            <main className={styles.main}>
                <div className={styles.eventdetails_con} >
                    <img src="./banner.jpeg" className={styles.image} />

                    <div className={styles.eventdetails} >

                        <p className={styles.eventdetails_dnt} >REGISTRATION FORM</p>
                        <h3 className={styles.eventdetails_title} >IEEE Job Fair 2022</h3>
                    </div>
                </div>
                <div className={styles.eventform} >

                    {error ? <Error setError={setError} msg={errorMsg} /> : null}
                    {loading ?

                        <>
                            <Loader msg="Don&apos;t refresh this page. Redirecting to payment processing service ..." />

                        </>
                        :


                        <div className={styles.eventform_con} >
                            <Formik
                                initialValues={user}
                                validationSchema={schema}
                                onSubmit={(values) => { handleUpload(values) }}
                            >
                                {({ values, setFieldValue, handleSubmit, errors }) => (
                                    <>


                                        <Input label="First Name *"
                                            placeholder={"Enter your first name"}
                                            value={values}
                                            name="firstName"
                                            setFieldValue={setFieldValue}
                                            errors={errors}></Input>
                                        <Input label="Last Name *"
                                            placeholder={"Enter your last name"}
                                            value={values}
                                            name="lastName"
                                            setFieldValue={setFieldValue}
                                            errors={errors}></Input>
                                        <Input label="Email *"
                                            placeholder={"Enter your email addrees"}
                                            value={values}
                                            name="email"
                                            setFieldValue={setFieldValue}
                                            errors={errors}></Input>
                                        <Input label="Phone *"
                                            placeholder={"Enter your phone number"}
                                            value={values}
                                            name="phone"
                                            setFieldValue={setFieldValue}
                                            errors={errors}></Input>
                                        <Input label="College/Institution Name *"
                                            placeholder={"Enter your College/Institution name"}
                                            value={values}
                                            name="institute"
                                            setFieldValue={setFieldValue}
                                            errors={errors}></Input>
                                        <Input label="Branch *"
                                            placeholder={"Enter your branch"}
                                            value={values}
                                            name="branch"
                                            setFieldValue={setFieldValue}
                                            errors={errors}></Input>
                                        <Input label="CGPA *"
                                            placeholder={"Total CGPA till 6th Semester"}
                                            value={values}
                                            name="CGPA"
                                            setFieldValue={setFieldValue}
                                            errors={errors}></Input>
                                        <Select
                                            label="Year of passout *"
                                            options={yop}
                                            name="yearofPassout"
                                            value={[{ value: values["yearofPassout"], label: values["yearofPassout"] }]}
                                            setFieldValue={setFieldValue}
                                            errors={errors} />

                                        <Input label="Number of backlog (If any) "
                                            placeholder={""}
                                            value={values}
                                            name="backlog"
                                            setFieldValue={setFieldValue}
                                            errors={errors}></Input>
                                        <Select
                                            label="Are an IEEE member? *"
                                            options={options}
                                            name="ieeeMember"
                                            value={[{ value: values["ieeeMember"], label: values["ieeeMember"] ? "Yes" : values["ieeeMember"] !== undefined ? "No" : undefined }]}
                                            setFieldValue={setFieldValue}
                                            errors={errors} />
                                        <Input label="IEEE Membership Number"
                                            placeholder={"If you are an IEEE member, please enter your valid IEEE membership number here"}
                                            value={values}
                                            name="membershipId"
                                            setFieldValue={setFieldValue}
                                            errors={errors}></Input>


                                        <DragandDrop
                                            label="Upload Resume *"
                                            accept='application/pdf'
                                            files={values}
                                            name="resume"
                                            setFiles={setFieldValue}
                                            errors={errors} />
                                        <Radio
                                            label="Select your package"
                                            value={values}
                                            name="package"
                                            setFieldValue={setFieldValue}
                                            options={[
                                                { value: 250, name: "IEEE Member" },
                                                { value: 500, name: "Non IEEE Member" }

                                            ]}
                                            errors={errors} />
                                        <button className={styles.button} onClick={handleSubmit}>
                                            SUBMIT
                                        </button>
                                        {/* {JSON.stringify(values, null, 2)} */}

                                    </>
                                )}
                            </Formik>

                            <footer className={styles.footer}>
                                <p>This content is created by the owner of the form. The data you submit will be sent to the form owner. IEEE Kerala Section is not responsible for the privacy or security practices of its customers, including those of this form owner. Never give out your password.</p>
                                <br />Powered by IKS Mint Forms | <a style={{ color: "blue" }} href='https://ieee-mint.org/privacy'>Privacy and cookies</a> | <a style={{ color: "blue" }} href='https://ieee-mint.org/terms'>Terms of use</a>
                            </footer>
                        </div>

                    }

                </div>

            </main>

        </div>


    )
}
