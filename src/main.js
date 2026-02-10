/**
 * LessonForge — Main Application Controller
 * Orchestrates all UI interactions, rendering, and state management.
 */

import stateManager from './state.js';
import {
    defaultPages,
    defaultTools,
    defaultCategories,
    defaultChecklist,
    defaultStudents,
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
    addBtn.onclick = () => {
        const txt = prompt('New checklist item:');
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

function addNewPage() {
    const t = prompt('Page Title:');
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

function deletePage(index) {
    if (confirm('Delete this page?')) {
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

function deleteTool(index) {
    if (confirm('Delete this card?')) {
        tools.splice(index, 1);
        stateManager.recordSnapshot(getState());
        renderTools();
    }
}

function addNewCategory() {
    const name = prompt('New Category Name:');
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

function deleteStudent(id) {
    if (confirm('Delete this student?')) {
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
                    // Flash alert
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
    const btn = document.getElementById('themeBtn');
    btn.innerHTML = isDark
        ? '<i class="fa-solid fa-moon"></i>'
        : '<i class="fa-solid fa-sun"></i>';
}

// ═══════════════════════════════════════════════════
// Reset
// ═══════════════════════════════════════════════════
function resetSession() {
    if (confirm('Reset session? This will clear checkboxes, timer, and notes.')) {
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
        alert('Lesson plan imported successfully!');
    } catch (err) {
        alert('Import failed: ' + err.message);
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
    document.getElementById('importBtn').addEventListener('click', importLesson);
    document.getElementById('importFile').addEventListener('change', handleImport);

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
