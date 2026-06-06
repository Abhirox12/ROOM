import dotenv from 'dotenv'
dotenv.config()
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { createServer } from "node:https";
import { connectToSocket } from "./Controller/socket.js";
import fs from "fs"

import { fileURLToPath } from "url";
import userRouter from "./routes/userRoutes.js";
import cors from "cors";

// recreate __filename
const __filename = fileURLToPath(import.meta.url);

// recreate __dirname
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer({
  key: fs.readFileSync('key.pem'),
  cert: fs.readFileSync('cert.pem')
},app)
const io = connectToSocket(httpServer)

app.use(cors())
app.use(express.static(path.join(__dirname, "Public")))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", userRouter)
async function main() {
  await mongoose.connect('mongodb://127.0.0.1/room');
}

main().then(() => {
  console.log("connection done successfully")
}).catch((err) => {
  console.log(err)
})


io.on("connection", (socket) => {
  console.log('User connected:', socket.id);

  socket.on('message', (msg) => {
    console.log(msg);
    io.emit("message", msg);


  });

  socket.emit('welcome', 'Hello from server');
});
app.get("/",(req,res)=>{
  res.send("connected")
})


httpServer.listen(3000);


