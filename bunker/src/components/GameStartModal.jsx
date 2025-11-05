import React from 'react';
import '../styles/Modal.css';

const GameStartModal = ({ isOpen, onClose, gameData }) => {
  if (!isOpen || !gameData) return null;

  const {
    apocalypseScenario,
    bunkerDescription,
    supplies,
    requiredSurvivors
  } = gameData;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Добро пожаловать в игру "Бункер"!</h2>
        
        <section className="scenario-section">
          <h3>Сценарий апокалипсиса:</h3>
          <p>{apocalypseScenario.description}</p>
        </section>

        <section className="bunker-section">
          <h3>Ваш бункер:</h3>
          <p>{bunkerDescription.description}</p>
          <div className="bunker-features">
            <h4>Особенности бункера:</h4>
            <ul>
              {bunkerDescription.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
          </div>
        </section>

        <section className="supplies-section">
          <h3>Запасы в бункере:</h3>
          <ul>
            {supplies.map((supply) => (
              <li key={supply.id}>
                {supply.name}: {supply.quantity} {supply.unit}
              </li>
            ))}
          </ul>
        </section>

        <section className="survivors-section">
          <h3>Условия выживания:</h3>
          <p>В бункере должно остаться {requiredSurvivors} выживших.</p>
        </section>

        <button className="modal-close-btn" onClick={onClose}>
          Начать игру
        </button>
      </div>
    </div>
  );
};

export default GameStartModal;