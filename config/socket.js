module.exports = (io, app) => {
    io.use(function(socket, next){
        if (socket.request.headers.cookie) {
            return next();
        }
        next(new Error('Authentication error'));
    });
}