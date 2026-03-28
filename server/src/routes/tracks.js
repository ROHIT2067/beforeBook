import { Router } from 'express';
import { createTrack, getTracked, deleteTrack } from '../controllers/trackController.js';

const router = Router();

router.post('/', createTrack);
router.get('/', getTracked);
router.delete('/:id', deleteTrack);

export default router;
