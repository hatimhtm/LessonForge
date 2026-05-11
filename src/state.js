/**
 * LessonForge — State Manager
 * Handles localStorage persistence, undo/redo history, and import/export.
 */

const STORE_KEY = 'lessonforge_state';
const MAX_HISTORY = 50;

function htmlToMarkdown(html) {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;

    const walk = (node) => {
        let out = '';
        node.childNodes.forEach((child) => {
            if (child.nodeType === Node.TEXT_NODE) {
                out += child.textContent;
                return;
            }
            if (child.nodeType !== Node.ELEMENT_NODE) return;
            const tag = child.tagName.toLowerCase();
            const inner = walk(child);
            if (tag === 'br') out += '\n';
            else if (tag === 'b' || tag === 'strong') out += `**${inner}**`;
            else if (tag === 'i' || tag === 'em') out += `*${inner}*`;
            else if (tag === 'u') out += `__${inner}__`;
            else if (tag === 'h1') out += `\n# ${inner}\n\n`;
            else if (tag === 'h2') out += `\n## ${inner}\n\n`;
            else if (tag === 'h3') out += `\n### ${inner}\n\n`;
            else if (tag === 'p' || tag === 'div') out += `${inner}\n\n`;
            else if (tag === 'li') out += `- ${inner}\n`;
            else if (tag === 'ul' || tag === 'ol') out += `\n${inner}\n`;
            else if (tag === 'span' && child.className.startsWith('hl-')) {
                out += `==${inner}==`;
            } else out += inner;
        });
        return out;
    };

    return walk(tmp).replace(/\n{3,}/g, '\n\n').trim();
}

function stateToMarkdown(state) {
    const lines = [];
    const activeStudent = state.students?.find(s => s.id === state.activeStudentId);

    lines.push(`# LessonForge — Lesson Plan`);
    if (activeStudent) {
        lines.push(`\n**Student:** ${activeStudent.name}${activeStudent.level ? ` (${activeStudent.level})` : ''}`);
        if (activeStudent.notes) lines.push(`\n> ${activeStudent.notes.replace(/\n/g, '\n> ')}`);
    }
    lines.push(`\n_Exported ${new Date().toLocaleString()}_\n`);
    lines.push(`\n---\n`);

    (state.pages || []).forEach((page, i) => {
        lines.push(`\n## ${i + 1}. ${page.title}\n`);
        lines.push(htmlToMarkdown(page.content));
        lines.push(`\n`);
    });

    if (state.checklist?.length) {
        lines.push(`\n---\n\n## Session Checklist\n`);
        state.checklist.forEach(item => {
            lines.push(`- [ ] ${item.text || item}`);
        });
    }

    if (state.tools?.length) {
        lines.push(`\n\n---\n\n## Toolkit\n`);
        const byCategory = {};
        state.tools.forEach(t => {
            (byCategory[t.category] ||= []).push(t);
        });
        Object.entries(byCategory).forEach(([cat, items]) => {
            lines.push(`\n### ${cat}\n`);
            items.forEach(t => {
                lines.push(`**${t.title}** — ${t.content || t.body || ''}`);
                lines.push('');
            });
        });
    }

    return lines.join('\n');
}

class StateManager {
    constructor() {
        this.history = [];
        this.pointer = -1;
        this.debounceTimer = null;
        this.lastSavedAt = null;
        this.saveListeners = [];
    }

    onSave(fn) { this.saveListeners.push(fn); }

    /** Load state from localStorage (or return null if none) */
    load() {
        try {
            const raw = localStorage.getItem(STORE_KEY);
            return raw ? JSON.parse(raw) : null;
        } catch {
            return null;
        }
    }

    /** Save state to localStorage */
    save(state) {
        try {
            localStorage.setItem(STORE_KEY, JSON.stringify(state));
            this.lastSavedAt = Date.now();
            this.saveListeners.forEach(fn => fn(this.lastSavedAt));
        } catch (e) {
            console.warn('LessonForge: Could not save state', e);
        }
    }

    /** Record a snapshot for undo/redo */
    recordSnapshot(state) {
        // Discard any future states ahead of pointer
        this.history = this.history.slice(0, this.pointer + 1);

        this.history.push(JSON.parse(JSON.stringify(state)));

        // Cap history
        if (this.history.length > MAX_HISTORY) {
            this.history.shift();
        } else {
            this.pointer++;
        }

        this.save(state);
    }

    /** Debounced snapshot (for contenteditable input events) */
    debouncedSnapshot(state, delay = 800) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.recordSnapshot(state), delay);
    }

    /** Undo — returns previous state or null */
    undo() {
        if (this.pointer > 0) {
            this.pointer--;
            return JSON.parse(JSON.stringify(this.history[this.pointer]));
        }
        return null;
    }

    /** Redo — returns next state or null */
    redo() {
        if (this.pointer < this.history.length - 1) {
            this.pointer++;
            return JSON.parse(JSON.stringify(this.history[this.pointer]));
        }
        return null;
    }

    canUndo() { return this.pointer > 0; }
    canRedo() { return this.pointer < this.history.length - 1; }

    /** Trigger a browser download for a Blob */
    download(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /** Export current state as JSON file download */
    exportJSON(state, filename = 'lessonforge-export.json') {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        this.download(blob, filename);
    }

    /** Export current state as a Markdown document (lesson plan only) */
    exportMarkdown(state, filename = 'lessonforge-lesson.md') {
        const md = stateToMarkdown(state);
        const blob = new Blob([md], { type: 'text/markdown' });
        this.download(blob, filename);
    }

    /** Import JSON file — returns promise that resolves with parsed state */
    importJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    resolve(data);
                } catch (err) {
                    reject(new Error('Invalid JSON file'));
                }
            };
            reader.onerror = () => reject(new Error('Could not read file'));
            reader.readAsText(file);
        });
    }

    /** Clear saved state */
    clear() {
        localStorage.removeItem(STORE_KEY);
        this.history = [];
        this.pointer = -1;
    }
}

export default new StateManager();
