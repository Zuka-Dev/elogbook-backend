const express = require("express");
const AuthRoute = require("./src/routes/authRoutes.js");
const EnrollRoute = require("./src/routes/enrollRoutes.js");
const LogbookRoute = require("./src/routes/logbookRoutes.js");
const AdminRoute = require("./src/routes/adminRoutes.js");
const dotenv = require("dotenv");
const cors = require("cors");
const sequelize = require("./src/config/database.js");

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", AuthRoute);
app.use("/api/enroll", EnrollRoute);
app.use("/api/logbook", LogbookRoute);
app.use("/api/admin", AdminRoute);

// Sync database
sequelize
  .sync()
  .then(() => console.log("📦 Database connected"))
  .catch((err) => console.error("❌ Database connection failed", err));

const port = process.env.PORT || 3030;
app.listen(port, () => console.log(`Port is running at ${port}`));
