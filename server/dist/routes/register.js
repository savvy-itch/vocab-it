import express from 'express';
import registerController from '../controllers/registerController';
const registerRouter = express.Router();
registerRouter.post('/', registerController);
export default registerRouter;
