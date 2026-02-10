<div align="center">
  <img src="https://img.shields.io/badge/LessonForge-Teaching%20Dashboard-E11D6B?style=for-the-badge&logo=bookstack&logoColor=white" alt="LessonForge">
  
  <h1>🎓 LessonForge</h1>
  <p><strong>Open-source lesson management terminal for language teachers</strong></p>
  <p>A beautiful, offline-capable dashboard to organize lessons, track class time, manage student profiles, and store teaching resources — all in your browser.</p>

  <br>

  ![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite&logoColor=white)
  ![JavaScript](https://img.shields.io/badge/JavaScript-ES2024-F7DF1E?logo=javascript&logoColor=black)
  ![CSS](https://img.shields.io/badge/CSS-Custom%20Properties-1572B6?logo=css3&logoColor=white)
  ![License](https://img.shields.io/badge/License-MIT-green)
</div>

---

## ✨ Features

### 📖 Lesson Management
- **Multi-page lessons** — Organize content into separate pages (Warm-Up, Vocabulary, Grammar, etc.)
- **Rich-text editing** — Bold, italic, underline, colored highlights, lists
- **Drag-and-drop reordering** — Rearrange lesson pages by dragging
- **Import/Export** — Share lesson plans as JSON files with colleagues

### 🧰 Toolkit
- **Resource cards** — Quick-reference grammar rules, vocabulary, pronunciation tips
- **Categorized & filterable** — Filter cards by type (Grammar, Vocabulary, Connectors, etc.)
- **Custom categories** — Add your own card categories
- **Fully editable** — Add, edit, and delete cards in edit mode

### ⏱️ Timer
- **Stopwatch mode** — Count up during class
- **Countdown mode** — Set a timer (e.g. 25 minutes) with visual warnings at 60s and expiry alert
- **Keyboard shortcut** — Press `0` to start/stop

### 👩‍🎓 Student Profiles
- Save student **name, level, and notes**
- Quick-switch between students from the toolbar dropdown
- Stored in localStorage — persists across sessions

### 🎨 Design
- **Sakura theme** — Soft pink/rose palette in light mode, deep rose in dark mode
- **Dark mode toggle** — One-click switch
- **Print stylesheet** — `Ctrl+P` prints just the lesson content, no UI chrome
- **Keyboard-first** — Number keys to switch pages, `E` to edit, `?` for shortcuts

### 💾 Data
- **LocalStorage persistence** — All data auto-saved
- **Undo/Redo** — Up to 50 history snapshots
- **JSON import/export** — Portable lesson plans

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/hatimhtm/LessonForge.git
cd LessonForge

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
npm run preview
```

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
|---|---|
| `1`–`9` | Switch lesson page |
| `0` | Start/stop timer |
| `E` | Toggle edit mode |
| `?` | Show shortcuts modal |
| `⌘Z` / `Ctrl+Z` | Undo |
| `⌘⇧Z` / `Ctrl+Shift+Z` | Redo |
| `⌘S` / `Ctrl+S` | Export lesson |
| `Esc` | Close modals |

---

## 📁 Project Structure

```
LessonForge/
├── index.html              # App entry point
├── package.json            # Dependencies & scripts
├── vite.config.js          # Build config
└── src/
    ├── main.js             # App controller
    ├── state.js            # State manager (localStorage, undo/redo)
    ├── data.js             # Demo content & defaults
    └── styles/
        ├── variables.css   # Design tokens & themes
        ├── layout.css      # Grid layout & modals
        ├── toolbar.css     # Toolbar & buttons
        ├── content.css     # Lesson content typography
        ├── toolkit.css     # Resource cards & filters
        ├── sidebar.css     # Navigation & checklist
        ├── shortcuts.css   # Shortcuts modal
        └── print.css       # Print stylesheet
```

---

## 🔧 Customization

### Adding Your Own Lessons
1. Click **Edit** in the toolbar
2. Create pages, add toolkit cards, customize the checklist
3. Click **Export** to save your lesson as a JSON file
4. Share the JSON with colleagues — they can click **Import** to load it

### Changing the Theme
Edit `src/styles/variables.css` to customize colors, fonts, spacing, and border radius tokens.

---

## 📄 License

MIT — free for personal and commercial use.

---

<div align="center">
  <p><sub>Built with ❤️ for teachers everywhere</sub></p>
  
  [![Portfolio](https://img.shields.io/badge/Portfolio-hatimelhassak.is--a.dev-E11D6B?style=flat-square&logo=safari&logoColor=white)](https://hatimelhassak.is-a.dev)
  [![LinkedIn](https://img.shields.io/badge/LinkedIn-Hatim%20El%20Hassak-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://linkedin.com/in/hatimelhassak)
</div>
