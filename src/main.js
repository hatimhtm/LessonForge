/**
 * LessonForge — Main Application Controller
 * Orchestrates all UI interactions, rendering, and state management.
 */

import stateManager from './state.js';
import { showPrompt, showConfirm, showAlert } from './dialog.js';
import {
    defaultPages,
    defaultTools,
    defaultCategories,
    defaultChecklist,
    defaultStudents,
    lessonTemplates,
} from './data.js';

// ═══════════════════════════════════════════════════
// App State
// ═══════════════════════════════════════════════════
let pages = [];
let tools = [];
let categories = [];
let checklist = [];
let students = [];

let activeIndex = 0;
let activeFilter = 'all';
let isEditMode = false;
let editingStudentId = null;
let activeStudentId = null;

// Timer
let timerInterval = null;
let timerSeconds = 0;
let timerRunning = false;
let timerMode = 'stopwatch'; // 'stopwatch' | 'countdown'
let countdownTarget = 0;

// Drag
let draggedItem = null;

// ═══════════════════════════════════════════════════
// Initialize
// ═══════════════════════════════════════════════════
function init() {
    // Load persisted theme before anything paints
    const savedTheme = localStorage.getItem('lessonforge_theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        document.body.dataset.theme = savedTheme;
    }
    syncThemeIcon();

    const saved = stateManager.load();
    if (saved) {
        pages = saved.pages || defaultPages;
        tools = saved.tools || defaultTools;
        categories = saved.categories || defaultCategories;
        checklist = saved.checklist || defaultChecklist;
        students = saved.students || defaultStudents;
        activeIndex = saved.activeIndex || 0;
        activeStudentId = saved.activeStudentId || null;
    } else {
        pages = JSON.parse(JSON.stringify(defaultPages));
        tools = JSON.parse(JSON.stringify(defaultTools));
        categories = [...defaultCategories];
        checklist = [...defaultChecklist];
        students = [];
    }

    renderAll();
    stateManager.recordSnapshot(getState());
    bindEvents();
    updateUndoRedoButtons();

    // Save indicator wiring
    stateManager.onSave(() => paintSaveIndicator());
    setInterval(paintSaveIndicator, 15_000);
    paintSaveIndicator();
}

function getState() {
    // Scrape current content from DOM if in edit mode
    if (isEditMode) {
        const el = document.getElementById('contentArea');
        if (el && pages[activeIndex]) {
            pages[activeIndex].content = el.innerHTML;
        }
    }
    return {
        pages,
        tools,
        categories,
        checklist,
        students,
        activeIndex,
        activeStudentId,
    };
}

// ═══════════════════════════════════════════════════
// Rendering
// ═══════════════════════════════════════════════════
function renderAll() {
    renderNav();
    renderContent();
    renderFilters();
    renderTools();
    renderChecklist();
    renderStudentList();
    updateStudentDisplay();
}

function renderNav() {
    const nav = document.getElementById('pageNav');
    nav.innerHTML = '';
    pages.forEach((page, i) => {
        const btn = document.createElement('button');
        btn.className = `step-btn ${i === activeIndex ? 'active' : ''}`;
        btn.dataset.index = i;

        // Drag support in edit mode
        if (isEditMode) {
            btn.draggable = true;
            btn.addEventListener('dragstart', handleDragStart);
            btn.addEventListener('dragover', handleDragOver);
            btn.addEventListener('dragend', handleDragEnd);
            btn.addEventListener('drop', handleDrop);
        }

        btn.innerHTML = `
            <span class="step-num">${i + 1}</span>
            <span class="step-title">${page.title}</span>
            <button class="step-del" onclick="event.stopPropagation(); window.LF.deletePage(${i})"><i class="fa-solid fa-xmark"></i></button>
        `;

        btn.addEventListener('click', (e) => {
            if (!e.target.closest('.step-del')) setActivePage(i);
        });
        nav.appendChild(btn);
    });
}

function renderContent() {
    const area = document.getElementById('contentArea');
    if (!pages[activeIndex]) return;
    area.innerHTML = pages[activeIndex].content;

    if (isEditMode) {
        area.contentEditable = true;
        area.addEventListener('input', () => {
            pages[activeIndex].content = area.innerHTML;
            stateManager.debouncedSnapshot(getState());
        });
    } else {
        area.contentEditable = false;
    }
}

function renderFilters() {
    const container = document.getElementById('toolFilters');
    container.innerHTML = '';

    const allChip = document.createElement('button');
    allChip.className = `filter-chip ${activeFilter === 'all' ? 'active' : ''}`;
    allChip.textContent = 'All';
    allChip.onclick = () => { activeFilter = 'all'; renderFilters(); renderTools(); };
    container.appendChild(allChip);

    categories.forEach(cat => {
        const chip = document.createElement('button');
        chip.className = `filter-chip ${activeFilter === cat ? 'active' : ''}`;
        chip.textContent = capitalize(cat);
        chip.onclick = () => { activeFilter = cat; renderFilters(); renderTools(); };
        container.appendChild(chip);
    });

    // Populate category select for new tools
    const select = document.getElementById('newToolCat');
    if (select) {
        select.innerHTML = categories.map(c =>
            `<option value="${c}">${capitalize(c)}</option>`
        ).join('');
    }
}

function renderTools() {
    const container = document.getElementById('toolkitContainer');
    container.innerHTML = '';

    const colorMap = {
        grammar: { bg: 'var(--green-bg)', txt: 'var(--green-text)' },
        vocabulary: { bg: 'var(--blue-bg)', txt: 'var(--blue-text)' },
        connectors: { bg: 'var(--orange-bg)', txt: 'var(--orange-text)' },
        pronunciation: { bg: 'var(--pink-bg)', txt: 'var(--pink-text)' },
    };

    tools.forEach((tool, index) => {
        if (activeFilter !== 'all' && tool.type !== activeFilter) return;

        const card = document.createElement('div');
        card.className = 'tool-card';

        const colors = colorMap[tool.type] || { bg: 'var(--purple-bg)', txt: 'var(--purple-text)' };

        card.innerHTML = `
            <button class="tool-del-btn" onclick="window.LF.deleteTool(${index})">DEL</button>
            <span class="tool-tag" style="background:${colors.bg}; color:${colors.txt}">${tool.tag}</span>
            <div class="tool-content" contenteditable="${isEditMode}">${tool.text}</div>
        `;

        if (isEditMode) {
            card.querySelector('.tool-content').addEventListener('input', (e) => {
                tools[index].text = e.target.innerText;
                stateManager.debouncedSnapshot(getState());
            });
        }

        container.appendChild(card);
    });
}

function renderChecklist() {
    const container = document.getElementById('checklistContainer');
    container.innerHTML = '';

    checklist.forEach((item, index) => {
        const label = document.createElement('label');
        label.className = 'chk-item';
        label.innerHTML = `
            <input type="checkbox">
            ${item}
            <i class="fa-solid fa-xmark chk-del" onclick="event.stopPropagation(); event.preventDefault(); window.LF.deleteChecklistItem(${index})"></i>
        `;
        label.querySelector('input').onchange = function () {
            this.checked ? label.classList.add('done') : label.classList.remove('done');
        };
        container.appendChild(label);
    });

    // Add button (edit mode)
    const addBtn = document.createElement('button');
    addBtn.className = 'icon-btn-small edit-only-block';
    addBtn.style.marginLeft = '10px';
    addBtn.innerHTML = '<i class="fa-solid fa-plus"></i>';
    addBtn.onclick = async () => {
        const txt = await showPrompt({
            title: 'New checklist item',
            placeholder: 'e.g. Warm-up done, homework collected',
            confirmLabel: 'Add',
        });
        if (txt) {
            checklist.push(txt);
            stateManager.recordSnapshot(getState());
            renderChecklist();
        }
    };
    container.appendChild(addBtn);
}

function renderStudentList() {
    const list = document.getElementById('studentList');
    if (!list) return;
    list.innerHTML = '';

    if (students.length === 0) {
        list.innerHTML = '<div style="padding:14px; text-align:center; color:var(--text-muted); font-size:12px;">No students yet</div>';
        return;
    }

    students.forEach(s => {
        const item = document.createElement('div');
        item.className = `student-item ${s.id === activeStudentId ? 'active' : ''}`;
        item.innerHTML = `
            <div class="student-item-info">
                <span class="student-item-name">${s.name}</span>
                <span class="student-item-level">${s.level}</span>
            </div>
            <div class="student-item-actions">
                <button class="icon-btn-small" title="Edit" onclick="event.stopPropagation(); window.LF.editStudent('${s.id}')"><i class="fa-solid fa-pen" style="font-size:10px"></i></button>
                <button class="icon-btn-small" title="Delete" onclick="event.stopPropagation(); window.LF.deleteStudent('${s.id}')"><i class="fa-solid fa-trash" style="font-size:10px; color:var(--danger)"></i></button>
            </div>
        `;
        item.addEventListener('click', () => {
            activeStudentId = s.id;
            stateManager.save(getState());
            renderStudentList();
            updateStudentDisplay();
            toggleStudentDropdown(false);
        });
        list.appendChild(item);
    });
}

function updateStudentDisplay() {
    const nameEl = document.getElementById('studentName');
    if (!nameEl) return;
    const student = students.find(s => s.id === activeStudentId);
    nameEl.textContent = student ? student.name : 'No Student';
}

// ═══════════════════════════════════════════════════
// Page Management
// ═══════════════════════════════════════════════════
function setActivePage(index) {
    // Save current page content
    if (isEditMode && pages[activeIndex]) {
        pages[activeIndex].content = document.getElementById('contentArea').innerHTML;
    }
    activeIndex = index;
    stateManager.save(getState());
    renderNav();
    renderContent();
}

async function addNewPage() {
    const t = await showPrompt({
        title: 'New page',
        placeholder: 'e.g. Warm-Up, Vocabulary, Reading…',
        confirmLabel: 'Create',
    });
    if (t) {
        pages.splice(activeIndex + 1, 0, {
            id: 'p' + Date.now(),
            title: t,
            content: `<h1>${t}</h1><p>Start writing here...</p>`,
        });
        stateManager.recordSnapshot(getState());
        renderAll();
        setActivePage(activeIndex + 1);
    }
}

async function deletePage(index) {
    const ok = await showConfirm({
        title: 'Delete this page?',
        message: `"${pages[index]?.title ?? 'Untitled'}" will be removed. You can undo this with ⌘Z.`,
        confirmLabel: 'Delete',
        danger: true,
    });
    if (ok) {
        pages.splice(index, 1);
        if (activeIndex >= pages.length) activeIndex = Math.max(0, pages.length - 1);
        stateManager.recordSnapshot(getState());
        renderAll();
    }
}

// ═══════════════════════════════════════════════════
// Tool Management
// ═══════════════════════════════════════════════════
function addNewTool() {
    const select = document.getElementById('newToolCat');
    const cat = select.value;
    tools.push({
        id: 't' + Date.now(),
        type: cat,
        tag: capitalize(cat).slice(0, 5).toUpperCase(),
        text: 'New card — edit me...',
    });
    stateManager.recordSnapshot(getState());
    if (activeFilter !== 'all' && activeFilter !== cat) {
        activeFilter = cat;
        renderFilters();
    }
    renderTools();
}

async function deleteTool(index) {
    const ok = await showConfirm({
        title: 'Delete this card?',
        message: 'You can undo this with ⌘Z.',
        confirmLabel: 'Delete',
        danger: true,
    });
    if (ok) {
        tools.splice(index, 1);
        stateManager.recordSnapshot(getState());
        renderTools();
    }
}

async function addNewCategory() {
    const name = await showPrompt({
        title: 'New category',
        placeholder: 'e.g. Idioms, False Friends, Phrasal Verbs',
        confirmLabel: 'Add',
    });
    if (name) {
        const slug = name.toLowerCase().replace(/\s+/g, '-');
        categories.push(slug);
        stateManager.recordSnapshot(getState());
        renderFilters();
    }
}

function deleteChecklistItem(index) {
    checklist.splice(index, 1);
    stateManager.recordSnapshot(getState());
    renderChecklist();
}

// ═══════════════════════════════════════════════════
// Student Management
// ═══════════════════════════════════════════════════
function toggleStudentDropdown(force) {
    const dd = document.getElementById('studentDropdown');
    if (force !== undefined) {
        dd.classList.toggle('active', force);
    } else {
        dd.classList.toggle('active');
    }
}

function openStudentModal(studentId = null) {
    editingStudentId = studentId;
    const modal = document.getElementById('studentModal');
    const titleEl = document.getElementById('studentModalTitle');

    if (studentId) {
        const s = students.find(st => st.id === studentId);
        if (!s) return;
        titleEl.textContent = 'Edit Student';
        document.getElementById('sName').value = s.name;
        document.getElementById('sLevel').value = s.level;
        document.getElementById('sNotes').value = s.notes || '';
    } else {
        titleEl.textContent = 'Add Student';
        document.getElementById('sName').value = '';
        document.getElementById('sLevel').value = 'Beginner';
        document.getElementById('sNotes').value = '';
    }

    modal.classList.add('active');
    toggleStudentDropdown(false);
}

function saveStudent(e) {
    e.preventDefault();
    const name = document.getElementById('sName').value.trim();
    const level = document.getElementById('sLevel').value;
    const notes = document.getElementById('sNotes').value.trim();

    if (!name) return;

    if (editingStudentId) {
        const s = students.find(st => st.id === editingStudentId);
        if (s) { s.name = name; s.level = level; s.notes = notes; }
    } else {
        students.push({ id: 's' + Date.now(), name, level, notes });
    }

    stateManager.recordSnapshot(getState());
    document.getElementById('studentModal').classList.remove('active');
    renderStudentList();
    updateStudentDisplay();
}

function editStudent(id) { openStudentModal(id); }

async function deleteStudent(id) {
    const student = students.find(s => s.id === id);
    const ok = await showConfirm({
        title: 'Delete this student?',
        message: `${student?.name ?? 'This student'}'s profile and notes will be removed. You can undo this with ⌘Z.`,
        confirmLabel: 'Delete',
        danger: true,
    });
    if (ok) {
        students = students.filter(s => s.id !== id);
        if (activeStudentId === id) activeStudentId = null;
        stateManager.recordSnapshot(getState());
        renderStudentList();
        updateStudentDisplay();
    }
}

// ═══════════════════════════════════════════════════
// Edit Mode
// ═══════════════════════════════════════════════════
function toggleEditMode() {
    isEditMode = !isEditMode;
    document.body.classList.toggle('edit-mode', isEditMode);

    const btn = document.getElementById('editToggleBtn');
    btn.innerHTML = isEditMode
        ? '<i class="fa-solid fa-check"></i> <span>Done</span>'
        : '<i class="fa-solid fa-pen-to-square"></i> <span>Edit</span>';
    btn.classList.toggle('active', isEditMode);

    renderAll();
}

// ═══════════════════════════════════════════════════
// Undo / Redo
// ═══════════════════════════════════════════════════
function undo() {
    const state = stateManager.undo();
    if (state) restoreState(state);
    updateUndoRedoButtons();
}

function redo() {
    const state = stateManager.redo();
    if (state) restoreState(state);
    updateUndoRedoButtons();
}

function restoreState(state) {
    pages = state.pages || pages;
    tools = state.tools || tools;
    categories = state.categories || categories;
    checklist = state.checklist || checklist;
    students = state.students || students;
    activeIndex = state.activeIndex ?? activeIndex;
    activeStudentId = state.activeStudentId ?? activeStudentId;
    renderAll();
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    undoBtn.classList.toggle('disabled', !stateManager.canUndo());
    redoBtn.classList.toggle('disabled', !stateManager.canRedo());
}

// ═══════════════════════════════════════════════════
// Timer
// ═══════════════════════════════════════════════════
function toggleTimer() {
    const display = document.getElementById('timerDisplay');
    const btn = document.getElementById('timerToggle');

    if (timerRunning) {
        clearInterval(timerInterval);
        display.classList.remove('running');
        btn.innerHTML = '<i class="fa-solid fa-play"></i>';
        timerRunning = false;
    } else {
        display.classList.add('running');
        btn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        timerRunning = true;

        timerInterval = setInterval(() => {
            if (timerMode === 'stopwatch') {
                timerSeconds++;
            } else {
                timerSeconds--;
                if (timerSeconds <= 60 && timerSeconds > 0) {
                    display.classList.add('warning');
                }
                if (timerSeconds <= 0) {
                    timerSeconds = 0;
                    clearInterval(timerInterval);
                    display.classList.remove('running', 'warning');
                    display.classList.add('expired');
                    btn.innerHTML = '<i class="fa-solid fa-play"></i>';
                    timerRunning = false;
                    playTimerChime();
                    showTimerToast();
                    setTimeout(() => display.classList.remove('expired'), 5000);
                }
            }
            updateTimerDisplay();
        }, 1000);
    }
}

function updateTimerDisplay() {
    const m = Math.floor(timerSeconds / 60).toString().padStart(2, '0');
    const s = (timerSeconds % 60).toString().padStart(2, '0');
    document.getElementById('timerTime').textContent = `${m}:${s}`;
}

function openTimerConfig() {
    document.getElementById('timerModal').classList.add('active');
}

function startCountdown() {
    const mins = parseInt(document.getElementById('countdownMins').value) || 25;
    timerMode = 'countdown';
    timerSeconds = mins * 60;
    countdownTarget = mins * 60;
    updateTimerDisplay();
    document.getElementById('timerModal').classList.remove('active');
    document.getElementById('timerDisplay').classList.remove('warning', 'expired');
    if (timerRunning) { clearInterval(timerInterval); timerRunning = false; }
    toggleTimer(); // auto-start
}

function switchToStopwatch() {
    timerMode = 'stopwatch';
    timerSeconds = 0;
    updateTimerDisplay();
    document.getElementById('timerModal').classList.remove('active');
    document.getElementById('timerDisplay').classList.remove('warning', 'expired');
    if (timerRunning) { clearInterval(timerInterval); timerRunning = false; }
}

// ═══════════════════════════════════════════════════
// Text Formatting (Edit Mode)
// ═══════════════════════════════════════════════════
function formatText(cmd) {
    document.execCommand(cmd, false, null);
    stateManager.debouncedSnapshot(getState());
}

function insertHighlight(cls) {
    const sel = window.getSelection();
    if (!sel.rangeCount || sel.isCollapsed) return;
    const span = document.createElement('span');
    span.className = cls;
    span.textContent = sel.toString();
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(span);
    sel.removeAllRanges();
    stateManager.debouncedSnapshot(getState());
}

// ═══════════════════════════════════════════════════
// Theme
// ═══════════════════════════════════════════════════
function toggleTheme() {
    const body = document.body;
    const isDark = body.dataset.theme === 'dark';
    body.dataset.theme = isDark ? 'light' : 'dark';
    localStorage.setItem('lessonforge_theme', body.dataset.theme);
    syncThemeIcon();
}

function syncThemeIcon() {
    const btn = document.getElementById('themeBtn');
    if (!btn) return;
    const isDark = document.body.dataset.theme === 'dark';
    btn.innerHTML = isDark
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
}

// ═══════════════════════════════════════════════════
// Save Indicator
// ═══════════════════════════════════════════════════
function paintSaveIndicator() {
    const el = document.getElementById('saveLabel');
    const wrap = document.getElementById('saveIndicator');
    if (!el || !wrap) return;
    const at = stateManager.lastSavedAt;
    if (!at) { el.textContent = 'Saved'; return; }
    const secs = Math.floor((Date.now() - at) / 1000);
    let txt;
    if (secs < 3) txt = 'Saved just now';
    else if (secs < 60) txt = `Saved · ${secs}s ago`;
    else if (secs < 3600) txt = `Saved · ${Math.floor(secs / 60)}m ago`;
    else txt = `Saved · ${Math.floor(secs / 3600)}h ago`;
    el.textContent = txt;
    wrap.classList.remove('saving');
}

// ═══════════════════════════════════════════════════
// Reset
// ═══════════════════════════════════════════════════
async function resetSession() {
    const ok = await showConfirm({
        title: 'Reset session?',
        message: 'Clears the checklist, the timer, and session notes. Your lesson plan and toolkit stay intact.',
        confirmLabel: 'Reset',
        danger: true,
    });
    if (ok) {
        document.querySelectorAll('.chk-item input[type="checkbox"]').forEach(c => {
            c.checked = false;
            c.parentElement.classList.remove('done');
        });
        document.getElementById('sessionNotes').value = '';
        timerSeconds = 0;
        updateTimerDisplay();
        if (timerRunning) toggleTimer();
        document.getElementById('timerDisplay').classList.remove('warning', 'expired');
    }
}

// ═══════════════════════════════════════════════════
// Import / Export
// ═══════════════════════════════════════════════════
function exportLesson() {
    if (isEditMode) {
        pages[activeIndex].content = document.getElementById('contentArea').innerHTML;
    }
    stateManager.exportJSON(getState());
}

function exportLessonMarkdown() {
    if (isEditMode) {
        pages[activeIndex].content = document.getElementById('contentArea').innerHTML;
    }
    stateManager.exportMarkdown(getState());
}

function importLesson() {
    document.getElementById('importFile').click();
}

async function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const data = await stateManager.importJSON(file);
        if (data.pages) pages = data.pages;
        if (data.tools) tools = data.tools;
        if (data.categories) categories = data.categories;
        if (data.checklist) checklist = data.checklist;
        if (data.students) students = data.students;
        activeIndex = data.activeIndex || 0;
        activeStudentId = data.activeStudentId || null;
        stateManager.recordSnapshot(getState());
        renderAll();
        showAlert({
            title: 'Imported',
            message: 'Lesson plan loaded from file.',
        });
    } catch (err) {
        showAlert({
            title: 'Import failed',
            message: err.message,
        });
    }
    e.target.value = '';
}

// ═══════════════════════════════════════════════════
// Drag & Drop (Page Reordering)
// ═══════════════════════════════════════════════════
function handleDragStart(e) {
    draggedItem = this;
    this.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleDragOver(e) {
    e.preventDefault();
    this.classList.add('drag-over');
    e.dataTransfer.dropEffect = 'move';
}

function handleDragEnd() {
    this.classList.remove('dragging');
    document.querySelectorAll('.step-btn').forEach(b => b.classList.remove('drag-over'));
}

function handleDrop(e) {
    e.stopPropagation();
    const dragIdx = parseInt(draggedItem.dataset.index);
    const dropIdx = parseInt(this.dataset.index);
    if (dragIdx !== dropIdx) {
        const item = pages.splice(dragIdx, 1)[0];
        pages.splice(dropIdx, 0, item);
        if (activeIndex === dragIdx) activeIndex = dropIdx;
        else if (activeIndex > dragIdx && activeIndex <= dropIdx) activeIndex--;
        else if (activeIndex < dragIdx && activeIndex >= dropIdx) activeIndex++;
        stateManager.recordSnapshot(getState());
        renderAll();
    }
}

// ═══════════════════════════════════════════════════
// Modals
// ═══════════════════════════════════════════════════
function openShortcutsModal() {
    document.getElementById('shortcutsModal').classList.add('active');
}

function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ═══════════════════════════════════════════════════
// Keyboard Shortcuts
// ═══════════════════════════════════════════════════
function handleKeyboard(e) {
    // Cmd+K opens palette from anywhere
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        openPalette();
        return;
    }

    // Ignore when typing in inputs
    const tag = document.activeElement.tagName;
    if (document.activeElement.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA') {
        // But still handle Cmd+Z/Cmd+Shift+Z
        if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
            e.preventDefault();
            e.shiftKey ? redo() : undo();
        }
        if ((e.metaKey || e.ctrlKey) && e.key === 's') {
            e.preventDefault();
            exportLesson();
        }
        return;
    }

    // Number keys → switch page
    if (e.key >= '1' && e.key <= '9') {
        const idx = parseInt(e.key) - 1;
        if (idx < pages.length) setActivePage(idx);
    }

    if (e.key === '0') toggleTimer();
    if (e.key === '?') openShortcutsModal();
    if (e.key === 'e' || e.key === 'E') toggleEditMode();
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.active').forEach(m => m.classList.remove('active'));
        toggleStudentDropdown(false);
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        exportLesson();
    }
}

// ═══════════════════════════════════════════════════
// Timer audio cue + toast
// ═══════════════════════════════════════════════════
function playTimerChime() {
    try {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        const ctx = new Ctx();
        const notes = [880, 660, 990]; // ding-ding-ding
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = freq;
            const t0 = ctx.currentTime + i * 0.18;
            gain.gain.setValueAtTime(0, t0);
            gain.gain.linearRampToValueAtTime(0.35, t0 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.32);
            osc.connect(gain).connect(ctx.destination);
            osc.start(t0);
            osc.stop(t0 + 0.35);
        });
        setTimeout(() => ctx.close().catch(() => {}), 1500);
    } catch { /* audio is best-effort */ }
}

function showTimerToast() {
    const t = document.getElementById('timerToast');
    if (!t) return;
    t.classList.add('active');
    setTimeout(() => t.classList.remove('active'), 4000);
}

// ═══════════════════════════════════════════════════
// Command Palette (⌘K)
// ═══════════════════════════════════════════════════
let paletteIndex = 0;
let paletteItems = [];

function openPalette() {
    const overlay = document.getElementById('paletteOverlay');
    const input = document.getElementById('paletteInput');
    overlay.classList.add('active');
    input.value = '';
    renderPaletteResults('');
    requestAnimationFrame(() => input.focus());
}

function closePalette() {
    document.getElementById('paletteOverlay').classList.remove('active');
}

function buildPaletteSource() {
    const items = [];
    pages.forEach((p, i) => {
        items.push({
            kind: 'page',
            icon: 'fa-file-lines',
            title: p.title,
            sub: `Page ${i + 1}`,
            action: () => { setActivePage(i); closePalette(); },
        });
    });
    students.forEach((s) => {
        items.push({
            kind: 'student',
            icon: 'fa-user-graduate',
            title: s.name,
            sub: `Student · ${s.level || 'No level'}`,
            action: () => {
                activeStudentId = s.id;
                stateManager.save(getState());
                renderStudentList();
                updateStudentDisplay();
                closePalette();
            },
        });
    });
    tools.forEach((t) => {
        items.push({
            kind: 'card',
            icon: 'fa-toolbox',
            title: t.title,
            sub: `Toolkit · ${t.category}`,
            action: () => {
                activeFilter = t.category;
                renderFilters();
                renderTools();
                closePalette();
            },
        });
    });
    items.push({
        kind: 'action',
        icon: 'fa-layer-group',
        title: 'Insert template…',
        sub: 'Action',
        action: () => { closePalette(); openTemplatesModal(); },
    });
    items.push({
        kind: 'action',
        icon: 'fa-file-export',
        title: 'Export Markdown',
        sub: 'Action',
        action: () => { closePalette(); exportLessonMarkdown(); },
    });
    items.push({
        kind: 'action',
        icon: 'fa-moon',
        title: 'Toggle theme',
        sub: 'Action',
        action: () => { closePalette(); toggleTheme(); },
    });
    return items;
}

function renderPaletteResults(query) {
    const results = document.getElementById('paletteResults');
    const q = query.trim().toLowerCase();
    const source = buildPaletteSource();
    paletteItems = q
        ? source.filter(it => it.title.toLowerCase().includes(q) || it.sub.toLowerCase().includes(q))
        : source.slice(0, 12);

    if (paletteItems.length === 0) {
        results.innerHTML = '<div class="palette-empty">No matches.</div>';
        return;
    }

    paletteIndex = 0;
    const groups = {};
    paletteItems.forEach((it, idx) => {
        (groups[it.kind] ||= []).push({ ...it, idx });
    });

    const order = ['page', 'student', 'card', 'action'];
    const labelMap = { page: 'Pages', student: 'Students', card: 'Toolkit', action: 'Actions' };

    results.innerHTML = order
        .filter(k => groups[k])
        .map(k => {
            const items = groups[k].map(it => `
                <div class="palette-item${it.idx === 0 ? ' active' : ''}" data-idx="${it.idx}">
                    <i class="fa-solid ${it.icon}"></i>
                    <div class="palette-item-body">
                        <div class="palette-item-title">${escapeHtml(it.title)}</div>
                        <div class="palette-item-sub">${escapeHtml(it.sub)}</div>
                    </div>
                </div>
            `).join('');
            return `<div class="palette-section-label">${labelMap[k]}</div>${items}`;
        }).join('');

    results.querySelectorAll('.palette-item').forEach(el => {
        el.addEventListener('mouseenter', () => setPaletteActive(parseInt(el.dataset.idx)));
        el.addEventListener('click', () => paletteItems[parseInt(el.dataset.idx)].action());
    });
}

function setPaletteActive(idx) {
    paletteIndex = idx;
    document.querySelectorAll('.palette-item').forEach((el) => {
        el.classList.toggle('active', parseInt(el.dataset.idx) === idx);
    });
}

function paletteKeydown(e) {
    const overlay = document.getElementById('paletteOverlay');
    if (!overlay.classList.contains('active')) return;
    if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        setPaletteActive(Math.min(paletteIndex + 1, paletteItems.length - 1));
        scrollPaletteActiveIntoView();
    }
    if (e.key === 'ArrowUp') {
        e.preventDefault();
        setPaletteActive(Math.max(paletteIndex - 1, 0));
        scrollPaletteActiveIntoView();
    }
    if (e.key === 'Enter') {
        e.preventDefault();
        const it = paletteItems[paletteIndex];
        if (it) it.action();
    }
}

function scrollPaletteActiveIntoView() {
    const active = document.querySelector('.palette-item.active');
    if (active) active.scrollIntoView({ block: 'nearest' });
}

function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    })[c]);
}

// ═══════════════════════════════════════════════════
// Templates
// ═══════════════════════════════════════════════════
function openTemplatesModal() {
    const grid = document.getElementById('templatesGrid');
    grid.innerHTML = lessonTemplates.map(tpl => `
        <button type="button" class="template-card" data-id="${tpl.id}">
            <div class="template-card-icon"><i class="fa-solid ${tpl.icon}"></i></div>
            <div class="template-card-title">${escapeHtml(tpl.title)}</div>
            <div class="template-card-desc">${escapeHtml(tpl.description)}</div>
        </button>
    `).join('');
    grid.querySelectorAll('.template-card').forEach(btn => {
        btn.addEventListener('click', () => applyTemplate(btn.dataset.id));
    });
    document.getElementById('templatesModal').classList.add('active');
}

function applyTemplate(id) {
    const tpl = lessonTemplates.find(t => t.id === id);
    if (!tpl) return;
    const stamp = Date.now();
    tpl.pages.forEach((p, i) => {
        pages.push({
            id: `tpl-${id}-${stamp}-${i}`,
            title: p.title,
            content: p.content.trim(),
        });
    });
    activeIndex = pages.length - tpl.pages.length;
    stateManager.recordSnapshot(getState());
    renderAll();
    updateUndoRedoButtons();
    closeModal('templatesModal');
}

// ═══════════════════════════════════════════════════
// Event Binding
// ═══════════════════════════════════════════════════
function bindEvents() {
    document.getElementById('editToggleBtn').addEventListener('click', toggleEditMode);
    document.getElementById('undoBtn').addEventListener('click', undo);
    document.getElementById('redoBtn').addEventListener('click', redo);
    document.getElementById('themeBtn').addEventListener('click', toggleTheme);
    document.getElementById('resetBtn').addEventListener('click', resetSession);
    document.getElementById('shortcutsBtn').addEventListener('click', openShortcutsModal);
    document.getElementById('addPageBtn').addEventListener('click', addNewPage);
    document.getElementById('exportBtn').addEventListener('click', exportLesson);
    document.getElementById('exportMdBtn').addEventListener('click', exportLessonMarkdown);
    document.getElementById('importBtn').addEventListener('click', importLesson);
    document.getElementById('importFile').addEventListener('change', handleImport);
    document.getElementById('paletteBtn').addEventListener('click', openPalette);
    document.getElementById('templatesBtn').addEventListener('click', openTemplatesModal);
    document.getElementById('closeTemplatesModal').addEventListener('click', () => closeModal('templatesModal'));

    // Command palette
    document.getElementById('paletteInput').addEventListener('input', (e) => renderPaletteResults(e.target.value));
    document.getElementById('paletteInput').addEventListener('keydown', paletteKeydown);
    document.getElementById('paletteOverlay').addEventListener('click', (e) => {
        if (e.target.id === 'paletteOverlay') closePalette();
    });

    // Timer
    document.getElementById('timerToggle').addEventListener('click', toggleTimer);
    document.getElementById('timerMode').addEventListener('click', openTimerConfig);
    document.getElementById('startCountdown').addEventListener('click', startCountdown);
    document.getElementById('switchToStopwatch').addEventListener('click', switchToStopwatch);
    document.getElementById('closeTimerModal').addEventListener('click', () => closeModal('timerModal'));

    // Student
    document.getElementById('studentBtn').addEventListener('click', () => toggleStudentDropdown());
    document.getElementById('addStudentBtn').addEventListener('click', () => openStudentModal());
    document.getElementById('studentForm').addEventListener('submit', saveStudent);
    document.getElementById('cancelStudentBtn').addEventListener('click', () => closeModal('studentModal'));
    document.getElementById('closeStudentModal').addEventListener('click', () => closeModal('studentModal'));

    // Shortcuts modal
    document.getElementById('closeShortcuts').addEventListener('click', () => closeModal('shortcutsModal'));

    // Toolkit
    document.getElementById('addToolBtn').addEventListener('click', addNewTool);
    document.getElementById('addCatBtn').addEventListener('click', addNewCategory);

    // Keyboard
    document.addEventListener('keydown', handleKeyboard);

    // Close dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.student-selector')) {
            toggleStudentDropdown(false);
        }
    });
}

// ═══════════════════════════════════════════════════
// Utility
// ═══════════════════════════════════════════════════
function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
}

// ═══════════════════════════════════════════════════
// Expose to HTML onclick handlers
// ═══════════════════════════════════════════════════
window.LF = {
    formatText,
    insertHighlight,
    deletePage,
    deleteTool,
    deleteChecklistItem,
    editStudent,
    deleteStudent,
};

// ═══════════════════════════════════════════════════
// Boot
// ═══════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', init);
