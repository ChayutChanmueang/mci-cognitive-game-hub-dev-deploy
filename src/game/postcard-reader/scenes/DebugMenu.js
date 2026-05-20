/**
 * DebugMenu — a DOM-based debug overlay for Postcard Reader.
 *
 * Completely outside Phaser's canvas — lives as a fixed-position <div>
 * appended to document.body. Survives scene restarts; call destroy() to
 * remove it when the scene shuts down.
 *
 * Usage:
 *   this.debugMenu = new DebugMenu(this);          // in create()
 *   this.events.once('shutdown', () => this.debugMenu.destroy());
 */
export default class DebugMenu {
    /** @param {Phaser.Scene} scene */
    constructor(scene) {
        this.scene = scene;
        this._isOpen = false;

        // ── Actions list ──────────────────────────────────────────────────
        // Add more entries here to extend the menu.
        this._actions = [
            {
                label: '⏱ Trigger Game Over',
                style: { background: '#c62828', hoverBg: '#ef5350' },
                action: () => {
                    if (typeof scene.onGameOver === 'function') {
                        scene.onGameOver('debug');
                    } else {
                        console.warn('[DebugMenu] scene.onGameOver() not found');
                    }
                    this._close();
                },
            },
            {
                label: '🕒 Set Time to 30s',
                style: { background: '#fb8c00', hoverBg: '#ffa726' },
                action: () => {
                    if (scene.countdownTimer) {
                        scene.countdownTimer.reset({
                            delay: scene.countdownTimer.elapsed + 30000,
                            callback: () => {
                                scene.isTimeUp = true;
                            },
                        });
                        scene.isTimeUp = false;
                    }
                    this._close();
                },
            },
            {
                label: '🔄 Restart Scene',
                style: { background: '#1565c0', hoverBg: '#1e88e5' },
                action: () => {
                    scene.scene.restart();
                    // DOM element persists; new scene will create a new DebugMenu
                    this.destroy();
                },
            },
        ];

        this._buildDOM();
        this._bindSceneEvents();
    }

    // ── Private ───────────────────────────────────────────────────────────

    _buildDOM() {
        // ── Root wrapper (fixed bottom-left corner) ───────────────────────
        const root = document.createElement('div');
        root.id = 'postcard-reader-debug-menu';
        Object.assign(root.style, {
            position:      'fixed',
            bottom:        '16px',
            left:          '16px',
            zIndex:        '99999',
            display:       'flex',
            flexDirection: 'column',
            alignItems:    'flex-start',
            gap:           '8px',
            fontFamily:    '"Noto Sans Thai", system-ui, sans-serif',
            userSelect:    'none',
        });

        // ── Panel (the expanding menu) ────────────────────────────────────
        const panel = document.createElement('div');
        Object.assign(panel.style, {
            display:         'none',          // hidden by default
            flexDirection:   'column',
            gap:             '8px',
            padding:         '12px',
            borderRadius:    '12px',
            background:      'rgba(18, 18, 18, 0.96)',
            border:          '1px solid rgba(255,255,255,0.12)',
            backdropFilter:  'blur(8px)',
            boxShadow:       '0 8px 32px rgba(0,0,0,0.5)',
            minWidth:        '220px',
        });

        // Panel header
        const header = document.createElement('div');
        Object.assign(header.style, {
            color:      '#9e9e9e',
            fontSize:   '11px',
            fontWeight: '700',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            paddingBottom: '4px',
            borderBottom:  '1px solid rgba(255,255,255,0.1)',
            marginBottom:  '2px',
        });
        header.textContent = 'Debug Menu';
        panel.appendChild(header);

        // Action buttons
        this._actions.forEach(def => {
            const btn = document.createElement('button');
            btn.textContent = def.label;
            Object.assign(btn.style, {
                display:       'block',
                width:         '100%',
                padding:       '10px 14px',
                borderRadius:  '8px',
                border:        'none',
                background:    def.style.background,
                color:         '#fff',
                fontSize:      '14px',
                fontWeight:    '600',
                cursor:        'pointer',
                textAlign:     'left',
                transition:    'background 120ms ease, transform 80ms ease',
            });
            btn.addEventListener('mouseenter', () => {
                btn.style.background = def.style.hoverBg;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.background = def.style.background;
            });
            btn.addEventListener('mousedown',  () => { btn.style.transform = 'scale(0.97)'; });
            btn.addEventListener('mouseup',    () => { btn.style.transform = 'scale(1)'; });
            btn.addEventListener('click', def.action);
            panel.appendChild(btn);
        });

        // ── Toggle button ─────────────────────────────────────────────────
        const toggle = document.createElement('button');
        toggle.textContent = '🐛';
        toggle.title = 'Debug Menu';
        Object.assign(toggle.style, {
            width:        '44px',
            height:       '44px',
            borderRadius: '50%',
            border:       '2px solid rgba(255,255,255,0.2)',
            background:   'rgba(18, 18, 18, 0.88)',
            color:        '#fff',
            fontSize:     '20px',
            cursor:       'pointer',
            display:      'grid',
            placeItems:   'center',
            backdropFilter: 'blur(6px)',
            boxShadow:    '0 4px 16px rgba(0,0,0,0.4)',
            transition:   'background 120ms ease, transform 80ms ease',
            lineHeight:   '1',
        });
        toggle.addEventListener('mouseenter', () => {
            toggle.style.background = 'rgba(50, 50, 50, 0.96)';
        });
        toggle.addEventListener('mouseleave', () => {
            toggle.style.background = 'rgba(18, 18, 18, 0.88)';
        });
        toggle.addEventListener('mousedown',  () => { toggle.style.transform = 'scale(0.92)'; });
        toggle.addEventListener('mouseup',    () => { toggle.style.transform = 'scale(1)'; });
        toggle.addEventListener('click', () => this._toggle());

        // Assemble: panel on top, toggle below
        root.appendChild(panel);
        root.appendChild(toggle);
        document.body.appendChild(root);

        // Store references for later
        this._root      = root;
        this._panel     = panel;
        this._toggleBtn = toggle;
    }

    _toggle() {
        this._isOpen ? this._close() : this._open();
    }

    _open() {
        this._isOpen = true;
        this._panel.style.display    = 'flex';
        this._toggleBtn.textContent  = '✕';
        this._toggleBtn.title        = 'Close Debug Menu';
    }

    _close() {
        this._isOpen = false;
        this._panel.style.display    = 'none';
        this._toggleBtn.textContent  = '🐛';
        this._toggleBtn.title        = 'Debug Menu';
    }

    /** Wire scene shutdown so the DOM node is cleaned up automatically. */
    _bindSceneEvents() {
        this.scene.events.once('shutdown', () => this.destroy());
        this.scene.events.once('destroy',  () => this.destroy());
    }

    /** Remove the DOM node entirely. Safe to call multiple times. */
    destroy() {
        if (this._root && this._root.parentNode) {
            this._root.parentNode.removeChild(this._root);
        }
        this._root = null;
    }
}
