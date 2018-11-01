'use strict';
var mongoose = require('mongoose'),
    model = require('../models/model'),
    Chat = mongoose.model('Chat'),
    errorHandler = require('../../core/controllers/errors.server.controller'),
    _ = require('lodash');

exports.getList = function (req, res, next) {
    Chat.find(function (err, datas) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            req.datas = datas;
            next();
        };
    });
};

exports.send = function (req, res) {
    var datas = [];
    var ids = [];
    req.datas.forEach(data => {
        if (ids.indexOf(data.receiver._id) === -1) {
            ids.push(data.receiver._id);
            datas.push({
                _id: data.receiver._id,
                name: data.receiver.username,
                img: data.receiver.img,
                dateTime: data.created,
                lastChat: data.message,
            });
        }

    });
    res.jsonp({
        status: 200,
        data: datas
    });
};

exports.create = function (req, res) {
    var newChat = new Chat(req.body);
    newChat.createby = req.user;
    newChat.save(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
};

exports.getByID = function (req, res, next, id) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).send({
            status: 400,
            message: 'Id is invalid'
        });
    }

    Chat.findById(id, function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            req.data = data ? data : {};
            next();
        };
    });
};

exports.read = function (req, res) {
    res.jsonp({
        status: 200,
        data: req.data ? req.data : []
    });
};

exports.update = function (req, res) {
    var updChat = _.extend(req.data, req.body);
    updChat.updated = new Date();
    updChat.updateby = req.user;
    updChat.save(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
};

exports.delete = function (req, res) {
    req.data.remove(function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data
            });
        };
    });
};

exports.getChatDetail = function (req, res) {
    Chat.find({ 'sender._id': req.senderid, 'receiver._id': req.receiverid }, function (err, data) {
        if (err) {
            return res.status(400).send({
                status: 400,
                message: errorHandler.getErrorMessage(err)
            });
        } else {
            res.jsonp({
                status: 200,
                data: data || []
            });
        }
    });

};

exports.getReceiverid = function (req, res, next, receiverid) {
    req.receiverid = receiverid;
    next();
};

exports.getSenderid = function (req, res, next, senderid) {
    req.senderid = senderid;
    next();
};
