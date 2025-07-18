import leaderboardService from './leaderboardService.js';
import playerService from './playerService.js';

class SocketService {
  constructor(io) {
    this.io = io;
  }

  initialize() {
    this.io.on('connection', (socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Player registration with safe callback handling
      socket.on('register', async (data, callback = () => {}) => {
        try {
          const player = await playerService.createPlayer(
            data.playerId, 
            data.name, 
            data.region
          );
          callback({ success: true, player });
        } catch (err) {
          console.error('Registration error:', err);
          callback({ success: false, error: err.message });
        }
      });

      // Score update with safe callback handling
      socket.on('updateScore', async (data, callback = () => {}) => {
        try {
          await leaderboardService.updateScore(
            data.playerId,
            data.region,
            data.gameMode,
            data.score
          );
          callback({ success: true });
          
          this.io.to(`${data.region}:${data.gameMode}`).emit('scoreUpdated', {
            playerId: data.playerId,
            region: data.region,
            gameMode: data.gameMode
          });
        } catch (err) {
          console.error('Score update error:', err);
          callback({ success: false, error: err.message });
        }
      });

      // Join room - no callback needed
      socket.on('joinLeaderboard', (data) => {
        const room = `${data.region}:${data.gameMode}`;
        socket.join(room);
        console.log(`Socket ${socket.id} joined room ${room}`);
      });

      // Get leaderboard with safe callback handling
      socket.on('getLeaderboard', async (data, callback = () => {}) => {
        try {
          const players = await leaderboardService.getTopPlayers(
            data.limit || 10,
            data.region,
            data.gameMode
          );
          callback({ success: true, players });
        } catch (err) {
          console.error('Leaderboard fetch error:', err);
          callback({ success: false, error: err.message });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Client disconnected: ${socket.id}`);
      });
    });
  }
}

export default SocketService;