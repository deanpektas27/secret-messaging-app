const express = require('express');
const router = express.Router();

// Require controller modules
const userController = require("../controllers/userController");


// USER ACCOUNT ROUTES //

// GET home page
router.get("/", userController.index);

// GET sign up form to create new user
router.get('/sign-up', userController.sign_up);

// GET secret club join to enter secret code
router.get('/member-join', userController.member_join);

// GET request to delete message (as admin)
router.get('/message/:id/delete', userController.message_delete_get);

// POST request to delete message (as admin)
router.post('/message/:id/delete', userController.message_delete_post);

// POST request for secret club join
router.post('/secret-member-join', userController.member_join_post);

// POST request for creating a new user
router.post("/sign-up", userController.user_create_post);


router.get("/log-out", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("/");
  });
});

// MESSAGE ROUTES //

// GET form to create user message
router.get("/message-create", userController.user_createmessage_get);

router.post("/message-create", userController.user_createmessage_post);

module.exports = router;
