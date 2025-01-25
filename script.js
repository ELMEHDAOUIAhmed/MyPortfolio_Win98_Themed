// Animate progress bars
document.addEventListener('DOMContentLoaded', () => {
  const progressBars = document.querySelectorAll('.progress-fill');
  const startButton = document.getElementById('startButton');
  const startMenu = document.getElementById('startMenu');
  const taskbarTime = document.getElementById('taskbarTime');
  
  // Progress bars animation
  setTimeout(() => {
    progressBars.forEach(bar => {
      const progress = bar.getAttribute('data-progress');
      bar.style.width = `${progress}%`;
    });
  }, 500);

  // Start menu toggle
  startButton.addEventListener('click', () => {
    startMenu.classList.toggle('active');
  });

  // Close start menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
      startMenu.classList.remove('active');
    }
  });

  // Update taskbar time
  function updateTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    taskbarTime.textContent = `${hours}:${minutes}`;
  }

  updateTime();
  setInterval(updateTime, 60000); // Update every minute
});

console.log('Windows 95 Portfolio Loaded!');