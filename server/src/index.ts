import express from 'express';
import morgan from 'morgan';
import { connectDb } from './lib/db';

const app = express();

// connectDb();
app.use(express.json());
app.use(morgan('dev'));






app.listen(3000, () => {
    console.log('Server is running on port 3000');
});