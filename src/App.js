import React, { useState } from 'react';
import DrawingCanvas from './components/DrawingCanvas';
import Toolbar from './components/Toolbar';
import './App.css';

function App() {
  const [currentTool, setCurrentTool] = useState('pen');
  const [strokeWidth, setStrokeWidth] = useState(3);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const handleToolChange = (tool) => {
    setCurrentTool(tool);
  };

  const handleStrokeWidthChange = (width) => {
    setStrokeWidth(width);
  };

  const handleColorChange = (color) => {
    setStrokeColor(color);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    } else if (historyIndex === 0) {
      setHistoryIndex(-1); // Clear canvas
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleHistoryUpdate = (newHistory) => {
    // Only update history if it's different from current state
    if (JSON.stringify(newHistory) !== JSON.stringify(history[historyIndex] || [])) {
      const newHistoryArray = history.slice(0, historyIndex + 1);
      newHistoryArray.push([...newHistory]);
      setHistory(newHistoryArray);
      setHistoryIndex(newHistoryArray.length - 1);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tutorify</h1>
      </header>
      <div className="main-layout">
        <aside className="toolbar-section">
          <Toolbar
            currentTool={currentTool}
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            onToolChange={handleToolChange}
            onStrokeWidthChange={handleStrokeWidthChange}
            onColorChange={handleColorChange}
            onUndo={handleUndo}
            onRedo={handleRedo}
            canUndo={historyIndex >= 0}
            canRedo={historyIndex < history.length - 1}
          />
        </aside>
        <main className="canvas-section">
          <DrawingCanvas
            currentTool={currentTool}
            strokeWidth={strokeWidth}
            strokeColor={strokeColor}
            history={history}
            historyIndex={historyIndex}
            onHistoryUpdate={handleHistoryUpdate}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
