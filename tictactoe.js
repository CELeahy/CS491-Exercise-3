/**
 * Author: Canon Leahy
 * Date: June 28, 2025
 * Tic-Tac-Toe with shared JSON state
 */

/**
 * Check the board for a winning combination.
 * @param {Array<string>} board - Array of 9 cells: 'X', 'O', or ''.
 * @returns {{winner: string, combo: number[]} | null}
 *    Returns the winner & winning indices, or null if no win yet.
 */
function checkWin(board) {
  const wins = [
    [0,1,2], [3,4,5], [6,7,8],
    [0,3,6], [1,4,7], [2,5,8],
    [0,4,8], [2,4,6]
  ];
  for (const combo of wins) {
    const [a,b,c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  return null;
}

/**
 * Apply a move into the game state.
 * @param {Object} state - { board: string[9], turn: 'X'|'O' } 
 * @param {number} idx - Cell index 0–8.
 * @returns {Object} New state (immutably): { board, turn }.
 */
function applyMove(state, idx) {
  if (state.board[idx] || checkWin(state.board)) return state;
  const newBoard = state.board.slice();
  newBoard[idx] = state.turn;
  return {
    board: newBoard,
    turn: state.turn === 'X' ? 'O' : 'X'
  };
}

/* UI */
let fileHandle = null;
let gameState = { board: Array(9).fill(''), turn: 'X' };
const cells = Array.from(document.querySelectorAll('#board td'));
const controlButton = document.getElementById('controlButton');

// render board & win highlights
function render() {
  cells.forEach((cell,i) => {
    cell.textContent = gameState.board[i] || '';
    cell.classList.toggle('win', false);
  });
  const result = checkWin(gameState.board);
  if (result) {
    result.combo.forEach(i => cells[i].classList.add('win'));
    controlButton.disabled = true;
  }
}

// load JSON state from file
async function loadState() {
  if (!fileHandle) return;
  const file = await fileHandle.getFile();
  const txt = await file.text();
  gameState = JSON.parse(txt);
  render();
}

// write JSON state to file
async function saveState() {
  if (!fileHandle) return;
  const writable = await fileHandle.createWritable();
  await writable.write(JSON.stringify(gameState, null, 2));
  await writable.close();
}

// ask user to pick or create the gamestate.json
async function initFile() {
  [fileHandle] = await window.showOpenFilePicker({
    types: [{
      description: 'TicTacToe JSON',
      accept: { 'application/json': ['.json'] }
    }],
    multiple: false
  }).catch(async () => {
    // on cancel, create new
    fileHandle = await window.showSaveFilePicker({
      suggestedName: 'gamestate.json',
      types: [{
        description: 'TicTacToe JSON',
        accept: { 'application/json': ['.json'] }
      }]
    });
    // initialize with default
    await saveState();
  });
  await loadState();
}

// handle a user click on a cell
cells.forEach(cell => cell.addEventListener('click', async () => {
  const idx = +cell.dataset.cell;
  if (checkWin(gameState.board)) return;
  gameState = applyMove(gameState, idx);
  await saveState();
  await loadState();
}));

// Start/Clear button to reset game
controlButton.addEventListener('click', async () => {
  gameState = { board: Array(9).fill(''), turn: 'X' };
  await saveState();
  await loadState();
});

// on page load, open or create the JSON file
window.addEventListener('DOMContentLoaded', () => {
  initFile();
});
