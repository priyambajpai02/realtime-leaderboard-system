import Player from '../models/Player.js';

class PlayerService {
  constructor() {
    this.prefix = 'player';
  }

  async createPlayer(playerId, name, region) {
    try {
      // Check if player already exists
      const existingPlayer = await Player.findOne({ playerId });
      if (existingPlayer) {
        throw new Error('Player ID already exists');
      }

      const player = new Player({ playerId, name, region });
      await player.save();
      return { id: playerId, name, region };
    } catch (err) {
      console.error('Error creating player:', err);
      throw err; // Re-throw for the socket handler
    }
  }

  async getPlayer(playerId) {
    return Player.findOne({ playerId }).lean();
  }
}

export default new PlayerService();