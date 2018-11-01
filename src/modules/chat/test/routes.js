'use strict';
var request = require('supertest'),
    assert = require('assert'),
    config = require('../../../config/config'),
    _ = require('lodash'),
    jwt = require('jsonwebtoken'),
    mongoose = require('mongoose'),
    app = require('../../../config/express'),
    Chat = mongoose.model('Chat');

var credentials,
    token,
    mockup;

describe('Chat CRUD routes tests', function () {

    before(function (done) {
        mockup = {
            name: 'name',
            sender: {
                _id: '1',
                username: 'dook',
                img: 'aaa.jpg'
            },
            receiver: {
                _id: '2',
                username: 'shop A',
                img: 'bbb.jpg'
            },
            message: 'Hello'
        };
        credentials = {
            username: 'username',
            password: 'password',
            firstname: 'first name',
            lastname: 'last name',
            email: 'test@email.com',
            roles: ['user']
        };
        token = jwt.sign(_.omit(credentials, 'password'), config.jwt.secret, {
            expiresIn: 2 * 60 * 60 * 1000
        });
        done();
    });

    it('should be Chat get use token', (done) => {

        //post
        request(app)
            .post('/api/chats')
            // .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                request(app)
                    .get('/api/chats')
                    // .set('Authorization', 'Bearer ' + token)
                    .expect(200)
                    .end((err, res) => {
                        if (err) {
                            return done(err);
                        }
                        var resp2 = res.body;
                        assert.equal(resp2.status, 200);
                        assert.equal(resp2.data[0].name, mockup.receiver.username);
                        assert.equal(resp2.data[0].img, mockup.receiver.img);
                        assert.equal(resp2.data[0].lastChat, mockup.message);
                        done();
                    });
            });
    });

    it('should be Chat get by id', function (done) {

        request(app)
            .post('/api/chats')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                request(app)
                    .get('/api/chats/' + resp.data._id)
                    .set('Authorization', 'Bearer ' + token)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        var resp = res.body;
                        assert.equal(resp.status, 200);
                        assert.equal(resp.data.name, mockup.name);
                        assert.equal(resp.data.sender.username, mockup.sender.username);
                        assert.equal(resp.data.message, mockup.message);
                        done();
                    });
            });

    });

    it('should be Chat post use token', (done) => {
        request(app)
            .post('/api/chats')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                assert.equal(resp.data.name, mockup.name);
                done();
            });
    });

    it('should be chat put use token', function (done) {

        request(app)
            .post('/api/chats')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                var update = {
                    name: 'name update'
                }
                request(app)
                    .put('/api/chats/' + resp.data._id)
                    .set('Authorization', 'Bearer ' + token)
                    .send(update)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        var resp = res.body;
                        assert.equal(resp.data.name, update.name);
                        done();
                    });
            });

    });

    it('should be chat delete use token', function (done) {

        request(app)
            .post('/api/chats')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                request(app)
                    .delete('/api/chats/' + resp.data._id)
                    .set('Authorization', 'Bearer ' + token)
                    .expect(200)
                    .end(done);
            });

    });

    xit('should be chat get not use token', (done) => {
        request(app)
            .get('/api/chats')
            .expect(403)
            .expect({
                status: 403,
                message: 'User is not authorized'
            })
            .end(done);
    });

    xit('should be chat post not use token', function (done) {

        request(app)
            .post('/api/chats')
            .send(mockup)
            .expect(403)
            .expect({
                status: 403,
                message: 'User is not authorized'
            })
            .end(done);

    });

    xit('should be chat put not use token', function (done) {

        request(app)
            .post('/api/chats')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                var update = {
                    name: 'name update'
                }
                request(app)
                    .put('/api/chats/' + resp.data._id)
                    .send(update)
                    .expect(403)
                    .expect({
                        status: 403,
                        message: 'User is not authorized'
                    })
                    .end(done);
            });

    });

    xit('should be chat delete not use token', function (done) {

        request(app)
            .post('/api/chats')
            .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                request(app)
                    .delete('/api/chats/' + resp.data._id)
                    .expect(403)
                    .expect({
                        status: 403,
                        message: 'User is not authorized'
                    })
                    .end(done);
            });

    });

    it('should be get chat detail', function (done) {
        request(app)
            .post('/api/chats')
            // .set('Authorization', 'Bearer ' + token)
            .send(mockup)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var resp = res.body;
                request(app)
                    .get('/api/chats/' + mockup.receiver._id + '/' + mockup.sender._id)
                    .expect(200)
                    .end(function (err, res) {
                        var resp = res.body;
                        assert.equal(resp.status, 200);
                        assert.equal(resp.data.length, 1);
                        done();
                    });
            });
    });

    afterEach(function (done) {
        Chat.remove().exec(done);
    });

});