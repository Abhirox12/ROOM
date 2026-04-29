import { Server } from "socket.io";
let messages = {}
let timeOnline = {}
let connections = {}


export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            methods: ["GET", "POST"],
            origin: "*",
            credentials: true
        }
    })

    io.on("connection", (socket) => {
        console.log("someone connected");
        socket.on("join-call", (roomId) => {
            socket.join(roomId)
            socket.to(roomId).emit("user-joined", socket.id);
            socket.emit("chat-history", messages[roomId] || []);

        })
        timeOnline[socket.id] = new Date();
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })
        socket.on("chat-messages", (data, sender, roomId, at) => {
            if (messages[roomId] === undefined) {
                messages[roomId] = []
            }
            messages[roomId].push({
                sender,
                data,
                socketId: socket.id,
                at: new Date()
            })
            socket.to(roomId).emit(sender, data, socket.id, at)
        })
        socket.on("chat-message", (data, sender, roomId, at) => {
            socket.to(roomId).emit("chat-message", data, sender, socket.id, at)
        })

        socket.on("disconnecting", () => {
            var diffTime = Math.abs(timeOnline[socket.id] - new Date())
            socket.rooms.forEach((roomId) => {
                if (socket.id !== roomId) {
                    socket.to(roomId).emit("user-left", socket.id)
                }
            })
        })

    })






    return io
};