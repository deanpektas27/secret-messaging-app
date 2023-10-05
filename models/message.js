const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const Message = mongoose.model(
    "Message",
    new Schema({
        sender: { type: String },
        message: { type: String, required: true},
    }, { timestamps: true })
);

module.exports = Message