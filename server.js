require("dotenv").config();
const dns = require("node:dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path"); 


const connectDB = require("./config/db");


const app = express();

connectDB();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use('/uploads', express.static(path.resolve(process.cwd(), 'public', 'uploads')));
app.use("/api/v1/user", require("./routes/userRoutes"))

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "API Running"
  });
});





const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});