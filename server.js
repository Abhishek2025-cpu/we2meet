require("dotenv").config();
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path"); 

const connectDB = require("./config/db");

const http = require("http");

const initSocket = require("./Socket/socket"); 

const app = express();
const server = http.createServer(app);

initSocket(server);

connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use("/api/user", require("./routes/userRoutes"))
app.use("/api/interset", require("./routes/invitationRoutes"))
app.use("/api/profile", require("./routes/profileDetailRoutes"));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public", "uploads"))
);

app.use("/api/v1/user", require("./routes/userRoutes"));
app.use("/api/v1/interset", require("./routes/invitationRoutes"));
app.use("/api/v1/chat", require("./routes/chatRoutes"));
app.use("/api/v1/home", require("./routes/homeRoutes"));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Running",
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});