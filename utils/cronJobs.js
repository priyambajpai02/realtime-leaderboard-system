import cron from 'node-cron';
import leaderboardService from '../services/leaderboardService.js';

export function startCronJobs() {
  // Daily reset at midnight (configured in .env)
  cron.schedule(process.env.DAILY_RESET_CRON || '0 0 * * *', async () => {
    console.log('Resetting daily leaderboards...');
    try {
      await leaderboardService.resetDailyLeaderboards();
      console.log('Leaderboards reset successfully');
    } catch (err) {
      console.error('Leaderboard reset error:', err);
    }
  });
}