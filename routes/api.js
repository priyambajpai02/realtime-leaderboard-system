import express from 'express';
import leaderboardController from '../controllers/leaderboardController.js';
import playerController from '../controllers/playerController.js';
import cacheMiddleware from '../middleware/cacheMiddleware.js';

const router = express.Router();

// Player routes
router.post('/players', playerController.createPlayer);
router.get('/players/:playerId', playerController.getPlayer);

// Leaderboard routes with caching
router.get('/leaderboard', 
  cacheMiddleware(300), // 5 minute cache
  leaderboardController.getTopPlayers
);

export default router;