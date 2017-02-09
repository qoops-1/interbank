"use strict";

const cors = require("cors");

module.exports = (app) => {
    if (process.env.CORS_ORIGIN) {
        let corsOptions = {
            origin: process.env.CORS_ORIGIN,
            methods: process.env.CORS_METHODS || 'GET,PUT,POST,DELETE',
            allowedHeaders: ['Content-Type']
        };
        app.use(cors(corsOptions));
    }
};
