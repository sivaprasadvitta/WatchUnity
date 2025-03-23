import express from "express";
import { v4 as uuidv4 } from 'uuid';

const roomRouter = express.Router();

roomRouter.get('/create', async (req, res) => {
    try {
        const roomId = uuidv4();
        res.status(200).json(roomId);
    } catch (error) {
        res.status(500).json({ error: 'Server error while creating room.' });
    }

});

roomRouter.get('/join', async (req, res) => {
    try {
        const roomId = req.query.roomId;
        if (!roomId) {
            return res.status(400).json({ error: 'Room ID is required' });
        }
        res.status(200).json(roomId);
    } catch (error) {
        res.status(500).json({ error: 'Server error while joining room.' });
    }
})


export default roomRouter;