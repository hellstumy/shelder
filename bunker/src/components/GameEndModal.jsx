import React from 'react';
import '../styles/Modal.css';

const GameEndModal = ({ isOpen, winners, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Игра окончена!</h2>
        
        <section className="winners-section">
          <h3>Выжившие:</h3>
          <div className="winners-list">
            {winners.map((player) => (
              <div key={player.id} className="winner-card">
                <h4>{player.name}</h4>
                <p>Профессия: {player.profession}</p>
                <p>Статус: {player.status}</p>
              </div>
            ))}
          </div>
        </section>

        <button className="modal-close-btn" onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default GameEndModal;