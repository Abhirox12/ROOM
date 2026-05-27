import mongoose from "mongoose";
const Schema = mongoose.Schema;

const meetingSchema = new Schema({
    Hostname: {
        type: String,
        required: true
    },
    joiner:{
        type:Schema.Types.ObjectId,
        ref:"Guest"
    },
    meetingCode: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    }
})

const Meeting = mongoose.model("Meeting", meetingSchema);

export {Meeting}