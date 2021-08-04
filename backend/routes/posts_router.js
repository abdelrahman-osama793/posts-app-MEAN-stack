const express = require("express");
const multer = require("multer");

const router = express.Router();

const Post = require("../models/post_model");
const isAuth = require("../middleware/auth");

const mime_types = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = mime_types[file.mimetype];
    let error = new Error("Invalid mime type");
    if (isValid) {
      error = null;
    }
    cb(error, "backend/images");
  },
  filename: (req, file, cb) => {
    const fileName = file.originalname.toLowerCase().split(" ").join("-");
    const fileExtension = mime_types[file.mimetype];
    cb(null, fileName + "-" + Date.now() + "." + fileExtension);
  },
});

router.post(
  "",
  isAuth,
  multer({ storage: storage }).single("image"),
  (req, res, next) => {
    const url = req.protocol + "://" + req.get("host");
    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imagePath: url + "/images/" + req.file.filename,
      creator: req.userData.userId,
    });
    console.log(post);
    post.save().then((createdPost) => {
      res.status(201).json({
        message: "Post Added Successfully",
        post: {
          ...createdPost,
          id: createdPost._id,
        },
      });
    });
  }
);

router.get("", (req, res, next) => {
  const pageSize = +req.query.pagesize;
  const currentPage = +req.query.page;
  const postQuery = Post.find();
  let allPosts;
  if (pageSize && currentPage) {
    //To skip the items shown on previous pages
    postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
  }
  postQuery
    .then((documents) => {
      allPosts = documents;
      return Post.count();
    })
    .then((count) => {
      res.status(200).json({
        message: "Posts fetched successfully",
        posts: allPosts,
        totalPosts: count,
      });
    });
});

router.get("/:id", (req, res, next) => {
  const id = req.params.id;
  Post.findById(id).then((post) => {
    if (post) {
      res.status(200).json(post);
    } else {
      res.status(400).json({ message: "Post not found" });
    }
  });
});

router.delete("/:id", isAuth, (req, res, next) => {
  const id = req.params.id;
  Post.deleteOne({ _id: id, creator: req.userData.userId }).then(() => {
    if (result.n > 0) {
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res
        .status(401)
        .json({ message: "Deleting Failed. You are not Authorized" });
    }
  });
});

router.put(
  "/:id",
  isAuth,
  multer({ storage: storage }).single("image"),

  (req, res, next) => {
    let imagePath = req.body.imagePath;
    if (req.file) {
      const url = req.protocol + "://" + req.get("host");
      imagePath = url + "/images/" + req.file.filename;
    }
    const id = req.params.id;
    const post = new Post({
      _id: req.body.id,
      title: req.body.title,
      content: req.body.content,
      imagePath: imagePath,
      creator: req.userData.userId,
    });
    Post.updateOne({ _id: id, creator: req.userData.userId }, post).then(() => {
      if (result.nModified > 0) {
        res.status(200).json({ message: "Updated successfully" });
      } else {
        res
          .status(401)
          .json({ message: "Updating Failed. You are not Authorized" });
      }
    });
  }
);

module.exports = router;
