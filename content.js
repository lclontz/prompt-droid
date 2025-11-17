// Content script for Prompt Drawer
(function() {
  'use strict';
  
  console.log('Prompt Drawer: Content script loaded on', window.location.hostname);

  // Guard against double initialization
  if (window.promptDrawerInitialized) {
    console.log('Prompt Drawer: Already initialized, skipping');
    return; // Exit early
  }
  window.promptDrawerInitialized = true;

let drawerVisible = false;
let drawerElement = null;
let currentFilter = 'all';
let dragOffset = { x: 0, y: 0 };
let isDragging = false;

// Create the drawer UI
async function createDrawer() {
  if (drawerElement) return;

  // Apply the saved color scheme (with error handling)
  try {
    const currentScheme = await getCurrentColorScheme();
    applyColorScheme(currentScheme);
  } catch (error) {
    console.log('Color scheme not available, using defaults');
  }

  const drawer = document.createElement('div');
  drawer.id = 'prompt-drawer';
  drawer.className = 'prompt-drawer-container';
  drawer.innerHTML = `
    <div class="prompt-drawer-header">
      <div class="prompt-drawer-drag-handle">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <circle cx="6" cy="6" r="1.5" fill="currentColor"/>
          <circle cx="14" cy="6" r="1.5" fill="currentColor"/>
          <circle cx="6" cy="14" r="1.5" fill="currentColor"/>
          <circle cx="14" cy="14" r="1.5" fill="currentColor"/>
        </svg>
      </div>
      <h3>Prompt Drawer</h3>
      <button class="prompt-drawer-close" title="Close">×</button>
    </div>
    
    <div class="prompt-drawer-filters">
      <button class="filter-btn active" data-filter="all">All</button>
      <button class="filter-btn" data-filter="mood">Mood</button>
      <button class="filter-btn" data-filter="role">Role</button>
      <button class="filter-btn" data-filter="brevity">Brevity</button>
      <button class="filter-btn" data-filter="format">Format</button>
      <button class="filter-btn" data-filter="meta">Meta</button>
    </div>
    
    <div class="prompt-drawer-snippets" id="snippets-container">
      <div class="loading">Loading prompts...</div>
    </div>
    
    <div class="prompt-drawer-divider"></div>
    
    <div class="prompt-drawer-saved">
      <div class="saved-header">
        <label for="saved-prompts-select">Saved Prompts</label>
      </div>
      <select id="saved-prompts-select" class="saved-prompts-dropdown">
        <option value="">Select a saved prompt...</option>
      </select>
    </div>
    
    <div class="prompt-drawer-footer">
      <button class="settings-btn" id="open-settings">⚙️ Settings</button>
      <div class="credit-links">
        <a href="https://clontz.blog" target="_blank" class="credit-link" title="Visit Lee Clontz's blog">by Lee Clontz</a>
        <span class="credit-separator">•</span>
        <a href="https://github.com/lclontz/prompt-drawer" target="_blank" class="credit-link" title="View on GitHub">GitHub</a>
      </div>
    </div>
  `;

  document.body.appendChild(drawer);
  drawerElement = drawer;

  // Set up event listeners
  setupEventListeners();
  
  // Load and display snippets
  loadSnippets();
}

function setupEventListeners() {
  // Close button
  drawerElement.querySelector('.prompt-drawer-close').addEventListener('click', () => {
    toggleDrawer();
  });

  // Filter buttons
  const filterButtons = drawerElement.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      filterButtons.forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      loadSnippets();
    });
  });

  // Saved prompts dropdown
  const savedSelect = drawerElement.querySelector('#saved-prompts-select');
  savedSelect.addEventListener('change', (e) => {
    if (e.target.value) {
      insertTextAtCursor(e.target.value);
      e.target.value = ''; // Reset dropdown
    }
  });

  // Settings button
  drawerElement.querySelector('#open-settings').addEventListener('click', () => {
    // Send message to background script to open options
    chrome.runtime.sendMessage({ action: 'openOptions' }, (response) => {
      // If direct method fails, try opening in new tab as fallback
      if (chrome.runtime.lastError) {
        window.open(chrome.runtime.getURL('options.html'), '_blank');
      }
    });
  });

  // Dragging functionality
  const header = drawerElement.querySelector('.prompt-drawer-header');
  const dragHandle = drawerElement.querySelector('.prompt-drawer-drag-handle');
  
  dragHandle.addEventListener('mousedown', startDragging);
  header.addEventListener('mousedown', (e) => {
    if (e.target === header || e.target.closest('h3')) {
      startDragging(e);
    }
  });
}

function startDragging(e) {
  isDragging = true;
  const rect = drawerElement.getBoundingClientRect();
  dragOffset.x = e.clientX - rect.left;
  dragOffset.y = e.clientY - rect.top;
  
  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', stopDragging);
  e.preventDefault();
}

function drag(e) {
  if (!isDragging) return;
  
  let x = e.clientX - dragOffset.x;
  let y = e.clientY - dragOffset.y;
  
  // Keep within viewport bounds
  const maxX = window.innerWidth - drawerElement.offsetWidth;
  const maxY = window.innerHeight - drawerElement.offsetHeight;
  
  x = Math.max(0, Math.min(x, maxX));
  y = Math.max(0, Math.min(y, maxY));
  
  drawerElement.style.left = `${x}px`;
  drawerElement.style.top = `${y}px`;
  drawerElement.style.right = 'auto';
  drawerElement.style.bottom = 'auto';
}

function stopDragging() {
  isDragging = false;
  document.removeEventListener('mousemove', drag);
  document.removeEventListener('mouseup', stopDragging);
}

async function loadSnippets() {
  const container = drawerElement.querySelector('#snippets-container');
  
  // Safe storage access
  let data;
  try {
    data = await chrome.storage.sync.get(['snippets', 'savedPrompts']);
  } catch (error) {
    console.error('Storage access error:', error);
    container.innerHTML = '<div class="no-snippets">Unable to load snippets</div>';
    return;
  }
  
  let snippets = data.snippets || [];
  
  // Filter snippets
  if (currentFilter !== 'all') {
    snippets = snippets.filter(s => s.category === currentFilter);
  }
  
  // Sort by usage count (descending)
  snippets.sort((a, b) => b.usageCount - a.usageCount);
  
  // Render snippets
  if (snippets.length === 0) {
    container.innerHTML = '<div class="no-snippets">No snippets in this category</div>';
  } else {
    container.innerHTML = snippets.map(snippet => `
      <button class="snippet-btn" data-id="${snippet.id}" data-text="${escapeHtml(snippet.text)}">
        ${escapeHtml(snippet.text)}
        <span class="usage-badge">${snippet.usageCount}</span>
      </button>
    `).join('');
    
    // Add click handlers
    container.querySelectorAll('.snippet-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const text = btn.dataset.text;
        const id = btn.dataset.id;
        await insertTextAtCursor(text);
        await incrementUsageCount(id);
      });
    });
  }
  
  // Load saved prompts dropdown
  loadSavedPrompts(data.savedPrompts || []);
}

function loadSavedPrompts(savedPrompts) {
  const select = drawerElement.querySelector('#saved-prompts-select');
  
  // Sort by usage count
  savedPrompts.sort((a, b) => b.usageCount - a.usageCount);
  
  // Clear existing options except the first one
  select.innerHTML = '<option value="">Select a saved prompt...</option>';
  
  savedPrompts.forEach(prompt => {
    const option = document.createElement('option');
    option.value = prompt.text;
    const preview = prompt.text.length > 50 ? prompt.text.substring(0, 50) + '...' : prompt.text;
    option.textContent = `${preview} (${prompt.usageCount})`;
    select.appendChild(option);
  });
}

async function incrementUsageCount(id) {
  const data = await chrome.storage.sync.get(['snippets']);
  const snippets = data.snippets || [];
  
  const snippet = snippets.find(s => s.id === id);
  if (snippet) {
    snippet.usageCount++;
    await chrome.storage.sync.set({ snippets });
    loadSnippets(); // Reload to update order
  }
}

function insertTextAtCursor(text) {
  const activeElement = document.activeElement;
  
  // Check if we're in an input/textarea
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    const start = activeElement.selectionStart;
    const end = activeElement.selectionEnd;
    const currentValue = activeElement.value;
    
    activeElement.value = currentValue.substring(0, start) + text + currentValue.substring(end);
    activeElement.selectionStart = activeElement.selectionEnd = start + text.length;
    
    // Trigger multiple events for framework compatibility
    activeElement.dispatchEvent(new Event('input', { bubbles: true }));
    activeElement.dispatchEvent(new Event('change', { bubbles: true }));
    activeElement.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
    activeElement.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
    
    // Focus the element
    activeElement.focus();
    
    showNotification('Snippet inserted!');
  } 
  // Check if we're in a contenteditable element
  else if (activeElement && activeElement.isContentEditable) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      range.deleteContents();
      const textNode = document.createTextNode(text);
      range.insertNode(textNode);
      range.collapse(false);
      selection.removeAllRanges();
      selection.addRange(range);
      
      // Trigger input event
      activeElement.dispatchEvent(new Event('input', { bubbles: true }));
      
      showNotification('Snippet inserted!');
    } else {
      // No selection, fallback to clipboard
      navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard! Paste it where needed.');
      });
    }
  }
  // Fallback: copy to clipboard
  else {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Copied to clipboard! Click in the input field and paste (Ctrl+V).');
    });
  }
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'prompt-drawer-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 2000);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function toggleDrawer() {
  if (!drawerElement) {
    createDrawer();
  }
  
  drawerVisible = !drawerVisible;
  drawerElement.classList.toggle('visible', drawerVisible);
  
  console.log('Drawer toggled:', drawerVisible ? 'visible' : 'hidden');
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'ping') {
    sendResponse({ loaded: true });
    return true;
  } else if (message.action === 'toggleDrawer') {
    toggleDrawer();
    sendResponse({ success: true, visible: drawerVisible });
    return true;
  } else if (message.action === 'itemSaved') {
    showNotification(`${message.type === 'snippet' ? 'Snippet' : 'Prompt'} saved!`);
    if (drawerVisible) {
      loadSnippets();
    }
  } else if (message.action === 'openSettings') {
    chrome.runtime.sendMessage({ action: 'openOptions' }, (response) => {
      if (chrome.runtime.lastError) {
        // Silently handle error - background script may not be ready
        console.log('Background script not ready, using fallback');
        window.open(chrome.runtime.getURL('options.html'), '_blank');
      }
    });
  }
});

// Initialize on load
// Check if we're in a valid context (not blocked by CSP or iframe restrictions)
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      try {
        createDrawer();
      } catch (error) {
        console.error('Prompt Drawer initialization error:', error);
      }
    });
  } else {
    try {
      createDrawer();
    } catch (error) {
      console.error('Prompt Drawer initialization error:', error);
    }
  }
} else {
  console.log('Prompt Drawer: Chrome extension context not available on this page');
}

})(); // Close IIFE
