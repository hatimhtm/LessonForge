/**
 * LessonForge — Custom Dialog System
 *
 * Drop-in replacements for window.prompt / window.confirm / window.alert
 * that look like they belong in 2026. Built on the native <dialog>
 * element for accessibility (Esc closes, focus is trapped, screen
 * readers announce it correctly).
 *
 * Each function returns a Promise that resolves on user action:
 *   showPrompt(opts)  → string | null   (null = cancelled / closed)
 *   showConfirm(opts) → boolean         (false = cancelled / closed)
 *   showAlert(opts)   → void            (resolves on OK / close)
 */

// One <dialog> element gets reused — created on first use, kept around.
let dialogEl = null;
let currentResolver = null;

function ensureDialog() {
    if (dialogEl) return dialogEl;

    dialogEl = document.createElement('dialog');
    dialogEl.className = 'lf-dialog';
    dialogEl.innerHTML = `
        <form method="dialog" class="lf-dialog-form">
            <div class="lf-dialog-icon"></div>
            <h3 class="lf-dialog-title"></h3>
            <p class="lf-dialog-message"></p>
            <input type="text" class="lf-dialog-input" />
            <div class="lf-dialog-actions">
                <button type="button" class="lf-dialog-btn lf-dialog-cancel">Cancel</button>
                <button type="submit" class="lf-dialog-btn lf-dialog-confirm">OK</button>
            </div>
        </form>
    `;
    document.body.appendChild(dialogEl);

    // Click outside the dialog body → close (cancel)
    dialogEl.addEventListener('click', (e) => {
        if (e.target === dialogEl) {
            dialogEl.close('cancel');
        }
    });

    // <dialog> emits 'close' regardless of how it was dismissed
    dialogEl.addEventListener('close', () => {
        if (!currentResolver) return;
        const r = currentResolver;
        currentResolver = null;

        const returnValue = dialogEl.returnValue;
        const input = dialogEl.querySelector('.lf-dialog-input');
        const mode = dialogEl.dataset.mode;

        if (mode === 'prompt') {
            r(returnValue === 'confirm' ? input.value : null);
        } else if (mode === 'confirm') {
            r(returnValue === 'confirm');
        } else {
            r(); // alert
        }
    });

    // Submit (Enter or OK click) → mark confirmed
    dialogEl.querySelector('.lf-dialog-form').addEventListener('submit', () => {
        dialogEl.returnValue = 'confirm';
    });

    // Cancel button → close with explicit cancel
    dialogEl.querySelector('.lf-dialog-cancel').addEventListener('click', () => {
        dialogEl.close('cancel');
    });

    return dialogEl;
}

function open({ mode, title, message, placeholder, defaultValue, confirmLabel, cancelLabel, icon, danger }) {
    const el = ensureDialog();
    el.dataset.mode = mode;
    el.classList.toggle('lf-dialog-danger', !!danger);

    el.querySelector('.lf-dialog-icon').textContent = icon || '';
    el.querySelector('.lf-dialog-icon').style.display = icon ? 'grid' : 'none';
    el.querySelector('.lf-dialog-title').textContent = title || '';
    el.querySelector('.lf-dialog-title').style.display = title ? 'block' : 'none';

    const msgEl = el.querySelector('.lf-dialog-message');
    msgEl.textContent = message || '';
    msgEl.style.display = message ? 'block' : 'none';

    const input = el.querySelector('.lf-dialog-input');
    input.style.display = mode === 'prompt' ? 'block' : 'none';
    input.placeholder = placeholder || '';
    input.value = defaultValue || '';

    const confirmBtn = el.querySelector('.lf-dialog-confirm');
    const cancelBtn = el.querySelector('.lf-dialog-cancel');
    confirmBtn.textContent = confirmLabel || 'OK';
    cancelBtn.textContent = cancelLabel || 'Cancel';
    cancelBtn.style.display = mode === 'alert' ? 'none' : '';

    return new Promise((resolve) => {
        currentResolver = resolve;
        el.returnValue = '';
        el.showModal();
        if (mode === 'prompt') {
            requestAnimationFrame(() => input.focus());
        } else {
            requestAnimationFrame(() => confirmBtn.focus());
        }
    });
}

export function showPrompt({ title, message, placeholder, defaultValue, confirmLabel } = {}) {
    return open({
        mode: 'prompt',
        title,
        message,
        placeholder,
        defaultValue,
        confirmLabel,
        icon: '✏️',
    });
}

export function showConfirm({ title, message, confirmLabel, cancelLabel, danger } = {}) {
    return open({
        mode: 'confirm',
        title: title || 'Are you sure?',
        message,
        confirmLabel,
        cancelLabel,
        icon: danger ? '⚠️' : '❓',
        danger,
    });
}

export function showAlert({ title, message, confirmLabel } = {}) {
    return open({
        mode: 'alert',
        title: title || '',
        message,
        confirmLabel,
        icon: 'ℹ️',
    });
}
