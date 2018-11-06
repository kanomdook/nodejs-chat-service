var mongoose = require('mongoose'),
    Chat = mongoose.model('Chat'),
    Room = mongoose.model('Room'),
    joinedData;
module.exports = (server) => {
    const io = require('socket.io')(server);
    io.on('connection', function (socket) {
        console.log('user connected');
        socket.on('init', function (data) {
            joinedData = data;
            getChatListByReceiver(socket);
        });
        socket.on('joined', function (data) {
            checkJoinRoom(data, socket);
        });
        socket.on('message', function (data) {
            createMessage(data, io);
        });
        socket.on('chat-list', function (data) {
            getMessageDetailList(data, io);
        });
        socket.on('disconnect', function () {
            console.log('user disconnected');
        });
    });

    return io;
};

function checkJoinRoom(data, socket) {
    Room.findOne({ 'members._id': { $all: [data.sender._id, data.receiver._id] } }).exec(function (err, result) {
        if (err) {
            console.log(err);
        } else {
            if (!result) {
                const reqBody = {
                    name: 'name',
                    roomid: '1111111111',
                    members: [{
                        _id: data.sender._id
                    },
                    {
                        _id: data.receiver._id
                    }]
                }
                const newRoom = new Room(reqBody);
                newRoom.save(function (saveErr, saveResult) {
                    if (saveErr) {
                        console.log(saveErr);
                    } else {
                        joinedData.room_id = saveResult.roomid;
                        socket.join(joinedData.room_id, function () {
                            console.log(socket.id + ' now in rooms ', socket.rooms);
                        });
                    }
                });
            } else {
                joinedData.room_id = result.roomid;
                socket.join(joinedData.room_id, function () {
                    console.log(socket.id + ' now in rooms ', socket.rooms);
                });
            }
        }
    });
    // io.to(joinedData.room_id).emit('message', []);
    // socket.broadcast.to().emit('', {});
}

function getChatListByReceiver(socket) {
    Chat.find().sort({ created: -1 }).exec(function (err, result) {
        if (err) {
            socket.emit('message', []);
            // io.to(joinedData.room_id).emit('message', []);
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
            // io.to(joinedData.room_id).emit('message', datas || []);
        }
    });
};

function createMessage(data, io) {
    var newChat = new Chat(data);
    newChat.save(function (err, result) {
        if (err) {
            // socket.emit('chat-list', []);
            io.to(joinedData.room_id).emit('chat-list', []);
        } else {
            getMessageDetailList(data, io);
        }
    });
};

function getMessageDetailList(data, io) {
    var qr = {
        $or: [
            { 'sender._id': data.sender._id, 'receiver._id': data.receiver._id },
            { 'receiver._id': data.sender._id, 'sender._id': data.receiver._id }
        ]
    };
    Chat.find(qr, function (err, result) {
        if (err) {
            // socket.emit('chat-list', []);
            io.to(joinedData.room_id).emit('chat-list', []);
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
            // socket.emit('chat-list', data);
            io.to(joinedData.room_id).emit('chat-list', data);
        }
    });
};