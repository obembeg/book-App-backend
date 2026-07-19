const cors = require("cors");
const express = require("express");
const http = require("http");
const { initializeSocket } = require("./socket");

const app = express();
const server = http.createServer(app);

initializeSocket(server);

const config = require("config");
const port = process.env.PORT || config.get("Port");

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PATCH","PUT", "DELETE"],
  credentials: true,
}));
//Body Parser Middleware
app.use(express.json());

// Importing Routes
const category = require("./routes/category");
const book = require("./routes/book");
const user = require("./routes/user");
const profile = require("./routes/profile");
const error = require("./middleware/error");
const auth = require("./routes/auth");
const notificationRoute = require("./routes/notification");
const passwordReset = require("./routes/password");

// Router Middleware
app.use("/category", category);
app.use("/user", user);
app.use("/profile", profile);
app.use("/notification", notificationRoute);
app.use("/password", passwordReset);
app.use("/auth", auth);
app.use("/book", book);
//error handling middleware
app.use(error);

// app.listen(port, () => console.log(`Example app listening on port ${port}!`))
server.listen(port, () =>
  console.log(`Example app listening on port ${port}!`),
);
