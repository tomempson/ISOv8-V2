
const heroVideo = document.querySelector('.hero-video');

window.addEventListener('pageshow', (evt) => {
  if (evt.persisted) {
    restartVideo();
  }
});

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    restartVideo();
  } else {
    heroVideo.pause();
  }
});

function restartVideo() {
  heroVideo.currentTime = 0;
  heroVideo.play().catch(() => {});
}