require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Snoowrap = require('snoowrap');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.static('public'));

const reddit = new Snoowrap({
  userAgent: process.env.REDDIT_USER_AGENT,
  clientId: process.env.REDDIT_CLIENT_ID,
  clientSecret: process.env.REDDIT_CLIENT_SECRET,
  refreshToken: process.env.REDDIT_REFRESH_TOKEN,
});


app.get('/api/images', async (req, res) => {
  const subredditName = req.query.subreddit || 'Wallpapers';
  const after = req.query.after || null;
  const sort = req.query.sort || 'hot';
  const time = req.query.time || 'week'; 

  
  try {
    const subreddit = await reddit.getSubreddit(subredditName);

    let posts;

    switch (sort) {
      case 'top':
        posts = await subreddit.getTop({ limit: 20, after, time });
        break;
      case 'new':
        posts = await subreddit.getNew({ limit: 20, after });
        break;
      case 'random':
        // random returns a single post
        const randomPost = await subreddit.getRandomSubmission();
        posts = Array.isArray(randomPost) ? randomPost : [randomPost];
        break;
      case 'rising':
        posts = await subreddit.getRising({ limit: 20, after });
        break;
      default: // hot
        posts = await subreddit.getHot({ limit: 20, after });
        break;
    }

    const images = posts
      .map(post => {
        if (post.is_video && post.media?.reddit_video?.fallback_url) {
          return {
            type: 'video',
            url: post.media.reddit_video.fallback_url,
            title: post.title,
            author: post.author.name
          };
        } else if (post.url?.includes('i.redd.it') || post.url?.includes('i.imgur.com')) {
          return {
            type: 'image',
            url: post.url,
            title: post.title,
            author: post.author.name
          };
        } else if (post.secure_media?.oembed?.html) {
          return {
            type: 'embed',
            embed: post.secure_media.oembed.html,
            title: post.title,
            author: post.author.name
          };
        } else {
          return null;
        }
      })
      .filter(Boolean);

    const nextAfter = posts.length > 0 ? posts[posts.length - 1].name : null;

    res.json({ images, after: nextAfter });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts.' });
  }
});


const popularRoutes = require('./routes/popularroutes'); //2 lines for popsubsbar
app.use(popularRoutes);

app.listen(PORT, () => {
  console.log(`Server running on https://reddit-gallery-website-1.onrender.com`);
});
