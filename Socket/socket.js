const { Server } = require("socket.io");

function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join_chat", (conversationId) => {
      socket.join(conversationId);
    });

    socket.on("send_message", (data) => {
      io.to(data.conversationId).emit("receive_message", data);
    });

    socket.on("typing", (data) => {
      socket.to(data.conversationId).emit("typing", data);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  return io;
}

module.exports = initSocket;