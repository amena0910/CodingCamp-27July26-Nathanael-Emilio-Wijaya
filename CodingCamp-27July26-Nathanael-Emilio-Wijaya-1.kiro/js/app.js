/* =============================================
   Life Dashboard — app.js
   Vanilla JS | LocalStorage | No frameworks
   ============================================= */

/* ─────────────────────────────────────────────
   SECTION 0 — THEME TOGGLE
   ───────────────────────────────────────────── */
const THEME_KEY    = 'dashboard_theme';
const btnTheme     = document.getElementById('theme-toggle');
const elThemeIcon  = document.getElementById('theme-icon');

function applyTheme(theme, animate) {
  document.documentElement.setAttribute('data-theme', theme);
  elThemeIcon.textContent = theme === 'light' ? '☀️' : '🌙';
  if (animate) {
    btnTheme.style.transform = 'scale(1.25) rotate(180deg)';
    setTimeout(() => { btnTheme.style.transform = ''; }, 300);
  }
}

function initTheme() {
  // Default to dark; respect saved preference
  const saved = localStorage.getItem(THEME_KEY) || 'dark';
  applyTheme(saved, false);
}

btnTheme.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next    = current === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next, true);
});

initTheme();


/* ─────────────────────────────────────────────
   SECTION 1 — NAME PROMPT
   ───────────────────────────────────────────── */
const NAME_KEY           = 'dashboard_username';
const elNameModalOverlay = document.getElementById('name-modal-overlay');
const elNameInput        = document.getElementById('name-input');
const btnNameSave        = document.getElementById('name-save');
const btnEditName        = document.getElementById('btn-edit-name');

function getUserName() {
  return localStorage.getItem(NAME_KEY) || '';
}

function saveUserName(name) {
  localStorage.setItem(NAME_KEY, name);
}

function openNameModal() {
  elNameInput.value = getUserName();
  elNameModalOverlay.classList.add('active');
  // Small delay so transition plays after display change
  setTimeout(() => elNameInput.focus(), 50);
}

function closeNameModal() {
  elNameModalOverlay.classList.remove('active');
}

function submitName() {
  const name = elNameInput.value.trim();
  if (!name) {
    elNameInput.focus();
    elNameInput.classList.add('input-error');
    setTimeout(() => elNameInput.classList.remove('input-error'), 600);
    return;
  }
  saveUserName(name);
  closeNameModal();
  updateClock(); // refresh greeting immediately
}

btnNameSave.addEventListener('click', submitName);
elNameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitName();
});
btnEditName.addEventListener('click', openNameModal);

// Show modal on first visit (no name saved yet)
if (!getUserName()) {
  openNameModal();
}


/* ─────────────────────────────────────────────
   SECTION 2 — GREETING & CLOCK
   ───────────────────────────────────────────── */
const elDate     = document.getElementById('current-date');
const elGreeting = document.getElementById('greeting-text');
const elTime     = document.getElementById('current-time');

function updateClock() {
  const now  = new Date();
  const hour = now.getHours();

  // Time string HH:MM:SS
  const hh = String(hour).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  elTime.textContent = `${hh}:${mm}:${ss}`;

  // Date string — e.g. "Friday, July 31, 2026"
  elDate.textContent = now.toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  // Greeting based on time of day, with name if available
  const name = getUserName();
  const namePart = name ? `, ${name}` : '';
  let greet;
  if (hour >= 5  && hour < 12) greet = `Good Morning${namePart}!`;
  else if (hour >= 12 && hour < 17) greet = `Good Afternoon${namePart}!`;
  else if (hour >= 17 && hour < 21) greet = `Good Evening${namePart}!`;
  else greet = `Good Night${namePart}!`;
  elGreeting.textContent = greet;
}

updateClock();
setInterval(updateClock, 1000);


/* ─────────────────────────────────────────────
   SECTION 2 — FOCUS TIMER
   ───────────────────────────────────────────── */
const TIMER_TOTAL   = 25 * 60; // 25 minutes in seconds
const elDisplay     = document.getElementById('timer-display');
const elTimerLabel  = document.getElementById('timer-label');
const btnStart      = document.getElementById('timer-start');
const btnStop       = document.getElementById('timer-stop');
const btnReset      = document.getElementById('timer-reset');

let timerSeconds  = TIMER_TOTAL;
let timerInterval = null;
let timerRunning  = false;

function formatTime(sec) {
  const m = String(Math.floor(sec / 60)).padStart(2, '0');
  const s = String(sec % 60).padStart(2, '0');
  return `${m}:${s}`;
}

function renderTimer() {
  elDisplay.textContent = formatTime(timerSeconds);
  elDisplay.classList.toggle('running',  timerRunning && timerSeconds > 0);
  elDisplay.classList.toggle('finished', timerSeconds === 0);
}

function tickTimer() {
  if (timerSeconds <= 0) {
    clearInterval(timerInterval);
    timerInterval = null;
    timerRunning  = false;
    elTimerLabel.textContent = 'Session complete! Take a break.';
    renderTimer();
    return;
  }
  timerSeconds--;
  renderTimer();
}

btnStart.addEventListener('click', () => {
  if (timerRunning || timerSeconds <= 0) return;
  timerRunning  = true;
  timerInterval = setInterval(tickTimer, 1000);
  elTimerLabel.textContent = 'Focusing...';
  renderTimer();
});

btnStop.addEventListener('click', () => {
  if (!timerRunning) return;
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning  = false;
  elTimerLabel.textContent = 'Paused. Resume when ready.';
  renderTimer();
});

btnReset.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerInterval = null;
  timerRunning  = false;
  timerSeconds  = TIMER_TOTAL;
  elTimerLabel.textContent = 'Ready to focus?';
  renderTimer();
});

renderTimer();


/* ─────────────────────────────────────────────
   SECTION 3 — TO-DO LIST
   ───────────────────────────────────────────── */
const TODO_KEY     = 'dashboard_todos';
const elTodoInput  = document.getElementById('todo-input');
const btnTodoAdd   = document.getElementById('todo-add');
const elTodoList   = document.getElementById('todo-list');
const elTodoEmpty  = document.getElementById('todo-empty');

// Modal elements
const elModalOverlay = document.getElementById('modal-overlay');
const elModalInput   = document.getElementById('modal-input');
const btnModalSave   = document.getElementById('modal-save');
const btnModalCancel = document.getElementById('modal-cancel');

let todos       = [];
let editingId   = null;

/* --- LocalStorage helpers --- */
function saveTodos() {
  localStorage.setItem(TODO_KEY, JSON.stringify(todos));
}

function loadTodos() {
  try {
    todos = JSON.parse(localStorage.getItem(TODO_KEY)) || [];
  } catch {
    todos = [];
  }
}

/* --- Render --- */
function renderTodos() {
  elTodoList.innerHTML = '';

  if (todos.length === 0) {
    elTodoEmpty.style.display = 'block';
    return;
  }
  elTodoEmpty.style.display = 'none';

  todos.forEach(task => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (task.done ? ' done' : '');
    li.dataset.id = task.id;

    li.innerHTML = `
      <input type="checkbox" class="todo-check" ${task.done ? 'checked' : ''} aria-label="Mark task done" />
      <span class="todo-text">${escapeHtml(task.text)}</span>
      <div class="todo-actions" role="group" aria-label="Task actions">
        <button class="btn btn-icon" title="Edit task" aria-label="Edit task">&#9998;</button>
        <button class="btn btn-icon danger" title="Delete task" aria-label="Delete task">&#10005;</button>
      </div>
    `;

    // Toggle done
    li.querySelector('.todo-check').addEventListener('change', (e) => {
      task.done = e.target.checked;
      saveTodos();
      renderTodos();
    });

    // Edit
    li.querySelector('.btn-icon:not(.danger)').addEventListener('click', () => {
      openEditModal(task.id, task.text);
    });

    // Delete
    li.querySelector('.btn-icon.danger').addEventListener('click', () => {
      todos = todos.filter(t => t.id !== task.id);
      saveTodos();
      renderTodos();
    });

    elTodoList.appendChild(li);
  });
}

/* --- Duplicate check (case-insensitive, ignores the task being edited) --- */
function isDuplicate(text, excludeId = null) {
  const normalized = text.trim().toLowerCase();
  return todos.some(t => t.id !== excludeId && t.text.trim().toLowerCase() === normalized);
}

function shakeInput(el) {
  el.classList.add('input-error');
  setTimeout(() => el.classList.remove('input-error'), 600);
  el.focus();
}

/* --- Add task --- */
function addTodo() {
  const text = elTodoInput.value.trim();
  if (!text) return;

  if (isDuplicate(text)) {
    showTodoDuplicateWarning(elTodoInput);
    return;
  }

  todos.push({ id: Date.now(), text, done: false });
  saveTodos();
  renderTodos();
  elTodoInput.value = '';
  elTodoInput.focus();
}

function showTodoDuplicateWarning(inputEl) {
  shakeInput(inputEl);
  // Show inline warning below the input row
  let warn = document.getElementById('todo-duplicate-warn');
  if (!warn) {
    warn = document.createElement('p');
    warn.id = 'todo-duplicate-warn';
    warn.className = 'duplicate-warn';
    warn.textContent = 'Task already exists!';
    elTodoInput.closest('.todo-input-row').insertAdjacentElement('afterend', warn);
  }
  warn.style.display = 'block';
  clearTimeout(warn._timer);
  warn._timer = setTimeout(() => { warn.style.display = 'none'; }, 2500);
}

btnTodoAdd.addEventListener('click', addTodo);
elTodoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

/* --- Edit modal --- */
function openEditModal(id, currentText) {
  editingId = id;
  elModalInput.value = currentText;
  elModalOverlay.classList.add('active');
  elModalInput.focus();
}

function closeModal() {
  editingId = null;
  elModalOverlay.classList.remove('active');
  // Clear any duplicate warning inside the modal
  const warn = document.getElementById('modal-duplicate-warn');
  if (warn) warn.style.display = 'none';
}

btnModalSave.addEventListener('click', () => {
  const newText = elModalInput.value.trim();
  if (!newText) return;

  // Block if the new text already exists in another task
  if (isDuplicate(newText, editingId)) {
    shakeInput(elModalInput);
    let warn = document.getElementById('modal-duplicate-warn');
    if (!warn) {
      warn = document.createElement('p');
      warn.id = 'modal-duplicate-warn';
      warn.className = 'duplicate-warn';
      warn.textContent = 'A task with that name already exists!';
      elModalInput.insertAdjacentElement('afterend', warn);
    }
    warn.style.display = 'block';
    clearTimeout(warn._timer);
    warn._timer = setTimeout(() => { warn.style.display = 'none'; }, 2500);
    return;
  }

  const task = todos.find(t => t.id === editingId);
  if (task) {
    task.text = newText;
    saveTodos();
    renderTodos();
  }
  closeModal();
});

btnModalCancel.addEventListener('click', closeModal);
elModalOverlay.addEventListener('click', (e) => {
  if (e.target === elModalOverlay) closeModal();
});
elModalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') btnModalSave.click();
  if (e.key === 'Escape') closeModal();
});

/* --- Init --- */
loadTodos();
renderTodos();


/* ─────────────────────────────────────────────
   SECTION 4 — QUICK LINKS
   ───────────────────────────────────────────── */
const LINKS_KEY      = 'dashboard_links';
const elLinkName     = document.getElementById('link-name-input');
const elLinkUrl      = document.getElementById('link-url-input');
const btnLinkAdd     = document.getElementById('link-add');
const elLinksGrid    = document.getElementById('links-grid');
const elLinksEmpty   = document.getElementById('links-empty');

let quickLinks = [];

/* --- LocalStorage helpers --- */
function saveLinks() {
  localStorage.setItem(LINKS_KEY, JSON.stringify(quickLinks));
}

function loadLinks() {
  try {
    quickLinks = JSON.parse(localStorage.getItem(LINKS_KEY)) || [];
  } catch {
    quickLinks = [];
  }

  // Seed defaults if first run
  if (quickLinks.length === 0) {
    quickLinks = [
      { id: 1, name: 'Google',  url: 'https://google.com' },
      { id: 2, name: 'GitHub',  url: 'https://github.com' },
      { id: 3, name: 'YouTube', url: 'https://youtube.com' },
    ];
    saveLinks();
  }
}

/* --- Render --- */
function renderLinks() {
  elLinksGrid.innerHTML = '';

  if (quickLinks.length === 0) {
    elLinksEmpty.style.display = 'block';
    return;
  }
  elLinksEmpty.style.display = 'none';

  quickLinks.forEach(link => {
    const chip = document.createElement('div');
    chip.className = 'link-chip';

    chip.innerHTML = `
      <a href="${escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer"
         class="link-chip-label" title="${escapeHtml(link.url)}">${escapeHtml(link.name)}</a>
      <button class="link-chip-del" title="Remove link" aria-label="Remove ${escapeHtml(link.name)}">&#10005;</button>
    `;

    chip.querySelector('.link-chip-del').addEventListener('click', () => {
      quickLinks = quickLinks.filter(l => l.id !== link.id);
      saveLinks();
      renderLinks();
    });

    elLinksGrid.appendChild(chip);
  });
}

/* --- Add link --- */
function addLink() {
  const name = elLinkName.value.trim();
  let   url  = elLinkUrl.value.trim();

  if (!name || !url) return;

  // Auto-prepend https:// if missing
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

  quickLinks.push({ id: Date.now(), name, url });
  saveLinks();
  renderLinks();
  elLinkName.value = '';
  elLinkUrl.value  = '';
  elLinkName.focus();
}

btnLinkAdd.addEventListener('click', addLink);
elLinkUrl.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addLink();
});
elLinkName.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') elLinkUrl.focus();
});

/* --- Init --- */
loadLinks();
renderLinks();


/* ─────────────────────────────────────────────
   UTILITY — HTML escape to prevent XSS
   ───────────────────────────────────────────── */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#039;');
}
