const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser")

const app = express();
require("dotenv").config();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());
const PORT = process.env.PORT || 5000;

// Database connection
const connectToDatabase = require("./config/database")
connectToDatabase();

const adminRouter = require("./routes/admin")

// Routes
app.use("/api/admin", adminRouter);

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})