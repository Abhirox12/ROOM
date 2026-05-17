import { Schema } from "mongoose";



const guestSchema = new Schema({
    username:{
        type:String,
        required:true
    },
    meetingCode:{
        type:String,
        required:true
    },
    date:{
        default: Date.now()
    }
})