import React, { useRef, useEffect, useState, useCallback } from 'react';
import './DrawingCanvas.css';

const DrawingCanvas = ({ 
  currentTool, 
  strokeWidth, 
  strokeColor, 
  history, 
  historyIndex, 
  onHistoryUpdate 
}) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [shapes, setShapes] = useState([]);




  const [isTextMode, setIsTextMode] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState(null);

  // Draw arrow shape
  const drawArrow = useCallback((ctx, shape) => {
    const { x, y, width, height } = shape;
    const centerY = y + height / 2;
    
    ctx.beginPath();
    // Arrow line
    ctx.moveTo(x, centerY);
    ctx.lineTo(x + width * 0.7, centerY);
    
    // Arrow head
    const arrowSize = Math.min(width, height) * 0.2;
    ctx.lineTo(x + width * 0.7 - arrowSize, centerY - arrowSize);
    ctx.moveTo(x + width * 0.7, centerY);
    ctx.lineTo(x + width * 0.7 - arrowSize, centerY + arrowSize);
    
    ctx.stroke();
  }, []);

  // Draw individual shape
  const drawShape = useCallback((ctx, shape) => {
    ctx.save();
    ctx.strokeStyle = shape.color;
    ctx.fillStyle = shape.fillColor || 'transparent';
    ctx.lineWidth = shape.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (shape.type === 'pen') {
      ctx.beginPath();
      ctx.moveTo(shape.points[0].x, shape.points[0].y);
      for (let i = 1; i < shape.points.length; i++) {
        ctx.lineTo(shape.points[i].x, shape.points[i].y);
      }
      ctx.stroke();
    } else if (shape.type === 'text') {
      ctx.fillStyle = shape.color;
      ctx.font = `${shape.fontSize || 16}px Arial`;
      ctx.fillText(shape.text, shape.x, shape.y);
    } else {
      // Apply rotation for shapes
      if (shape.rotation) {
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((shape.rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
      }

      if (shape.type === 'rectangle') {
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
        if (shape.fillColor && shape.fillColor !== 'transparent') {
          ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
        }
      } else if (shape.type === 'circle') {
        ctx.beginPath();
        ctx.arc(shape.x + shape.width/2, shape.y + shape.height/2, Math.min(shape.width, shape.height)/2, 0, 2 * Math.PI);
        ctx.stroke();
        if (shape.fillColor && shape.fillColor !== 'transparent') {
          ctx.fill();
        }
      } else if (shape.type === 'arrow') {
        drawArrow(ctx, shape);
      }
    }
    
    ctx.restore();
  }, [drawArrow]);

  // Redraw canvas with current state
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all shapes
    shapes.forEach(shape => {
      drawShape(ctx, shape);
    });
    

    

  }, [shapes, drawShape]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    
    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Redraw everything
      redrawCanvas();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawCanvas]);





  // Get mouse position relative to canvas
  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };







  // Mouse event handlers
  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    setIsDrawing(true);

    if (currentTool === 'pen') {
      const newShape = {
        id: Date.now(),
        type: 'pen',
        points: [pos],
        color: strokeColor,
        strokeWidth: strokeWidth
      };
      setShapes(prev => [...prev, newShape]);
    } else if (currentTool === 'eraser') {
      // Erase shapes at this position - simple point-based erasing
      setShapes(prev => prev.filter(shape => {
        if (shape.type === 'pen') {
          // For pen strokes, check if point is near any line segment
          for (let i = 0; i < shape.points.length - 1; i++) {
            const p1 = shape.points[i];
            const p2 = shape.points[i + 1];
            const distance = Math.sqrt(
              Math.pow(pos.x - p1.x, 2) + Math.pow(pos.y - p1.y, 2)
            );
            if (distance < shape.strokeWidth + 10) {
              return false; // Remove this shape
            }
          }
          return true; // Keep this shape
        } else {
          // For other shapes, check if point is inside bounding box
          return !(pos.x >= shape.x && pos.x <= shape.x + shape.width &&
                   pos.y >= shape.y && pos.y <= shape.y + shape.height);
        }
      }));
    } else if (currentTool === 'text') {
      // Start text input mode
      setIsTextMode(true);
      setTextPosition(pos);
      setTextInput('');
    } else if (currentTool.startsWith('shape-')) {
      // Start drawing a shape
      const shapeType = currentTool.replace('shape-', '');
      const newShape = {
        id: Date.now(),
        type: shapeType,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color: strokeColor,
        strokeWidth: strokeWidth,
        fillColor: 'transparent'
      };
      setShapes(prev => [...prev, newShape]);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDrawing) return;

    const pos = getMousePos(e);

    if (currentTool === 'pen') {
      setShapes(prev => {
        const newShapes = [...prev];
        const lastShape = newShapes[newShapes.length - 1];
        if (lastShape && lastShape.type === 'pen') {
          lastShape.points.push(pos);
        }
        return newShapes;
      });
    } else if (currentTool.startsWith('shape-')) {
      setShapes(prev => {
        const newShapes = [...prev];
        const lastShape = newShapes[newShapes.length - 1];
        if (lastShape && lastShape.type === currentTool.replace('shape-', '')) {
          lastShape.width = pos.x - lastShape.x;
          lastShape.height = pos.y - lastShape.y;
        }
        return newShapes;
      });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    
    // Update history after any change
    if (shapes.length > 0) {
      onHistoryUpdate([...shapes]);
    }
  };

  const handleMouseLeave = () => {
    // Stop all interactions when mouse leaves canvas
    setIsDrawing(false);
  };

  // Handle text input completion
  const handleTextSubmit = useCallback(() => {
    if (textInput.trim() && textPosition) {
      const newTextShape = {
        id: Date.now(),
        type: 'text',
        text: textInput,
        x: textPosition.x,
        y: textPosition.y,
        color: strokeColor,
        fontSize: strokeWidth * 4 + 8 // Scale font size with stroke width
      };
      setShapes(prev => [...prev, newTextShape]);
      onHistoryUpdate([...shapes, newTextShape]);
    }
    setIsTextMode(false);
    setTextInput('');
    setTextPosition(null);
  }, [textInput, textPosition, strokeColor, strokeWidth, shapes, onHistoryUpdate]);

  // Handle text input cancellation
  const handleTextCancel = useCallback(() => {
    setIsTextMode(false);
    setTextInput('');
    setTextPosition(null);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isTextMode) {
        if (e.key === 'Enter') {
          handleTextSubmit();
        } else if (e.key === 'Escape') {
          handleTextCancel();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTextMode, handleTextSubmit, handleTextCancel]);

  // Update shapes when history changes (for undo/redo)
  useEffect(() => {
    if (historyIndex === -1) {
      setShapes([]); // Clear canvas
    } else if (history && history[historyIndex]) {
      setShapes([...history[historyIndex]]);
    }
  }, [history, historyIndex]);

  // Redraw when shapes change
  useEffect(() => {
    redrawCanvas();
  }, [shapes, redrawCanvas]);



  // Get cursor class based on current tool and state
  const getCursorClass = () => {
    if (currentTool === 'pen') return 'pen-cursor';
    if (currentTool === 'eraser') return 'eraser-cursor';
    if (currentTool === 'text') return 'text-cursor';
    if (currentTool.startsWith('shape-')) return 'shape-cursor';
    return 'select-cursor';
  };

  return (
    <div className="drawing-canvas-container">
      <canvas
        ref={canvasRef}
        className={`drawing-canvas ${getCursorClass()}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
      />
      
      {/* Text input overlay */}
      {isTextMode && textPosition && (
        <div
          className="text-input-overlay"
          style={{
            position: 'absolute',
            left: textPosition.x + 160,
            top: textPosition.y + 100,
            zIndex: 1000
          }}
        >
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleTextSubmit();
              } else if (e.key === 'Escape') {
                handleTextCancel();
              }
            }}
            placeholder="Enter text..."
            autoFocus
            style={{
              width: '150px',
              height: '40px',
              border: '2px solid #007bff',
              borderRadius: '4px',
              padding: '4px 8px',
              fontSize: `${strokeWidth * 4 + 8}px`,
              color: strokeColor,
              backgroundColor: 'white',
              outline: 'none',
              zIndex: 1001
            }}
          />
          <div className="text-input-buttons">
            <button onClick={handleTextSubmit} className="text-submit-btn">✓</button>
            <button onClick={handleTextCancel} className="text-cancel-btn">✗</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;
