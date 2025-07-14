const express = require('express');
const router = express.Router();

const Snoowrap = require('snoowrap');

const reddit = new Snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN,
});

router.get('/api/popular-subs', async (req, res) => {
  try {
    const subs = await reddit.getPopularSubreddits({ limit: 10 });
    const formatted = subs.map(sub => ({
      name: sub.display_name,
      title: sub.title,
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Failed to fetch subreddits:', error);
    res.status(500).json({ error: 'Failed to fetch popular subreddits' });
  }
});

module.exports = router;
