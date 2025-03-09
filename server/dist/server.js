import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import connectDB from './db/connect';
import compression from 'compression';
import helmet from 'helmet';
import RateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import { corsOptions } from './config/corsOptions';
import credentials from './middleware/credentials';
import cookieParser from 'cookie-parser';
import registerRouter from './routes/register';
import authRouter from './routes/auth';
import logoutRouter from './routes/logout';
import errorHandlerMiddleware from './middleware/errorHandler';
import verifyJWT from './middleware/verifyJWT';
import profileRouter from './routes/profile';
import refreshRouter from './routes/refresh';
import notFoundMiddleware from './middleware/notFound';
import vocabRouter from './routes/vocabulary';
const app = express();
const PORT = process.env.PORT || 3500;
connectDB();
const limiter = RateLimit({
    windowMs: 1 * 60 * 1000,
    max: 20,
});
app.use(compression());
app.use(helmet());
app.use(limiter);
app.use(mongoSanitize());
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use('/register', registerRouter);
app.use('/auth', authRouter);
app.use('/logout', logoutRouter);
app.use('/refresh', refreshRouter);
// Protected routes
app.use('/profile', verifyJWT, profileRouter);
app.use('/vocabs', verifyJWT, vocabRouter);
app.all('*', notFoundMiddleware);
app.use(errorHandlerMiddleware);
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
});
