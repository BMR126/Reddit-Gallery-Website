
let after = null;
let loading = false;
let currentSubreddit = 'Wallpapers';
let mediaItems = []; // List of all images/videos loaded
let currentIndex = 0;
let currentSort = 'hot';
let currentTime = 'week'; // default time filter
let postAuthor = 'unknown';



async function loadImages(subredditInput = null, isNew = false) {
  if (loading) return;
    loading = true;

    const gallery = document.getElementById('gallery');

    if (isNew && subredditInput) {
      currentSubreddit = subredditInput;
      after = null;
      gallery.innerHTML = '';
    }

    try {
      const response = await fetch(`/api/images?subreddit=${currentSubreddit}&after=${after || ''}&sort=${currentSort}&time=${currentTime}`);
      const data = await response.json();
      const images = data.images || [];
      after = data.after;

    if (images.length === 0 && isNew) {
      gallery.innerHTML = '<p style="font-size: 1.5rem; text-align: center; margin-top: 20px;">⚠️ Sorry, there are no images or videos found in that subreddit.</p>';
      loading = false;
      return;
    }

    const startIndex = mediaItems.length; // Length before appending new items
    mediaItems.push(...images); // Add new items to global list

    images.forEach((item, i) => {
    const trueIndex = startIndex + i; // The correct index in mediaItems

    const wrapper = document.createElement('div');
    wrapper.classList.add('media-wrapper');
    wrapper.style.cursor = 'pointer';
    wrapper.setAttribute('data-username', item.author || 'unknown');
    wrapper.setAttribute('data-subreddit', item.subreddit || currentSubreddit);

    // Display thumbnail in grid
    if (item.type === 'video') {
    const preview = document.createElement('video');
    preview.src = item.url;
    preview.muted = true;
    preview.loop = true;
    preview.controls = false;
    preview.style.maxWidth = '100%';
    preview.style.borderRadius = '10px';
    preview.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

    const videoWrapper = document.createElement('div');
    videoWrapper.className = 'video-thumbnail';
    videoWrapper.appendChild(preview);

    const playIcon = document.createElement('div'); // play symbol
    playIcon.className = 'play-icon';
    playIcon.innerHTML = '&#9658;'; 
    videoWrapper.appendChild(playIcon);

    wrapper.appendChild(videoWrapper);

  } else if (item.type === 'embed') {
    const embedWrapper = document.createElement('div');
    embedWrapper.classList.add('embed-container'); // add a class
    embedWrapper.innerHTML = item.embed;

    const iframe = embedWrapper.querySelector('iframe');

    if (iframe && iframe.src.includes("redgifs.com")) {
    
    iframe.removeAttribute('width');
    iframe.removeAttribute('height');

    // Clean embedding
    const container = document.createElement('div');
    container.className = 'embed-container';
    container.appendChild(iframe);

    wrapper.appendChild(container);

  } else if (iframe && iframe.src.includes("youtube.com")) {
    
    iframe.removeAttribute('width');
    iframe.removeAttribute('height');

    // Clean embedding
    const container = document.createElement('div');
    container.className = 'embed-container';
    container.appendChild(iframe);

    wrapper.appendChild(container);

  }
  
  else if (iframe) {
    const url = new URL(iframe.src);
    url.searchParams.set('[autoplay]', '0');
    url.searchParams.set('mute', '1'); // Especially for YouTube mute

    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('allow', 'fullscreen; autoplay; encrypted-media');

    iframe.src = url.toString();
    iframe.setAttribute('allow', 'autoplay; encrypted-media');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.style.width = 'auto';
    iframe.style.height = 'auto';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '10px';
    iframe.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';

    const container = document.createElement('div');
    container.className = 'embed-container';
    container.appendChild(iframe);

    wrapper.appendChild(container);
  }

  } else {
    const img = document.createElement('img');
    img.src = item.url;
    img.alt = item.title;
    img.style.maxWidth = '100%';
    img.style.borderRadius = '10px';
    img.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
    wrapper.appendChild(img);
  }


  gallery.appendChild(wrapper);

  });

const gridSizer = document.createElement('div');
gridSizer.className = 'grid-sizer';
gallery.prepend(gridSizer);

// Initialize or reload Masonry layout
imagesLoaded('#gallery', function () {
  new Masonry('#gallery', {
    itemSelector: '.media-wrapper',
    columnWidth: '.grid-sizer',
    percentPosition: true,
    gutter: 0
  });
});



} catch (error) {
    console.error('Error:', error);
        gallery.innerHTML = '<p style="font-size: 1.5rem; text-align: center; margin-top: 20px;">❌ This Subreddit is not found or Reddit failed.</p>';

}

      loading = false;
}

function setupInfiniteScroll() {
      window.addEventListener('scroll', () => {
        if (
          window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 &&
          !loading &&
          after
        ) {
          loadImages();
        }
      });
  }

  document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('subredditInput');


  const subTypeSelect = document.getElementById('sub-type-select');
  subTypeSelect.addEventListener('change', async (e) => {
  const type = e.target.value;
  if (type === 'popular') {
    loadPopularSubreddits();
  } else if (type === 'recommended') {
    populateSidebar(recommendedSubs);
  }


  // Open the overlay with media content and subreddit/username info
  function openOverlay(item, subreddit) {
  const overlay = document.getElementById('overlay');
  const overlayContent = document.getElementById('overlay-content');

  // Clear previous overlay content
  overlayContent.innerHTML = '';

  // Add the image/video in the overlay
  if (item.type === 'video') {
    const video = document.createElement('video');
    video.src = item.url;
    video.controls = true;
    video.style.width = '100%';
    overlayContent.appendChild(video);
  } else {
    const img = document.createElement('img');
    img.src = item.url;
    img.style.width = '100%';
    overlayContent.appendChild(img);
  }

  // Add subreddit and username info in overlay
  const info = document.createElement('div');
  info.classList.add('overlay-info');
  info.innerHTML = `
    <p>Posted by <a href="https://www.reddit.com/user/${item.username}" target="_blank">${item.username}</a></p>
    <p>In subreddit <a href="https://www.reddit.com/r/${subreddit}" target="_blank">r/${subreddit}</a></p>
  `;
  overlayContent.appendChild(info);

  overlay.classList.remove('hidden');
}

  document.getElementById('closeBtn').addEventListener('click', () => {
  const overlay = document.getElementById('overlay');
  overlay.classList.add('hidden');
  overlayContent.innerHTML = '';
});
});


//List of recommended subreddits
const recommendedSubs = [
  { name: 'Wallpapers' },
  { name: 'Aww' },
  { name: 'Pics' },
  { name: 'Gifs' },
  { name: 'beamazed' },
  { name: 'drawing' },
  { name: 'PhotoshopBattles' },
  { name: 'images' },
  { name: 'dogpictures' },
  { name: 'Cats' }
];
 
async function populateSidebar(subs) {
  const sidebar = document.getElementById('popular-subs');
  sidebar.innerHTML = '';

  subs.forEach(sub => {
    const li = document.createElement('li');
    const button = document.createElement('button');
    button.classList.add('sub-link');
    button.textContent = sub.name;
    button.setAttribute('data-sub', sub.name);

    button.addEventListener('click', () => {
      currentSubreddit = sub.name;
      document.getElementById('subredditInput').value = sub.name;
      after = null;
      loadImages(sub.name, true);
    });

    li.appendChild(button);
    sidebar.appendChild(li);
  });
}

async function loadPopularSubreddits() {
  try {
    const res = await fetch('/api/popular-subs');
    const subs = await res.json();
    populateSidebar(subs);
  } catch (error) {
    console.error('Failed to load popular subreddits:', error);
  }
}

// Call it on DOMContentLoaded
populateSidebar(recommendedSubs);



  
  // Handle clicks on "Hot" and "Random"
  document.querySelectorAll('.sort-container button').forEach(button => {
    button.addEventListener('click', () => {
      currentSort = button.getAttribute('data-sort');
      if (currentSort !== 'top' ) {
        after = null;  // Reset pagination when switching to "Hot" or "Random"
        loadImages(currentSubreddit, true);
      }
    });
  });
  

  // Handle clicks on the dropdown for time selection under "Top"
  document.querySelectorAll('.dropdown-content a').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      currentSort = 'top'; // Always select "Top"
      currentTime = link.getAttribute('data-time');
      after = null; // Reset pagination on time change
      loadImages(currentSubreddit, true); // Reload with new time filter
    });
  });

document.querySelectorAll('.sub-link').forEach(button => {
  button.addEventListener('click', () => {
    const sub = button.getAttribute('data-sub');
    currentSubreddit = sub;
    document.getElementById('subredditInput').value = sub; // Optional: update input field
    after = null;
    loadImages(sub, true);
  });
});



  // Handle subreddit input search
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const subreddit = input.value.trim();
      if (subreddit) {
        loadImages(subreddit, true);
      }
    }
  });

  // Load initial images and set up infinite scroll
  loadImages();
  setupInfiniteScroll();
});


