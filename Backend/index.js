import dotenv from 'dotenv'
dotenv.config()
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { createServer } from "node:http";
import { connectToSocket } from "./Controller/socket.js";
import { fileURLToPath } from "url";
import userRouter from "./routes/userRoutes.js";
import cors from "cors";

// recreate __filename
const __filename = fileURLToPath(import.meta.url);

// recreate __dirname
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 3000
const app = express();
const httpServer = createServer(app)
const io = connectToSocket(httpServer)

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}))
app.use(express.static(path.join(__dirname, "Public")))
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/", userRouter)
async function main() {
  await mongoose.connect(process.env.MONGO_URL)
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
app.get("/", (req, res) => {
  res.send("connected")
})


httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

