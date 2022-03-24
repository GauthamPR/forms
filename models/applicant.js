const mongoose = require('mongoose');
const { number, boolean } = require('yup');
const Schema = mongoose.Schema;

const applicantSchema = new Schema({

    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    institute: { type: String, required: true },
    branch: { type: String, required: true },
    yearofPassout: { type: String, required: true },
    CGPA: { type: String, required: true },
    backlog: { type: Number },
    ieeeMember: { type: Boolean, required: true },
    resume: { type: String, required: true },
    orderId: { type: String, required: true },
    amount: { type: String, required: true },
    paymentStatus: { type: String, required: true },
    bankId: { type: String, required: true },
    txnDate: { type: String, required: true },
    txnId: { type: String, required: true }


}, { timestamps: true })

const Applicant = mongoose.model('Applicant', applicantSchema)
module.exports = Applicant;