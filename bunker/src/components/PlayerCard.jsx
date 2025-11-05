import heart from '../assets/heart.svg'
import heartbroken from '../assets/heart-broken.svg'
import ability from '../assets/ability.svg'
import age from '../assets/age.svg'
import box from '../assets/box.svg'
import body from '../assets/body.svg'
import backpack from '../assets/backpack.svg'
import character from '../assets/character.svg'
import gender from '../assets/gender.svg'
import health from '../assets/health.svg'
import hobby from '../assets/hobby.svg'
import scary from '../assets/scary.svg'


import {sendVote, sendReveal} from '../api/api.js'
import useStore from '../tools/store.js';
import React from 'react';

export default function PlayerCard({ player, voteState, voteProgress, revealedAttributes }) {
  const {roomCode, playerName} = useStore();
  const target = player.name;
  const alreadyVoted = voteProgress && Object.prototype.hasOwnProperty.call(voteProgress, playerName);

  const vote = (e) => {
    // Only allow voting during voting state, only alive players, and not self
    if (voteState !== "voting") return;
    if (player.status !== "alive") return;
    if (!playerName) return console.warn("Current player name not set");
    if (playerName === target) return console.warn("You cannot vote for yourself");
    if (alreadyVoted) return console.warn("You already voted this round");

    sendVote(roomCode, playerName, target);
    console.log(`Voted for player ${player.name} by ${playerName}`);
    // visually mark the vote button only
    if (e && e.currentTarget) e.currentTarget.classList.add("vote");
  };
  // helper to render an attribute cell; if revealed show value, otherwise show placeholder and make clickable
  const renderAttr = (attrKey, icon, label) => {
  const revealedForTarget = revealedAttributes && revealedAttributes[target] && revealedAttributes[target][attrKey];
  const isSelf = target === playerName;
  const display = isSelf ? player[attrKey] : revealedForTarget ? revealedForTarget.value : "— скрыто —";

    const handleReveal = (e) => {
      e.stopPropagation();
      // Only the owner may reveal their own attribute to everyone
      if (!isSelf) return;
      // Only allow if requester set and alive
      if (!playerName) return console.warn('No current player name');
      if ((player.status || 'alive') !== 'alive') return; // dead players can't reveal
      // If already revealed, nothing
      if (revealedForTarget) return;
      // send reveal request to server (requester === target)
      sendReveal(roomCode, playerName, target, attrKey);
    };

    return (
      <li style={{ cursor: isSelf || revealedForTarget ? 'default' : 'default' }} title={revealedForTarget ? `Показано ${revealedForTarget.revealedBy}` : isSelf ? 'Нажмите кнопку "Показать всем" чтобы открыть это поле' : '—'}>
        <img src={icon} alt="" /> {label}: {display}
        {/* If it's the owner's card and attribute not yet revealed, show tiny reveal button */}
        {isSelf && !revealedForTarget ? (
          <button
            onClick={handleReveal}
            style={{ marginLeft: 8, padding: '2px 6px', fontSize: 11, borderRadius: 4 }}
            title="Показать всем"
          >
            Показать всем
          </button>
        ) : null}
      </li>
    );
  };

  return (
    <div className="player-card">
      <div className="player-main">
        <p className="p-main">{player.name}</p>
        <img src={(player.status || "alive") === "alive" ? heart : heartbroken} alt="heart" />
        <p className="p-main">{player.profession}</p>
        <button
          onClick={vote}
          title="Vote"
          style={{
            marginLeft: 8,
            padding: '4px 8px',
            fontSize: 12,
            borderRadius: 4,
            cursor: 'pointer'
          }}
          className="vote-btn"
        >
          Голос
        </button>
      </div>
      <span className="line"></span>
      <ul className="abilitys">
        {renderAttr('gender', gender, 'Пол')}
        {renderAttr('age', age, 'Возраст')}
        {renderAttr('body', body, 'Телосложение')}
        {renderAttr('trait', character, 'Черта')}
        {renderAttr('health', health, 'Здоровье')}
        {renderAttr('hobby', hobby, 'Хобби')}
        {renderAttr('phobia', scary, 'Фобия')}
        {renderAttr('inventory', box, 'Инвентарь')}
        {renderAttr('backpack', backpack, 'Рюкзак')}
        {renderAttr('ability', ability, 'Умение')}
      </ul>
    </div>
  );
}
