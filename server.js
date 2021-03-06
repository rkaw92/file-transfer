const fastify = require('fastify');
const app = fastify({ logger: true });
const stream = require('stream');
const path = require('path');
const cuid = require('cuid');
const fs = require('fs');

// Configure CORS, fall back to Snowpack default:
const HTTP_ORIGIN = process.env.HTTP_ORIGIN || 'http://localhost:8080';

app.register(require('point-of-view'), {
    engine: {
        ejs: require('ejs')
    },
    root: path.resolve(__dirname, 'templates'),
    includeViewExtension: true,
    options: {
        _with: false
    }
});
app.register(require('fastify-multipart'));
app.register(require('fastify-cors'), {
    // Fall back to Snowpack server:
    origin: HTTP_ORIGIN
});
const io = require('socket.io')(app.server, {
    cors: {
        origin: HTTP_ORIGIN,
        methods: [ 'GET', 'POST' ]
    }
});

const uploads = new Map();

io.on('connection', function(socket) {
    socket.on('receiverReady', function(channelID) {
        socket.join(channelID);
        socket.to(channelID).emit('receiverReady', channelID);
    });
    socket.on('senderReady', function(channelID) {
        socket.join(channelID);
    });
});

app.register(async function(scope) {
    scope.addContentTypeParser('*', function (_request, _payload, done) {
        done();
    });
    scope.post('/upload/:channelID/:uploadID', async function(request, reply) {
        const file = await request.file();
        const upload = {
            stream: new stream.PassThrough(),
            filename: file.filename,
            contentType: file.mimetype
        };
        uploads.set(request.params.uploadID, upload);
        io.to(request.params.channelID).emit('upload', request.params.uploadID);
        return new Promise(function(resolve, reject) {
            stream.pipeline(file.file, upload.stream, function(err) {
                console.log('stream pipeline finished');
                if (err) {
                    reject(err);
                } else {
                    resolve({ finished: true });
                }
            });
        });
    });
});

app.get('/download/:uploadID', async function(request, reply) {
    const upload = uploads.get(request.params.uploadID);
    if (!upload) {
        return reply.status(404).send('No such upload ongoing');
    }
    uploads.delete(request.params.uploadID);
    reply.header('Content-Disposition', 'attachment; filename=' + upload.filename);
    reply.header('Content-Type', upload.contentType);
    reply.send(upload.stream);
});

app.register(require('fastify-static'), {
    root: path.resolve(__dirname, 'build')
});

app.listen(process.env.HTTP_PORT || 3040, '0.0.0.0');
