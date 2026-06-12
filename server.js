require("dotenv").config();
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");


const connectDB = require("./config/db");


const app = express();
const server = http.createServer(app);
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

connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public', 'uploads')));
app.use("/api/v1/user", require("./routes/userRoutes"))
app.use("/api/v1/chat", require("./routes/chatRoutes"))

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Running"
  });
});





const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

