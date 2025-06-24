import React from 'react';

const ArrowButton = ({ onClick, className = '' }) => {
  return (
    <div className={`arrow-button ${className}`} onClick={onClick}>
      <div className="arrow">↓</div>

      <style jsx>{`
        .arrow-button {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 10000;
          cursor: pointer;
          transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
          filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
        }

        .arrow-button:hover {
          transform: translateX(-50%) translateY(5px);
        }

        .arrow {
          font-size: 32px;
          color: #333;
          padding: 10px;
          border-radius: 50%;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          animation: bounce 2s infinite;
        }

        .arrow-button:hover .arrow {
          color: #0070f3;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .arrow-button {
            transition: none;
          }
          .arrow-button:hover {
            transform: translateX(-50%);
          }
          .arrow {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ArrowButton; 