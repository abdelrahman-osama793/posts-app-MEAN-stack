const mongoose = require("mongoose");

const URL =
  "mongodb+srv://abood:vzhYkYiIvk74esfa@cluster0.pnma7.mongodb.net/posts-api?retryWrites=true&w=majority";

mongoose
  .connect(URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Database connected");
  })
  .catch(() => {
    console.log("Connection Failed");
  });
