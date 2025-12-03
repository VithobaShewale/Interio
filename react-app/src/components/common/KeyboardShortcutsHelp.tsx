import React, { useState, useEffect } from 'react';
import './KeyboardShortcutsHelp.css';

const KeyboardShortcutsHelp: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Show shortcuts help with ? or F1
      if (e.key === '?' || e.key === 'F1') {
        e.preventDefault();
        setIsVisible(prev => !prev);
      }
      // Close with Escape
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  if (!isVisible) return null;

  const shortcuts = [
    {
      category: 'General',
      items: [
        { keys: ['?', 'F1'], description: 'Show/hide keyboard shortcuts' },
        { keys: ['Esc'], description: 'Close dialogs or deselect' },
      ]
    },
    {
      category: 'Edit',
      items: [
        { keys: ['Ctrl', 'Z'], description: 'Undo last action' },
        { keys: ['Ctrl', 'Shift', 'Z'], description: 'Redo action' },
        { keys: ['Ctrl', 'Y'], description: 'Redo action (alternative)' },
        { keys: ['Ctrl', 'S'], description: 'Save design' },
        { keys: ['Delete'], description: 'Delete selected item' },
      ]
    },
    {
      category: 'View',
      items: [
        { keys: ['2'], description: 'Switch to 2D view' },
        { keys: ['3'], description: 'Switch to 3D view' },
        { keys: ['R'], description: 'Reset camera view' },
      ]
    },
    {
      category: 'Item Manipulation',
      items: [
        { keys: ['←', '→', '↑', '↓'], description: 'Move selected item' },
        { keys: ['['], description: 'Rotate item counter-clockwise' },
        { keys: [']'], description: 'Rotate item clockwise' },
        { keys: ['L'], description: 'Lock/unlock selected item' },
      ]
    },
  ];

  return (
    <div className="shortcuts-overlay" onClick={() => setIsVisible(false)}>
      <div className="shortcuts-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>⌨️ Keyboard Shortcuts</h2>
          <button className="close-btn" onClick={() => setIsVisible(false)}>×</button>
        </div>
        <div className="shortcuts-content">
          {shortcuts.map((section, idx) => (
            <div key={idx} className="shortcuts-section">
              <h3 className="shortcuts-category">{section.category}</h3>
              <div className="shortcuts-list">
                {section.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="shortcut-item">
                    <div className="shortcut-keys">
                      {item.keys.map((key, keyIdx) => (
                        <React.Fragment key={keyIdx}>
                          <kbd className="key">{key}</kbd>
                          {keyIdx < item.keys.length - 1 && (
                            <span className="key-separator">+</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                    <div className="shortcut-description">{item.description}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="shortcuts-footer">
          Press <kbd className="key">?</kbd> or <kbd className="key">F1</kbd> to toggle this help
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsHelp;
