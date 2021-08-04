require("./db/mongoose");

const path = require("path");
const express = require("express");

const app = express();

const posts_router = require("./routes/posts_router");
const users_router = require("./routes/user_router");

app.use(express.json());
app.use("/images", express.static(path.join("backend/images")));

app.use((req, res, next) => {
  //Allows any domain to access our resources
  res.setHeader("Access-Control-Allow-Origin", "*");
  /*Restricts the access to certain domains sending requests 
  with a certain set of headers besides the default headers*/
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS, PUT"
  );
  next();
});

app.use("/api/posts", posts_router);
app.use("/api/users", users_router);

module.exports = app;
