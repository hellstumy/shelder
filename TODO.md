# Bunker Game Bug Fixes - Voting System

## Critical Bugs to Fix

### 1. PlayerCard Voting Logic
- [ ] Fix status check: use `player.status !== "alive"` instead of `!player.status`
- [ ] Improve self-voting prevention
- [ ] Fix alreadyVoted check logic
- [ ] Add proper error handling for voting attempts

### 2. Backend Voting Processing
- [ ] Fix game end condition check in voting-end handler
- [ ] Ensure proper round increment and vote reset
- [ ] Add validation for voting state transitions
- [ ] Fix winner detection logic

### 3. Game State Management
- [ ] Add revealed attributes reset on new round
- [ ] Fix useEffect dependency for intervalId
- [ ] Improve timer cleanup

### 4. Additional Fixes
- [ ] Fix vite.config.js __dirname issue
- [ ] Fix StartGameInputs roomCode bug
- [ ] Remove duplicate gameUtils function
