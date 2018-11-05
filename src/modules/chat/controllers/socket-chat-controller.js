var mongoose = require('mongoose'),
    Chat = mongoose.model('Chat'),
    joinedData;
module.exports = (server) => {
    const io = require('socket.io')(server);
    io.on('connection', function (socket) {
        console.log('user connected');
        socket.on('joined', function (data) {
            joinedData = data;
            // socket.join(room);
            // socket.broadcast.to(data.roomid).emit('receiving', result);
            getChatListByReceiver(socket);
        });
        socket.on('message', function (data) {
            createMessage(data, socket);
        });
        socket.on('chat-list', function (data) {
            getMessageDetailList(data, socket);
        });
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });

    return io;
};

function getChatListByReceiver(socket) {
    Chat.find().sort({ created: -1 }).exec(function (err, result) {
        if (err) {
            socket.emit('message', []);
        } else {
            var datas = [];
            var uniqReceiver = [];
            result.forEach(data => {
                if (data.receiver._id === joinedData.receiver._id) {
                    if (uniqReceiver.indexOf(data.sender._id) === -1) {
                        uniqReceiver.push(data.sender._id);
                        var chats = result.filter(el => {
                            return el.sender._id === data.sender._id || el.receiver._id === data.sender._id;
                        });
                        chats.reverse();
                        datas.push({
                            _id: data.sender._id,
                            name: data.sender.username,
                            img: data.sender.img,
                            dateTime: chats[chats.length - 1].created,
                            lastChat: chats[chats.length - 1].message,
                        });
                    }
                }

            });
            socket.emit('message', datas || []);
        }
    });
};

function createMessage(data, socket) {
    var newChat = new Chat(data);
    newChat.save(function (err, result) {
        if (err) {
            socket.emit('chat-list', []);
        } else {
            getMessageDetailList(data, socket);
        }
    });
};

function getMessageDetailList(data, socket) {
    var qr = {
        $or: [
            { 'sender._id': data.sender._id, 'receiver._id': data.receiver._id },
            { 'receiver._id': data.sender._id, 'sender._id': data.receiver._id }
        ]
    };
    Chat.find(qr, function (err, result) {
        if (err) {
            socket.emit('chat-list', []);
        } else {
            var data = [];
            result.forEach(chat => {
                data.push({
                    _id: chat._id,
                    user: {
                        _id: chat.sender._id,
                        img: chat.sender.img
                    },
                    chat: chat.message,
                    dateTime: chat.created
                });
            });
            socket.emit('chat-list', data);
        }
    });
};