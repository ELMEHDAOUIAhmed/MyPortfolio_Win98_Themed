// Add these sound effects
const SOUNDS = {
  CLICK: 'https://www.myinstants.com/media/sounds/windows-95-mouse-click.mp3',
  OPEN: 'https://www.myinstants.com/media/sounds/windows-95-startup.mp3',
  CLOSE: 'https://www.myinstants.com/media/sounds/windows-95-shutdown.mp3',
};

// Create audio elements
const clickSound = new Audio(SOUNDS.CLICK);
const openSound = new Audio(SOUNDS.OPEN);
const closeSound = new Audio(SOUNDS.CLOSE);

// Social media links
const SOCIAL_LINKS = {
  'LinkedIn': 'YOUR_LINKEDIN_URL',
  'GitHub': 'YOUR_GITHUB_URL',
  'Email': 'mailto:YOUR_EMAIL'
};

// Preload sounds
function preloadSounds() {
  try {
    clickSound.load();
    openSound.load();
    closeSound.load();
  } catch (error) {
    console.warn('Sound loading failed:', error);
  }
}

// Play sound with error handling
function playSound(sound) {
  try {
    sound.currentTime = 0;
    sound.play().catch(error => {
      console.warn('Sound playback failed:', error);
    });
  } catch (error) {
    console.warn('Sound playback failed:', error);
  }
}

// Window Management
class WindowManager {
  constructor() {
    this.windows = new Map();
    this.taskbarItems = new Map();
    this.zIndex = 1000;
    this.activeWindows = [];
    this.draggedWindow = null;
    this.dragOffset = { x: 0, y: 0 };
    
    // Safe area constants
    this.SAFE_MARGIN = {
      TOP: 0,
      RIGHT: 100, // Minimum width visible
      BOTTOM: 50, // Space for taskbar + minimum height
      LEFT: 0
    };
  }

  registerWindow(id, container, title, icon) {
    const window = container.querySelector('.window');
    const taskbarItems = document.getElementById('taskbarItems');
    
    // Create taskbar item
    const taskbarItem = document.createElement('div');
    taskbarItem.className = 'taskbar-item';
    taskbarItem.innerHTML = `
      <img src="${icon}" alt="${title}" width="16" height="16">
      ${title}
    `;

    // Store references
    this.windows.set(id, { container, window, taskbarItem, title, icon });
    
    // Setup event listeners
    this.setupWindowControls(id);
    this.setupDragging(id);
    
    // Add taskbar item
    taskbarItems.appendChild(taskbarItem);
    
    // Setup taskbar item click handler
    taskbarItem.addEventListener('click', () => {
      playSound(clickSound);
      this.toggleWindow(id);
    });

    // Setup window click handler for focus
    window.addEventListener('mousedown', () => {
      this.bringToFront(id);
    });
  }

  setupDragging(id) {
    const { container, window } = this.windows.get(id);
    const titleBar = window.querySelector('.window-title');

    titleBar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.window-controls')) return; // Don't drag if clicking controls
      
      this.draggedWindow = container;
      const rect = container.getBoundingClientRect();
      
      // Calculate offset from mouse position to container top-left
      this.dragOffset = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      // Add dragging class
      container.classList.add('dragging');
      
      // Prevent text selection while dragging
      e.preventDefault();
    });
  }

  constrainPosition(x, y, width, height) {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const taskbarHeight = 28; // Height of the taskbar

    // Calculate bounds with safe margins
    const minX = -width + this.SAFE_MARGIN.RIGHT;
    const maxX = viewportWidth - this.SAFE_MARGIN.LEFT;
    const minY = this.SAFE_MARGIN.TOP;
    const maxY = viewportHeight - taskbarHeight - this.SAFE_MARGIN.BOTTOM;

    // Constrain position
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    };
  }

  setupWindowControls(id) {
    const { container, window, taskbarItem } = this.windows.get(id);
    
    // Minimize button
    const minimizeBtn = window.querySelector('.window-control.minimize');
    minimizeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.minimizeWindow(id);
    });
    
    // Close button
    const closeBtn = window.querySelector('.window-control.close');
    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.closeWindow(id);
    });
  }

  updateActiveWindows(id) {
    // Remove the window ID if it exists in the array
    this.activeWindows = this.activeWindows.filter(windowId => windowId !== id);
    // Add it to the end (highest z-index)
    this.activeWindows.push(id);
    
    // Update z-index for all windows
    this.activeWindows.forEach((windowId, index) => {
      const { window } = this.windows.get(windowId);
      if (window) {
        window.style.zIndex = this.zIndex + index;
      }
    });
  }

  bringToFront(id) {
    this.updateActiveWindows(id);
  }

  showWindow(id) {
    const { container, window, taskbarItem, title, icon } = this.windows.get(id);
    
    // If window was closed (taskbar item removed), recreate it
    if (!taskbarItem.parentElement) {
      const newTaskbarItem = document.createElement('div');
      newTaskbarItem.className = 'taskbar-item';
      newTaskbarItem.innerHTML = `
        <img src="${icon}" alt="${title}" width="16" height="16">
        ${title}
      `;
      document.getElementById('taskbarItems').appendChild(newTaskbarItem);
      this.windows.get(id).taskbarItem = newTaskbarItem;
      
      newTaskbarItem.addEventListener('click', () => {
        playSound(clickSound);
        this.toggleWindow(id);
      });
    }
    
    container.classList.remove('window-hidden');
    window.classList.remove('minimizing');
    window.classList.add('restoring');
    taskbarItem.classList.add('active');
    this.bringToFront(id);
    playSound(openSound);
    
    window.addEventListener('animationend', () => {
      window.classList.remove('restoring');
    }, { once: true });
  }

  minimizeWindow(id) {
    const { container, window, taskbarItem } = this.windows.get(id);
    window.classList.add('minimizing');
    taskbarItem.classList.remove('active');
    playSound(clickSound);
    
    // Remove from active windows when minimized
    this.activeWindows = this.activeWindows.filter(windowId => windowId !== id);
    
    window.addEventListener('animationend', () => {
      container.classList.add('window-hidden');
      window.classList.remove('minimizing');
    }, { once: true });
  }

  closeWindow(id) {
    const { container, window, taskbarItem } = this.windows.get(id);
    window.classList.add('closing');
    taskbarItem.classList.remove('active');
    taskbarItem.remove(); // Remove from taskbar when closed
    playSound(closeSound);
    
    // Remove from active windows when closed
    this.activeWindows = this.activeWindows.filter(windowId => windowId !== id);
    
    window.addEventListener('animationend', () => {
      container.classList.add('window-hidden');
      window.classList.remove('closing');
    }, { once: true });
  }

  toggleWindow(id) {
    const { container, taskbarItem } = this.windows.get(id);
    if (container.classList.contains('window-hidden')) {
      this.showWindow(id);
    } else {
      this.minimizeWindow(id);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const startButton = document.getElementById('startButton');
  const startMenu = document.getElementById('startMenu');
  const taskbarTime = document.getElementById('taskbarTime');
  
  // Initialize window manager
  const windowManager = new WindowManager();
  
  // Register windows
  windowManager.registerWindow(
    'my-computer',
    document.getElementById('my-computer-window'),
    'My Computer',
    'https://win98icons.alexmeub.com/icons/png/computer_explorer_cool-5.png'
  );
  
  windowManager.registerWindow(
    'about-me',
    document.getElementById('about-me-window'),
    'About Me',
    'https://win98icons.alexmeub.com/icons/png/user-0.png'
  );

  // Preload sounds
  preloadSounds();

  // Setup global mouse move and up handlers for dragging
  document.addEventListener('mousemove', (e) => {
    if (windowManager.draggedWindow) {
      const rect = windowManager.draggedWindow.getBoundingClientRect();
      const x = e.clientX - windowManager.dragOffset.x;
      const y = e.clientY - windowManager.dragOffset.y;
      
      // Apply position constraints
      const constrainedPos = windowManager.constrainPosition(x, y, rect.width, rect.height);
      
      windowManager.draggedWindow.style.left = constrainedPos.x + 'px';
      windowManager.draggedWindow.style.top = constrainedPos.y + 'px';
    }
  });

  document.addEventListener('mouseup', () => {
    if (windowManager.draggedWindow) {
      windowManager.draggedWindow.classList.remove('dragging');
      windowManager.draggedWindow = null;
    }
  });

  // Start menu toggle
  startButton.addEventListener('click', () => {
    playSound(clickSound);
    startMenu.classList.toggle('active');
    startButton.classList.toggle('active');
  });

  // Close start menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!startButton.contains(e.target) && !startMenu.contains(e.target)) {
      startMenu.classList.remove('active');
      startButton.classList.remove('active');
    }
  });

  // Link start menu items with desktop icons
  document.querySelectorAll('.start-menu-item').forEach(item => {
    item.addEventListener('click', () => {
      playSound(clickSound);
      startMenu.classList.remove('active');
      startButton.classList.remove('active');

      // Map start menu items to window IDs
      const itemText = item.querySelector('span').textContent;
      let windowId = null;

      switch (itemText) {
        case 'My Computer':
          windowId = 'my-computer';
          break;
        case 'About Me':
          windowId = 'about-me';
          break;
        // Add more cases as needed
      }

      if (windowId) {
        windowManager.showWindow(windowId);
      }
    });
  });

  // Handle desktop icon clicks with social media support
  const desktopIcons = document.querySelectorAll('.desktop-icon');
  desktopIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      e.preventDefault();
      playSound(clickSound);
      
      const iconName = icon.querySelector('span').textContent;
      const windowId = icon.dataset.window;

      // Check if it's a social media icon
      if (SOCIAL_LINKS[iconName]) {
        window.open(SOCIAL_LINKS[iconName], '_blank');
      } else if (windowId) {
        windowManager.showWindow(windowId);
      } else {
        alert('Opening Folder Explorer... (Coming Soon)');
      }
    });
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