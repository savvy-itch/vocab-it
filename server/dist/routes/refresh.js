import express from 'express';
import refreshController from '../controllers/refreshController';
const refreshRouter = express.Router();
refreshRouter.post('/', refreshController);
export default refreshRouter;
