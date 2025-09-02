import React from 'react';
import './Toolbar.css';

const Toolbar = ({
  currentTool,
  strokeWidth,
  strokeColor,
  onToolChange,
  onStrokeWidthChange,
  onColorChange,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) => {
  const tools = [
    { id: 'pen', name: 'Pen', icon: '✏️' },
    { id: 'eraser', name: 'Eraser', icon: '🧹' },
    { id: 'text', name: 'Text', icon: '📝' },
    { id: 'shape-rectangle', name: 'Rectangle', icon: '⬜' },
    { id: 'shape-circle', name: 'Circle', icon: '⭕' },
    { id: 'shape-arrow', name: 'Arrow', icon: '➡️' }
  ];

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500',
    '#800080', '#008000', '#FFC0CB', '#A52A2A'
  ];

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Tools</h3>
        <div className="tool-buttons-grid">
          {tools.map((tool, idx) => (
            <button
              key={tool.id}
              className={`tool-button ${currentTool === tool.id ? 'active' : ''}`}
              onClick={() => onToolChange(tool.id)}
              title={tool.name}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-name">{tool.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Stroke Width</h3>
        <div className="stroke-width-controls">
          <button 
            className="width-button"
            onClick={() => onStrokeWidthChange(Math.max(1, strokeWidth - 1))}
            disabled={strokeWidth <= 1}
          >
            -
          </button>
          <span className="width-display">{strokeWidth}px</span>
          <button 
            className="width-button"
            onClick={() => onStrokeWidthChange(Math.min(20, strokeWidth + 1))}
            disabled={strokeWidth >= 20}
          >
            +
          </button>
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Colors</h3>
        <div className="color-palette">
          {colors.map(color => (
            <button
              key={color}
              className={`color-button ${strokeColor === color ? 'active' : ''}`}
              style={{ backgroundColor: color }}
              onClick={() => onColorChange(color)}
              title={color}
            />
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Actions</h3>
        <div className="action-buttons">
          <button
            className="action-button undo"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            ↶ Undo
          </button>
          <button
            className="action-button redo"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          >
            ↷ Redo
          </button>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;
