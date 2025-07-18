import playerService from '../services/playerService.js';

class PlayerController {
  async createPlayer(req, res) {
    try {
      const { playerId, name, region } = req.body;
      const player = await playerService.createPlayer(playerId, name, region);
      res.json({ success: true, player });
    } catch (err) {
      res.status(400).json({ success: false, error: err.message });
    }
  }

  async getPlayer(req, res) {
    try {
      const { playerId } = req.params;
      const player = await playerService.getPlayer(playerId);
      if (!player) {
        return res.status(404).json({ success: false, error: 'Player not found' });
      }
      res.json({ success: true, player });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
}

export default new PlayerController();