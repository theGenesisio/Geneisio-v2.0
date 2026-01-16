import dotenv from 'dotenv';
dotenv.config();
import express, { json, urlencoded } from "express";
import cors from "cors";
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine the base directory
const baseDir = process.env.NODE_ENV === 'production' ? path.join(process.cwd(), "/server") : __dirname;

// Database connection with DNS fallback and retry logic
const connectToDatabase = async () => {
    const connectionOptions = {
        serverSelectionTimeoutMS: 100000,
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
    };

    try {
        await mongoose.connect(process.env.MONGO_ATLAS_URI, connectionOptions);
        console.log('Connected to Genesisio DB successfully');
    } catch (err) {
        console.error(`Initial connection failed: ${err.message}`);

        // If DNS error (ESERVFAIL, ENOTFOUND), retry after a short delay
        if (err.code === 'ESERVFAIL' || err.code === 'ENOTFOUND' || err.syscall === 'queryTxt') {
            console.log('DNS lookup failed, retrying in 2 seconds...');
            await new Promise(resolve => setTimeout(resolve, 2000));

            try {
                await mongoose.connect(process.env.MONGO_ATLAS_URI, {
                    ...connectionOptions,
                    family: 4, // Force IPv4 to avoid IPv6 DNS issues
                });
                console.log('Connected to Genesisio DB successfully (retry)');
            } catch (retryErr) {
                console.error(`ERROR In Connection to Genesisio DB: \n ${retryErr}`);
            }
        } else {
            console.error(`ERROR In Connection to Genesisio DB: \n ${err}`);
        }
    }
};

// Start database connection
connectToDatabase();

// Connection event listeners for production debugging
mongoose.connection.on('connected', () => {
    console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
    console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('Mongoose disconnected from MongoDB');
});

// Middleware to check database connection before processing requests
const checkDbConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            message: 'Database temporarily unavailable. Please try again in a moment.',
            dbState: mongoose.connection.readyState
        });
    }
    next();
};

// CORS configuration
const allowedOrigins = {
    // development: '*',
    development: 'http://localhost:5173',
    production: 'https://www.genesisio.net'
};

const corsOptions = {
    origin: allowedOrigins[process.env.NODE_ENV],
    methods: ["POST", "GET", "PATCH", "DELETE", "PUT", "OPTIONS"],
    credentials: true,
    optionsSuccessStatus: 204
};

// Use CORS middleware
app.use(cors(corsOptions));

// Parse JSON and URL-encoded bodies
app.use(json());
app.use(urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(baseDir, "./public/")));
app.set('trust proxy', 1);

// Routers
import './src/cronjobs/refreshTokenJob.js';
import authRouter from './src/auth/JWT.js';
import indexRouter from './src/routes/indexRouter.js';
import imageRouter from './src/routes/imageRouter.js';
import debugRouter from './src/debug-endpoint.js';

app.use('/api', checkDbConnection, indexRouter);
app.use('/api/img', checkDbConnection, imageRouter);
app.use('/api/auth', checkDbConnection, authRouter);

/* Debug Endpoint */
app.use('/api', debugRouter);

// Root endpoint
app.get('/', (req, res) => res.json({ message: 'Get a life bro!' }));

// Start server
app.listen(port, () => console.log(`Client server listening on http://localhost:${port}/`));
