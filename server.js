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
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);
const successStoryRoutes =
  require("./routes/successStory.routes");

app.use(
  "/api/success-stories",
  successStoryRoutes
);

app.use(
  "/api/users",
  require("./routes/user.routes")
);

const profileViewRoutes =
  require("./routes/profileView.routes"); 

  app.use(
    "/api/profile-views",
    profileViewRoutes
  );

  const adminRoutes = require(
  "./routes/admin.routes"
);

app.use(
  "/api/admin",
  adminRoutes
);

const interactionRoutes = require(
  "./routes/interaction.routes"
);

app.use(
  "/api/interactions",
  interactionRoutes
);

const planRoutes = require(
  "./routes/plan.routes"
);
app.use("/api/plans", planRoutes);

const adminPlanRoutes = require(
  "./routes/adminPlan.routes"
);

app.use(
  "/api/notifications",
  require(
    "./routes/notification.routes"
  )
);

app.use(
  "/api/admin",
  adminPlanRoutes
);


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