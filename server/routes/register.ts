import express from 'express';
import handleNewUser from '../controllers/registerController';
// import handleNewUase from '../controllers/registerController';
const registerRouter = express.Router();

registerRouter.post('/', handleNewUser);

export default registerRouter;