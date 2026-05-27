import mongoose from "mongoose";
const Schema = mongoose.Schema;


const guestSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    meetingCode: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    }
})

const Guest = mongoose.model("Guest", guestSchema)
export { Guest }