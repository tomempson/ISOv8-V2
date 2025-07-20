document.addEventListener('DOMContentLoaded', () => {
  const button = document.querySelector('.hero-cta-circle-button');
  if (!button) return;

  button.addEventListener('click', () => {
    // Reset any previous animation and clicked state
    button.classList.remove('ring-animate', 'ring-reverse', 'clicked');
    // Force reflow to restart animations
    void button.offsetWidth;
    // Trigger draw animation and text color
    button.classList.add('ring-animate', 'clicked');
  });
});