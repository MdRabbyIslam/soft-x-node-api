const express = require("express");
const Book = require("../model/book");
const router = express.Router();
const Order = require("../model/order");

//getting all orders records
router.get("/", async (req, res) => {
  const allOrders = await Order.find().populate("books");
  try {
    res.status(200).json({
      count: allOrders.length,
      allOrders: { ...allOrders },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

//request single book
router.post("/", async (req, res) => {
  const myObj = { _id: req.body.bookId };
  try {
    const result = await Book.findById(req.body.bookId);
    if (!result) {
      return res.status(404).json({
        message: "Your bookId is invalid",
      });
    }
    const newOrder = await new Order({
      books: [myObj],
      orderTime: req.body.orderTime,
    }).save();
    res.status(200).json({
      message: "sucessfully ordered",
      OrderedItem: newOrder.books.length,
      orders: newOrder.books,
    });
  } catch (err) {
    res.status(500).json({
      message: "Your book id length is not right",
      error: err.message,
    });
  }
});

// request for all books
router.post("/orderAllBooks", async (req, res) => {
  try {
    const allBooks = await Book.find().select("_id");

    const orders = new Order({
      name: "rabby islam",
      orderDate: req.body.orderDate,
      books: allBooks,
    });
    const result = await orders.save();
    res.status(200).json({
      message: "All books ordered successfully",
      orderedItem: result.books.length,
      orders: [{ ...result.books }],
      request: {
        method: "GET",
        url: "http://localhost:3000/orders",
      },
    });
  } catch (err) {
    res.json({
      message: err.message,
      error: err,
    });
  }
});

module.exports = router;
