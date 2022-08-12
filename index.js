require('dotenv').config();

const express = require('express');
const { createServer } = require('http');
const { Server: ioServer } = require('socket.io');
const { TikTokConnectionWrapper, getGlobalConnectionCount } = require('./lib/connectionWrapper');
const { clientBlocked } = require('./lib/limiter');

const app = express();
const httpServer = createServer(app);

// Enable cross origin resource sharing
const io = new ioServer(httpServer, {
    cors: {
        origin: '*'
    }
});

// Express static frontend files.
app.use(express.static('public'));

// Start http listener
const port = process.env.PORT || 8081;
httpServer.listen(port);
console.info(`Server running! Please visit http://localhost:${port}`);


// ----------------------------------------------
// websockets connections
io.on('connection', (socket) => {
    let _tiktokConnectionWrapper;

    console.info('New connection from origin', socket.handshake.headers['origin'] || socket.handshake.headers['referer']);

    socket.on('setUniqueId', (uniqueId, options) => {

        // Prohibit the client from specifying these options (for security reasons)
        if (typeof options === 'object') {
            delete options.requestOptions;
            delete options.websocketOptions;
        }

        // Is the client already connected to a stream? => Disconnect
        if (_tiktokConnectionWrapper) {
            _tiktokConnectionWrapper.disconnect();
        }

        // <limiter> Check if rate limit exceeded
        if (process.env.ENABLE_RATE_LIMIT && clientBlocked(io, socket)) {
            socket.emit('tiktokDisconnected', 'You have opened too many connections or made too many connection requests. Please reduce the number of connections/requests or host your own server instance. The connections are limited to avoid that the server IP gets blocked by TokTok.');
            return;
        }

        // Connect to the given username (uniqueId)
        try {
            _tiktokConnectionWrapper = new TikTokConnectionWrapper(uniqueId, options, true);
            _tiktokConnectionWrapper.connect();
        } catch (err) {
            socket.emit('tiktokDisconnected', err.toString());
            return;
        }

        // Redirect wrapper control events once
        _tiktokConnectionWrapper.once('connected', state => socket.emit('tiktokConnected', state));
        _tiktokConnectionWrapper.once('disconnected', reason => socket.emit('tiktokDisconnected', reason));

        // Notify client when stream ends
        _tiktokConnectionWrapper.connection.on('streamEnd', () => socket.emit('streamEnd'));

        // Redirect message events
        _tiktokConnectionWrapper.connection.on('roomUser', event => socket.emit('roomUser', event));
        _tiktokConnectionWrapper.connection.on('member', event => socket.emit('member', event));
        _tiktokConnectionWrapper.connection.on('chat', event => socket.emit('chat', event));
        _tiktokConnectionWrapper.connection.on('gift', event => socket.emit('gift', event));
        _tiktokConnectionWrapper.connection.on('social', event => socket.emit('social', event));
        _tiktokConnectionWrapper.connection.on('like', event => socket.emit('like', event));
        _tiktokConnectionWrapper.connection.on('questionNew', event => socket.emit('questionNew', event));
        _tiktokConnectionWrapper.connection.on('linkMicBattle', event => socket.emit('linkMicBattle', event));
        _tiktokConnectionWrapper.connection.on('linkMicArmies', event => socket.emit('linkMicArmies', event));
        _tiktokConnectionWrapper.connection.on('liveIntro', event => socket.emit('liveIntro', event));
        _tiktokConnectionWrapper.connection.on('emote', event => socket.emit('emote', event));
        _tiktokConnectionWrapper.connection.on('envelope', event => socket.emit('envelope', event));
        _tiktokConnectionWrapper.connection.on('subscribe', event => socket.emit('subscribe', event));
    });

    socket.on('disconnect', () => {
        if (_tiktokConnectionWrapper) {
            _tiktokConnectionWrapper.disconnect();
        }
    });
});

// Emit global connection statistics
setInterval(() => {
    io.emit('statistic', { globalConnectionCount: getGlobalConnectionCount() });
}, 5000)
