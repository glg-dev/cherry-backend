const express = require("express");
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv").config();
const { checkUser, requireAuth } = require("./middleware/auth.middleware");
const cors = require("cors");

// DB connection
connectDB();

const app = express();

const corsOptions = {
  origin: process.env.CLIENT_URL,
  credentials: true,
  allowedHeader: ["sessionId", "Content-Type"],
  exposedHeaders: ["sessionId"],
  methods: "GET, HEAD, PUT, PATCH, POST, DELETE",
  preflightContinue: false,
};
app.use(cors(corsOptions));

// Middleware for req data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// JWT
app.get("*", checkUser);
app.get("/jwtid", requireAuth, (req, res) => {
  res.status(200).send(res.locals.user._id);
});

// Routes
app.use("/api/user", require("./routes/user.routes"));
app.use("/api/post", require("./routes/post.routes"));

// Server
app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)
);
