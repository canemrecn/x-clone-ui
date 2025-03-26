// server.ts
import express from "express";
import http from "http";
import { Server, Socket } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket: Socket) => {
  console.log("Kullanıcı bağlandı:", socket.id);

  // Kullanıcı, özel DM odasına katılmak için "joinRoom" gönderiyor.
  socket.on("joinRoom", (roomId: string) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} ${roomId} odasına katıldı.`);
  });

  // DM mesajı gönderimi: odadaki kullanıcılara mesajı yayınla.
  socket.on("privateMessage", (data: { roomId: string; message: string; sender: string }) => {
    io.to(data.roomId).emit("privateMessage", { sender: data.sender, message: data.message });
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı ayrıldı:", socket.id);
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Socket.IO sunucusu http://localhost:${PORT} adresinde çalışıyor.`);
});
