const ROVER_MESSAGES = [
  "Hi! My Name is Ahmed Welcome to my portfolio!",
  "Window stuck ? right click on Taskbar and close it!",
  "Feel free to explore you windows!",
  "Enjoy the windows experience!",
  "Don't forget to check out my projects!",
  "You can contact me through the Contact window!",
  "To check out my Cv click on My CV!"
];

const contactForm = {
  fullName: '',
  email: '',
  phone: '',
  message: ''
};

let currentMessageIndex = 0;

function updateRoverMessage() {
  const messageElement = document.querySelector('.rover-message');
  if (messageElement) {
    messageElement.textContent = ROVER_MESSAGES[currentMessageIndex];
    currentMessageIndex = (currentMessageIndex + 1) % ROVER_MESSAGES.length;
  }
}

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
  'LinkedIn': 'https://www.linkedin.com/in/ahmed-elmehdaoui-234182278',
  'GitHub': 'https://github.com/ELMEHDAOUIAhmed',
  'Email': 'elmehdaoui.ahmed77@gmail.com'
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
    
    // Constants for minimum visible portion of window
    this.MIN_VISIBLE = {
      WIDTH: 100,  // Minimum width that must remain visible
      HEIGHT: 30   // Minimum height that must remain visible (title bar)
    };
    
    // Update taskbar height
    this.TASKBAR_HEIGHT = 28;
    
    // Initialize screen dimensions
    this.updateScreenDimensions();
    
    // Add resize listener to update screen dimensions
    window.addEventListener('resize', () => this.updateScreenDimensions());

    // Add context menu tracking
    this.activeContextMenu = null;
    
    // Close context menu when clicking outside
    document.addEventListener('click', (e) => {
      if (this.activeContextMenu && !e.target.closest('.context-menu')) {
        this.closeContextMenu();
      }
    });
  }

  updateScreenDimensions() {
    this.screenWidth = window.innerWidth;
    this.screenHeight = window.innerHeight;
  }

  constrainPosition(x, y, width, height) {
    // Calculate bounds to keep minimum visible portion on screen
    const minX = -(width - this.MIN_VISIBLE.WIDTH);
    const maxX = this.screenWidth - this.MIN_VISIBLE.WIDTH;
    const minY = 0; // Don't allow window above top of screen
    const maxY = this.screenHeight - this.TASKBAR_HEIGHT - this.MIN_VISIBLE.HEIGHT;

    // Constrain position
    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y))
    };
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

  // Add these new methods for context menu handling
  createContextMenu(items, x, y) {
    // Remove any existing context menu
    this.closeContextMenu();
    
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    
    items.forEach((item, index) => {
      if (item.separator) {
        const separator = document.createElement('div');
        separator.className = 'context-menu-separator';
        menu.appendChild(separator);
      } else {
        const menuItem = document.createElement('div');
        menuItem.className = 'context-menu-item';
        if (item.icon) {
          const icon = document.createElement('img');
          icon.src = item.icon;
          icon.width = 16;
          icon.height = 16;
          menuItem.appendChild(icon);
        }
        menuItem.appendChild(document.createTextNode(item.label));
        menuItem.addEventListener('click', () => {
          item.action();
          this.closeContextMenu();
        });
        menu.appendChild(menuItem);
      }
    });
    
    // Position the menu
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    
    // Add to document
    document.body.appendChild(menu);
    this.activeContextMenu = menu;
    
    // Adjust position if menu goes off screen
    const menuRect = menu.getBoundingClientRect();
    if (menuRect.right > window.innerWidth) {
      menu.style.left = `${x - menuRect.width}px`;
    }
    if (menuRect.bottom > window.innerHeight) {
      menu.style.top = `${y - menuRect.height}px`;
    }
  }
  
  closeContextMenu() {
    if (this.activeContextMenu) {
      this.activeContextMenu.remove();
      this.activeContextMenu = null;
    }
  }

  registerWindow(id, container, title, icon) {
    if (!container) {
      console.warn(`Container not found for window: ${id}`);
      return;
    }
    
    const window = container.querySelector('.window');
    const taskbarItems = document.getElementById('taskbarItems');
    
    // Create taskbar item with explicit image dimensions and error handling
    const taskbarItem = document.createElement('div');
    taskbarItem.className = 'taskbar-item';
    const iconImg = document.createElement('img');
    iconImg.src = icon;
    iconImg.alt = title;
    iconImg.width = 16;
    iconImg.height = 16;
    // Add error handling for icon loading
    iconImg.onerror = () => {
      iconImg.src = 'https://win98icons.alexmeub.com/icons/png/directory_closed-4.png';
    };
    taskbarItem.appendChild(iconImg);
    taskbarItem.appendChild(document.createTextNode(title));

    // Add right-click event listener for context menu
    taskbarItem.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.createContextMenu([
        {
          label: 'Restore',
          icon: 'https://win98icons.alexmeub.com/icons/png/window_3d-1.png',
          action: () => this.showWindow(id)
        },
        {
          label: 'Minimize',
          icon: 'https://win98icons.alexmeub.com/icons/png/minimize-1.png',
          action: () => this.minimizeWindow(id)
        },
        { separator: true },
        {
          label: 'Close',
          icon: 'https://win98icons.alexmeub.com/icons/png/close-2.png',
          action: () => this.closeWindow(id)
        }
      ], e.clientX, e.clientY);
    });

    // Store references
    this.windows.set(id, { container, window, taskbarItem, title, icon });
    
    // Setup event listeners
    this.setupWindowControls(id);
    this.setupMaximizeButton(id);
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

  setupMaximizeButton(id) {
    const { container, window } = this.windows.get(id);
    const maximizeBtn = window.querySelector('.window-control.maximize');
    
    maximizeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      container.classList.toggle('maximized');
      playSound(clickSound);
    });
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
    const windowData = this.windows.get(id);
    if (!windowData) {
      console.warn(`Window not found: ${id}`);
      return;
    }
    
    const { container, window, taskbarItem, title, icon } = windowData;
    
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

document.addEventListener("DOMContentLoaded", function() {
  const form = document.getElementById('contact-form');

  form.addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent page reload

    // Get form data
    const formData = new FormData(form);
    let formObject = Object.fromEntries(formData.entries());
        // Convert phone to a number (if it's not empty)
        if (formObject.phone) {
          formObject.phone = Number(formObject.phone);
        }
    console.log("Form submitted:", formObject);
  
  fetch('https://20.113.78.83/contactme', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formObject)
  })
  .then(response => response.json())
  .then(() => {
    alert('Message sent!');
    form.reset();
  })
  .catch(() => alert('Failed to send message.'));
});
});

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
    'https://win98icons.alexmeub.com/icons/png/msg_information-0.png'
  );

  windowManager.registerWindow(
    'contact',
    document.getElementById('contact-window'),
    'Contact Me',
    'https://win98icons.alexmeub.com/icons/png/outlook_express-5.png'
  );

  windowManager.registerWindow(
    'skills',
    document.getElementById('skills-window'),
    'Skills',
    'https://win98icons.alexmeub.com/icons/png/directory_open_file_mydocs-4.png'
  );

  windowManager.registerWindow(
    'cv',
    document.getElementById('cv-window'),
    'My CV',
    'https://win98icons.alexmeub.com/icons/png/signature-1.png'
  );

  // Register email window
  windowManager.registerWindow(
    'email',
    document.getElementById('email-window'),
    'Email Information',
    'https://win98icons.alexmeub.com/icons/png/mailbox_world-2.png'
  );

  // Add copy email functionality
  document.getElementById('copyEmail')?.addEventListener('click', () => {
    const email = 'elmehdaoui.ahmed77@gmail.com';
    navigator.clipboard.writeText(email).then(() => {
      alert('Email copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy email:', err);
    });
  });

  // Preload sounds
  preloadSounds();

  // Set up Rover's message rotation
  setInterval(updateRoverMessage, 5000);

  // Setup global mouse move and up handlers for dragging
  document.addEventListener('mousemove', (e) => {
    if (windowManager.draggedWindow) {
      const rect = windowManager.draggedWindow.getBoundingClientRect();
      const x = e.clientX - windowManager.dragOffset.x;
      const y = e.clientY - windowManager.dragOffset.y;
      
      // Apply position constraints
      const constrainedPos = windowManager.constrainPosition(x, y, rect.width, rect.height);
      
      // Update window position with constrained values
      windowManager.draggedWindow.style.left = `${constrainedPos.x}px`;
      windowManager.draggedWindow.style.top = `${constrainedPos.y}px`;
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

  // Add CV download functionality
  document.querySelector('.download-cv')?.addEventListener('click', () => {
    const cvUrl = 'https://pouch.jumpshare.com/download/9qeiCiC9JsgfwZ7MIc31XU5uWW4We7vWR6Cx-xvShfexcNQnSbxiLXlifG1UcSDfI1fcPGYaAw7JhuY-yRqpVQ';
    window.open(cvUrl, '_blank');
  });

  // Update CV iframe source when window is opened
  const cvFrame = document.getElementById('cv-frame');
  if (cvFrame) {
    cvFrame.src = 'https://jmp.sh/MOGUorUc';
  }
});

console.log('Windows 95 Portfolio Loaded!');