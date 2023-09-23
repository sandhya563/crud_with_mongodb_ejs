const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const fs = require("fs");

// Upload the image
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "_" + Date.now() + "_" + file.originalname);
  },
});
var upload = multer({
  storage: storage,
}).single("image");

//  Insert an user data into database route
router.post("/add", upload, (req, res) => {
  const user = new User({
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    image: req.file.filename,
  });
  user
    .save()
    .then((savedDocument) => {
      if (savedDocument) {
        req.session.message = {
          type: "success",
          message: "User added successfully!",
        };
        res.redirect("/");
      }
    })
    .catch((error) => {
      res.json({ message: error.message, type: "danger" });
      console.error("Error saving document:", error);
    });
});

// Get all users router
router.get("/", (req, res) => {
  User.find()
    .exec()
    .then((users) => {
      if (users) {
        res.render("index", {
          title: "Home Page",
          users: users,
        });
      }
    })
    .catch((err) => {
      res.json({ message: err.message });
      console.err("Error saving document:", err);
    });
});

router.get("/add", (req, res) => {
  res.render("add_users", { title: "Add Users" });
});

// Edit an user router
router.get("/edit/:id", (req, res) => {
  let id = req.params.id;
  User.findById(id)
    .then((user) => {
      if (user === undefined) {
        res.redirect("/");
      } else {
        res.render("edit_users", {
          title: "Edit page",
          user: user,
        });
      }
    })
    .catch((err) => {
      if (err) {
        res.redirect("/");
      }
    });
});

// Update user route

router.post("/update/:id", upload, (req, res) => {
  let objectId = req.params.id;
  let new_image = "";
  if (req.file) {
    new_image = req.file.filename;
    try {
      fs.unlinkSync("./uploads/" + req.body.old_image);
    } catch (err) {
      console.log(err);
    }
  } else {
    new_image = req.body.old_image;
  }
  const {
    body: { name, email, phone },
  } = req;

  User.findByIdAndUpdate(objectId, {
    name,
    email,
    phone,
    image: new_image,
  })
    .then((result) => {
      if (result) {
        req.session.message = {
          type: "success",
          message: "User updated successfully",
        };
        res.redirect("/");
      } else {
        res.json({ message: "User not found", type: "danger" });
      }
    })
    .catch((err) => {
      res.json({ message: err.message, type: "danger" });
    });
});

 
/// Delete user route
router.get("/delete/:id", upload, async (req, res) => {
    try {
      const objectId = req.params.id;
      const result = await User.findByIdAndRemove(objectId);
  
      if (result.image !== '') {
        // Assuming you have a valid path to the uploads directory
        const imagePath = './uploads/' + result.image;
        
        try {
          fs.unlinkSync(imagePath);
        } catch (err) {
          console.error(err);
        }
      }
  
      req.session.message = {
        type: "info",
        message: "User deleted successfully",
      };
      res.redirect('/');
    } catch (error) {
      console.error(error);
      res.json({ message: error.message });
    }
  });
module.exports = router;
