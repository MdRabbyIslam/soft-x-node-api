//initialization
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv/config");
const port = process.env.PORT || 3000;
const booksRoute = require("./api/routes/books");
const ordersRoute = require("./api/routes/orders");

//app
const app = express();
//middlewars
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static("uploads"));
app.use(morgan("dev"));

//routes
app.use("/books", booksRoute);
app.use("/orders", ordersRoute);

//connet to mongoDb
mongoose.connect(
  `  mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.d4pds.mongodb.net/${process.env.DB_COLLECTION}?retryWrites=true&w=majority`,
  { useUnifiedTopology: true, useNewUrlParser: true },
  () => console.log("db connected")
);

app.use((req, res) => {
  const error = new Error("Not Found");
  res.status(404).json({
    message: error.message,
  });
});

app.get("/", (req, res) => {
  res.status(200).json({
    message: "we are at home page",
  });
});

//listening
app.listen(port, () => console.log(`server is running on port ${port}`));
