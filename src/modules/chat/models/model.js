'use strict';
// use model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var ChatSchema = new Schema({
    name: {
        type: String,
        required: 'Please fill a Chat name',
    },
    img: String,
    sender: {
        _id: String,
        username: String,
        img: String
    },
    receiver: {
        _id: String,
        username: String,
        img: String
    },
    message: String,
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date
    },
    createby: {
        _id: {
            type: String
        },
        username: {
            type: String
        },
        displayname: {
            type: String
        }
    },
    updateby: {
        _id: {
            type: String
        },
        username: {
            type: String
        },
        displayname: {
            type: String
        }
    }
});

mongoose.model("Chat", ChatSchema);