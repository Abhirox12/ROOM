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

const app = express();
const httpServer = createServer(app);
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
  res.redirect("/index.html")
})


httpServer.listen(3000);








// app.get("/registerUser", async (req, res) => {
//   try {
//     let fakeuser = new User({
//       username: "delta-student",
//     });
//     let result = await fakeuser.save();
//     res.send(result);
//   } catch (err) {
//     console.log("ERROR:", err);
//     res.send("error");
//   }
// });
