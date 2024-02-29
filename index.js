const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const mongoose = require("mongoose");
const app = express();
const authenticateUser = require("./middleware/authMiddleware")
const port = process.env.PORT || 4000;
const bodyParser = require("body-parser");
const cors = require("cors");

app.use(bodyParser.json());
app.use(cors());

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });



app.use("/api", require("./routes/user"));
app.use('/api', authenticateUser);
app.use("/api", require("./routes/task"));

app.get("/health", (req, res) => {
  const dbstatus =
    mongoose.connection.readyState === 1 ? "connected" : "disconnected";
  res.status(200).json({
    server: "Running",
    database: dbstatus,
  });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
