'use strict';
// use model
var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var RoomSchema = new Schema({
    name: {
        type: String,
        required: 'Please fill a Room name',
    },
    roomid: {
        type: String,
        required: 'Please fill a roomid',
    },
    members: [{
        _id: String
    }],
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

mongoose.model("Room", RoomSchema);