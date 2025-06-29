import Leaderboard from '../models/Leaderboard.js';
import Player from '../models/Player.js';
import cache from '../utils/cache.js';

class LeaderboardService {
  async updateScore(playerId, region, gameMode, score) {
    // Get existing score
    const existingEntry = await Leaderboard.findOne({ 
      playerId, 
      region, 
      gameMode 
    });

    // Only update if new score is higher
    if (!existingEntry || score > existingEntry.score) {
      // Calculate expiration for daily reset
      const now = new Date();
      const expiresAt = new Date(now);
      expiresAt.setDate(expiresAt.getDate() + 1);
      expiresAt.setHours(0, 0, 0, 0); // Set to midnight

      const updateData = {
        playerId,
        region,
        gameMode,
        score,
        expiresAt
      };

      // Upsert operation
      await Leaderboard.findOneAndUpdate(
        { playerId, region, gameMode },
        updateData,
        { upsert: true, new: true }
      );

      // Invalidate cache for this leaderboard
      const cacheKey = `leaderboard:${region}:${gameMode}`;
      cache.del(cacheKey);
    }
  }

  async getTopPlayers(limit = 10, region = 'global', gameMode = 'default') {
    const cacheKey = `leaderboard:${region}:${gameMode}:${limit}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return cachedData;
    }

    const leaderboardEntries = await Leaderboard.find({ region, gameMode })
      .sort({ score: -1 })
      .limit(limit)
      .lean();

    // Enrich with player data
    const playerIds = leaderboardEntries.map(entry => entry.playerId);
    const players = await Player.find({ playerId: { $in: playerIds } }).lean();
    
    const playerMap = players.reduce((map, player) => {
      map[player.playerId] = player;
      return map;
    }, {});

    const leaderboard = leaderboardEntries.map((entry, index) => ({
      ...entry,
      rank: index + 1,
      player: playerMap[entry.playerId] || { name: 'Unknown Player' }
    }));

    // Cache for 5 minutes
    cache.put(cacheKey, leaderboard, parseInt(process.env.CACHE_EXPIRATION) * 1000);

    return leaderboard;
  }

  async resetDailyLeaderboards() {
    // This will be handled automatically by MongoDB TTL index
    // But we can also force reset if needed
    await Leaderboard.deleteMany({});
  }
}

export default new LeaderboardService();