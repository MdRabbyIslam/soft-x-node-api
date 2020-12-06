const express = require("express");
const router = express.Router();

const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, new Date().toDateString() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  //reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

const Book = require("../model/book");

//get all books records
router.get("/", async (req, res) => {
  try {
    const books = await Book.find();
    if (books) {
      res.status(200).json({
        count: books.length,
        products: books.map((book) => {
          return {
            _id: book._id,
            BookName: book.bookName,
            author: book.author,
            genre: book.genre,
            releaseDate: book.releaseDate,
            bookImage: book.bookImage,
            request: {
              type: "GET",
              url: `http://localhost:3000/books/${book._id}`,
            },
          };
        }),
      });
    } else {
      res.status(404).json({
        message: "Sorry there has no records",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

//get specific one book records
router.get("/:bookId", async (req, res) => {
  try {
    const findedBook = await Book.findById({ _id: req.params.bookId });

    if (findedBook) {
      res.status(200).json(findedBook);
    } else {
      res.status(500).json({
        message: "sorry with this id have no any valid book record",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

//update book records
router.patch("/:bookId", async (req, res) => {
  try {
    const updateOps = {};
    for (const ops of req.body) {
      updateOps[ops.propName] = ops.value;
    }
    const updatedBookRecords = await Book.updateOne(
      { _id: req.params.bookId },
      { $set: updateOps }
    );
    res.json(updatedBookRecords);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
  res.status(200).json({ message: "update books information" });
});

//delete book record
router.delete("/:bookId", async (req, res) => {
  try {
    const deletedBook = await Book.deleteOne({ _id: req.params.bookId });
    console.log(deletedBook);
    if (deletedBook._id) {
      res.json({
        message: "Successfully deleted",
        product: {
          id: deletedBook._id,
          bookName: deletedBook.bookName,
          author: deletedBook.author,
          request: {
            type: "POST",
            url: "http://localhost:3000/books",
          },
        },
      });
    } else {
      res.status(404).json({
        message: "sorry I think you have deleted already or you put wrong Id",
      });
    }
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

//add new book records
router.post("/", upload.single("bookImages"), async (req, res) => {
  console.log(req.file);

  try {
    const newBook = await new Book({
      bookName: req.body.bookName,
      author: req.body.author,
      genre: req.body.genre,
      releaseDate: req.body.releaseDate,
      bookImage: req.file.path,
    }).save();

    res.json({
      message: "Book added successfully",
      product: {
        _id: newBook._id,
        bookName: newBook.bookName,
        author: newBook.author,
        genre: newBook.genre,
        releaseDate: newBook.releaseDate,
        bookImage: newBook.bookImage,
        request: {
          type: "GET",
          url: `http://localhost:3000/books/${newBook._id}`,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
});

module.exports = router;
