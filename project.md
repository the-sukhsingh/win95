# 🕹️ Project: Win95-Web (Windows 95 Web Desktop)

An interactive, retro-themed web application that recreates the iconic Windows 95 operating system inside the modern browser. Built as a functional portal, nostalgia playground, and interactive showcase.

---

## 🎨 1. Design Philosophy & Sensibilities

The primary goal of this project is **authentic digital archaeology coupled with modern web standards**. It is not just about making a static image look old—it's about mimicking the tactility, visual language, and interaction model of mid-90s desktop computing.

### Key Visual & UX Principles

* **Pixel Precision & Bevel Language:**
  * Windows 95 relies heavily on light and shadow to convey depth. UI elements use strict 2px high-contrast borders:
    * **Outset (Buttons/Unpressed elements):** Light gray/white top-left, dark gray/black bottom-right.
    * **Inset (Input boxes/Pressed elements):** Dark gray/black top-left, light gray/white bottom-right.
* **Authentic Color Palette:**
  * **Classic Desktop Teal:** `#008080`
  * **System Gray (Face):** `#C0C0C0`
  * **Window Title Active:** `#000080` (Navy blue gradient to black)
  * **Window Title Inactive:** `#808080`
  * **High-Contrast Text:** `#000000` on system gray/white fields.
* **Typography & Iconography:**
  * **System Font:** `MS Sans Serif`, `Tahoma`, or bitmapped fallback (`sans-serif` with crisp rendering `-webkit-font-smoothing: none`).
  * **Icons:** 32x32 bitmapped pixel icons with high-contrast 16-color palettes for desktop shortcuts and 16x16 for taskbar/menus.
* **Tactile Audio & Micro-Interactions:**
  * Crisp single-click feedback, double-click execution for desktop shortcuts.
  * Web Audio sound triggers for system events (bootup chord, warning `chord.wav`, error `asterisk.wav`).
* **Skeuomorphic Functionality:**
  * System tools (Notepad, Paint, Calculator) should actually function as working utilities, not non-interactive placeholders.

---

## 🏗️ 2. Architectural Design & Engineering

Building an OS UI inside the browser requires managing dynamic windowing, global states, and event listeners.


```

+-----------------------------------------------------------------------+
|                            Desktop (Root)                             |
|  +-------------------+  +-------------------+  +-------------------+  |
|  | Window 1 (Active) |  | Window 2 (Inact.) |  | Desktop Shortcuts |  |
|  |  [Z-Index: 100]   |  |  [Z-Index: 90]    |  |  (Double-click)   |  |
|  +-------------------+  +-------------------+  +-------------------+  |
|                                                                       |
|  +-----------------------------------------------------------------+  |
|  | Taskbar (Fixed Bottom) -> [Start Button] [Open Apps] [Clock]    |  |
|  +-----------------------------------------------------------------+  |
+-----------------------------------------------------------------------+

```

### Core Technical Challenges & Solutions

1. **Window Manager Engine (State & Z-Index):**
   * **State Array:** An array of open application objects containing `{ id, title, icon, isMinimized, isMaximized, position, size, zIndex }`.
   * **Focus Management:** Clicking anywhere on a window updates its `zIndex` to highest current value + 1 and sets it as `activeWindowId`.
2. **Window Manipulation (Drag & Resize):**
   * Pointer event capture on window headers (`mousedown` / `pointerdown`) tracking delta $X$ and $Y$ offsets relative to view boundary constraints.
3. **Taskbar & Start Menu Orchestration:**
   * Global state toggles for Start Menu expansion.
   * Clicking taskbar buttons restores minimized windows or minimizes currently focused windows.
4. **Context Menus:**
   * Global right-click event handler (`contextmenu`) suppressed on desktop to render a custom Win95 context menu (e.g., *Arrange Icons*, *New Text Document*, *Properties*).

---


Tasks-
- [ ] Responsive Win95 Desktop layout with customizable background color (`#008080` default).
- [ ] Draggable, resizable, minimizable, and maximizable window components.
- [ ] Taskbar with live system clock, active task tabs, and functional Start Menu.
- [ ] Functional desktop icons with selection state and double-click launching.

- [ ] **Notepad:** Functional plain-text editor with options to download `.txt` files locally.
- [ ] **My Computer / File Explorer:** Hierarchical file viewer showcasing projects, resume, or custom directory stacks.
- [ ] **Minesweeper:** Fully playable retro game with standard difficulty presets (Beginner, Intermediate, Expert).
- [ ] **System Terminal / MS-DOS Prompt:** Command line interface supporting Easter eggs and navigation (e.g., `dir`, `cd`, `help`, `matrix`, `clear`).

- [ ] **Startup Experience:** Optional Windows 95 boot screen with authentic start sound.
- [ ] **Sound Effects Engine:** Web Audio integration for clicks, errors, and system events.
- [ ] **CRT Monitor Shader / Toggle:** Optional CSS/WebGL scanline overlay and screen curvature filter.
- [ ] **Clippy / Assistant:** Nostalgic assistant offering tips about navigating the portfolio/site.


* **Webamp Integration:** Drop in [Webamp](https://webamp.org/) to play local audio files or retro stream links.
* **Internet Explorer 3.0 Sandbox:** An in-desktop browser frame that loads vintage web page archives.
* **JS-DOS Integration:** Run classic DOS games (`Doom`, `Prince of Persia`) inside a dedicated window using WebAssembly.