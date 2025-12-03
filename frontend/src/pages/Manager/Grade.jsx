import React, { useState, useEffect } from 'react';
import './Grade.css';

function Grade({ pemp_id, pskill_id, pgrade, onGradeChange, isChangable = false }) {
  const [clickedIndex, setClickedIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    setClickedIndex(pgrade);
  }, [pgrade]);

  const handleHover = (index) => setHoveredIndex(index);
  const handleMouseLeave = () => setHoveredIndex(null);

  const handleClick = (index) => {
    if (isChangable) {
      setClickedIndex(index);
      if (typeof onGradeChange === 'function') {
        onGradeChange(pemp_id, pskill_id, index);
      } else {
        console.warn('onGradeChange is not a function or undefined');
      }
    }
  };

  return (
    <div
      className="cell-container"
      style={{
        cursor: isChangable ? 'pointer' : 'not-allowed',
      }}
    >
      <div className="matrix">
        {[1, 2, 3, 4].map((cellIndex) => (
          <div
            key={cellIndex}
            className={`cell
              ${clickedIndex !== null && cellIndex <= clickedIndex ? 'clicked' : ''}
              ${hoveredIndex !== null && cellIndex <= hoveredIndex ? 'hovered' : ''}`}
            onMouseEnter={isChangable ? () => handleHover(cellIndex) : undefined}
            onMouseLeave={isChangable ? handleMouseLeave : undefined}
            onClick={isChangable ? () => handleClick(cellIndex) : undefined}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default Grade;
