'use strict';

const app = require('./src/config/app');
const server = require('http').createServer(app);
const socket = require('./src/modules/chat/controllers/socket-chat-controller')(server);
server.listen(3000, function () {
    console.log('Start server...');
});