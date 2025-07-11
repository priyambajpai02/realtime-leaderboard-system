import mongoose from 'mongoose';

const leaderboardSchema = new mongoose.Schema({
  playerId: {
    type: String,
    required: true,
    index: true
  },
  region: {
    type: String,
    required: true,
    index: true
  },
  gameMode: {
    type: String,
    required: true,
    index: true
  },
  score: {
    type: Number,
    required: true,
    index: -1 // Descending index for efficient top scores query
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    expires: 0 // TTL index for daily resets
  }
}, {
  timestamps: true
});

// Compound index for efficient filtering
leaderboardSchema.index({ region: 1, gameMode: 1, score: -1 });
// leaderboardSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

export default Leaderboard;