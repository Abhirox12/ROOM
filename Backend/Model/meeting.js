import { Schema } from "mongoose";

const meetingSchema = new Schema({
    Hostname: {
        type: String,
        required: true
    },
    joiner:{
        type:String,
        // required:true
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