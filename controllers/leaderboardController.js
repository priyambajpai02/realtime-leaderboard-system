import leaderboardService from '../services/leaderboardService.js';

class LeaderboardController {
  async getTopPlayers(req, res) {
    try {
      const { region = 'global', gameMode = 'default', limit = 10 } = req.query;
      const players = await leaderboardService.getTopPlayers(
        parseInt(limit),
        region,
        gameMode
      );
      res.json({ success: true, players });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export default new LeaderboardController();