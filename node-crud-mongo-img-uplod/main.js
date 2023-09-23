// Imports the package
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const { route } = require("./router/routes");
const router = require("./router/routes");

const app = express();
const PORT = process.env.PORT || 4000;

// Databses conetion
mongoose.connect(process.env.DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", (error) => console.log(error));
db.once("open", () => console.log("connected to the database!"));

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static("uploads"));

app.use(
  session({
    secret: "my secret key",
    saveUninitialized: true,
    resave: false,
  })
);

app.use((req, res, next) => {
  res.locals.message = req.session.message;
  delete req.session.message;
  next();
});

app.use(express.static("uploads"));

/// Set template engine
app.set("view engine", "ejs");

// Router prefix
app.use("", require("./router/routes"));

app.listen(PORT, () => {
  console.log(`server started at http://localhost:${PORT}`);
});
