const overlay = document.getElementById('overlay');
const overlayContent = document.getElementById('overlay-content');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const closeBtn = document.getElementById('closeBtn');
const footer = document.getElementById('page-footer'); // grab the footer
let currentMediaIndex = -1;
let mediaElements = [];

document.addEventListener('click', (e) => {
  const wrapper = e.target.closest('.media-wrapper');
  if (!wrapper) return;

  const isMediaClick = e.target.tagName === 'IMG' || e.target.tagName === 'VIDEO' || e.target.tagName === 'IFRAME';
  if (!isMediaClick) return;

  e.preventDefault();
  e.stopPropagation();

  const allMedia = Array.from(document.querySelectorAll('.media-wrapper'));
  currentMediaIndex = allMedia.indexOf(wrapper);
  mediaElements = allMedia;

  showInOverlay(currentMediaIndex);
});

function showInOverlay(index) {
  const wrapper = mediaElements[index];
  const media = wrapper?.querySelector('img, video, iframe');
  if (!media) return;

  const clone = media.cloneNode(true);
  clone.removeAttribute('style');

  if (clone.tagName === 'VIDEO') {
    clone.controls = true;
    clone.autoplay = true;
    clone.muted = false;
  }

  // Get subreddit and username from data attributes
  const username = wrapper.getAttribute('data-username') || 'unknown';
  const subreddit = wrapper.getAttribute('data-subreddit') || 'unknown';

  // Create info block
  const info = document.createElement('div');
  info.className = 'overlay-info';
  info.innerHTML = `
    <p>Posted by <a href="https://www.reddit.com/user/${username}" target="_blank">u/${username}</a></p>
    <p>In subreddit <a href="https://www.reddit.com/r/${subreddit}" target="_blank">r/${subreddit}</a></p>
  `;

  overlayContent.innerHTML = '';
  overlayContent.appendChild(clone);
  overlayContent.appendChild(info);
  overlay.classList.remove('hidden');

  footer.style.display = 'none';
}

overlay.addEventListener('click', (e) => {
  if (e.target === overlay || e.target === overlayContent) {
    overlay.classList.add('hidden');
    overlayContent.innerHTML = '';
  }
});

nextBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (currentMediaIndex < mediaElements.length - 1) {
    currentMediaIndex++;
    showInOverlay(currentMediaIndex);
  }
});

prevBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  if (currentMediaIndex > 0) {
    currentMediaIndex--;
    showInOverlay(currentMediaIndex);
  }
});

closeBtn.addEventListener('click', () => {
  overlay.classList.add('hidden');
  overlayContent.innerHTML = '';
  footer.style.display = 'flex'; // SHOW FOOTER AGAIN
});
