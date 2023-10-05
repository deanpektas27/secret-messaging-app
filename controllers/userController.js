require('dotenv').config()
const { body, validationResult } = require("express-validator");
const User = require("../models/user");
const Message = require("../models/message");
const bcrypt = require("bcryptjs");
const session = require('express-session');

const asyncHandler = require("express-async-handler");


exports.index = asyncHandler(async (req, res, next) => {
    // Render index and messages, use template to show certain info
    const allMessages = await Message.find({}, "sender message createdAt")
    .sort({ timestamps: 1 })
    .populate("sender")
    .populate("message")
    .populate("createdAt")
    .populate("_id")
    .exec();

    res.render('index', { user: req.user, title: 'Members Only 🤫', message_list: allMessages, errors: req.session.messages });
    console.log(req.session.messages);
})

exports.sign_up = asyncHandler(async (req, res, next) => {
    // Render signup form
    res.render('sign-up-form', { title: "Sign Up", user: undefined, errors: null });
})

exports.user_createmessage_get = asyncHandler(async (req, res, next) => {
    res.render('message-form', { title: "Create Message", errors: null });
})

exports.user_createmessage_post = [
    body("msg")
      .trim()
      .isLength({ min: 1 })
      .withMessage("A message needs atleast 1 character or more")
      .escape(),

      asyncHandler(async (req, res, next) => {
        const errors = validationResult(req);
        const message = new Message({
            sender: req.user.firstname,
            message: req.body.msg,
        });

        if(!errors.isEmpty()) {
            res.render("message-form", {
                title: "Create Message",
                message: message,
                errors: errors.array(),
            });
            return;
        } else {
            await message.save();
            res.redirect("/");
        }       
      })
]

exports.member_join = asyncHandler(async (req, res, next) => {
    // Render secret club join
    res.render('member-join', { title: "Enter secret code", errors: null });
})

exports.member_join_post = [
    body("secretcode")
      .custom((value) => {
        return value === process.env.SECRET_CODE
      }).withMessage('Access denied'),

      asyncHandler(async (req, res, next) => {
        console.log(req.user);
        const errors = validationResult(req);

        if(!errors.isEmpty()) {
            res.render("member-join", {
                title: "Enter secret code",
                errors: errors.array()
            })
            return;
        } else {
            try{
                await User.findOneAndUpdate({ username: req.user.username }, {memberStatus: true}).exec();
                res.redirect("/");
            } catch(err) {
                console.log(err)
            }
        }
      })
]

exports.user_create_post = [
    // validate and sanitize fields.
    body("firstname", "First name must not be empty.")
      .trim()
      .isLength({ min: 2 })
      .withMessage('First name must have atleast 2 characters or more.')
      .escape(),
    body("lastname", "Last name must not be empty.")
      .trim()
      .isLength({ min: 3 })
      .withMessage('Last name must have atleast 3 characters or more.')
      .escape(),
    body("username", "Username must not be empty.")
      .trim()
      .isLength({ min: 4 })
      .withMessage('Username must have atleast 4 characters or more.')
      .escape(),
    body("password", "Password must not be empty")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Password must have alteast 5 characters or more.")
      .escape(),
    body("confirmpassword")
      .custom((value, { req }) => {
        return value === req.body.password;
    }).withMessage("Passwords do not match"),

    asyncHandler(async (req, res, next) => {
        try {
          bcrypt.hash(req.body.password, 10, async(err, hashedPassword) => {
            if(err) {
                return err
            } else {
                // extract validation errors from request.
                const errors = validationResult(req);
                // Create user object with escaped and trimmed data.
                const user = new User({
                    firstname: req.body.firstname,
                    lastname: req.body.lastname, 
                    username: req.body.username,
                    password: hashedPassword,
                    memberStatus: false,
                    isAdmin: false
                });

                if (!errors.isEmpty()) {
                    // There are errors. Render form again with 
                    // sanitized values/error messages.
                    res.render("sign-up-form", {
                        title: "Sign Up",
                        user: user,
                        errors: errors.array(),
                    });
                    return;
                } else {
                    // Data from form is valid
                    await user.save();
                    res.redirect("/");
                }
            }
          })
        } catch(err) {
            return next(err);
        };
    })
]

exports.message_delete_get = asyncHandler(async (req, res, next) => {
    const message = await Message.findById(req.params.id).populate("message").exec();
    res.render("message-remove", {
        title: "Remove Message",
        message: message
    })

})

exports.message_delete_post = asyncHandler(async (req, res, next) => {
    console.log(req.body.messageid);
    await Message.findByIdAndRemove(req.body.messageid);
    res.redirect("/");
})
