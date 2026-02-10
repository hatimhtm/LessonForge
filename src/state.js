/**
 * LessonForge — State Manager
 * Handles localStorage persistence, undo/redo history, and import/export.
 */

const STORE_KEY = 'lessonforge_state';
const MAX_HISTORY = 50;

class StateManager {
    constructor() {
        this.history = [];
        this.pointer = -1;
        this.debounceTimer = null;
    }

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

    /** Export current state as JSON file download */
    exportJSON(state, filename = 'lessonforge-export.json') {
        const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
