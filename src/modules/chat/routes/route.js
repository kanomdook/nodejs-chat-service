'use strict';
var controller = require('../controllers/controller'),
    policy = require('../policy/policy');
module.exports = function (app) {
    var url = '/api/chats';
    var urlWithParam = '/api/chats/:chatId';
    app.route(url)//.all(policy.isAllowed)
        .get(controller.getList, controller.send)
        .post(controller.create);

    app.route(urlWithParam)//.all(policy.isAllowed)
        .get(controller.read)
        .put(controller.update)
        .delete(controller.delete);

    app.route(url + '/:receiverid/:senderid')
        .get(controller.getChatDetail, controller.sendChatDetail);

    app.param('chatId', controller.getByID);

    app.param('receiverid', controller.getReceiverid);
    app.param('senderid', controller.getSenderid);
}