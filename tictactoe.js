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
let gameState  = { board: Array(9).fill(''), turn: 'X' };
const cells         = Array.from(document.querySelectorAll('#board td'));
const controlButton = document.getElementById('controlButton');

// render board & highlight win
function render() {
  cells.forEach((c,i) => {
    c.textContent = gameState.board[i]||'';
    c.classList.remove('win');
  });
  const res = checkWin(gameState.board);
  if (res) {
    res.combo.forEach(i=>cells[i].classList.add('win'));
  }
}

// read from JSON file
async function loadState() {
  const f = await fileHandle.getFile();
  gameState = JSON.parse(await f.text());
  render();
}

// write to JSON file
async function saveState() {
  const w = await fileHandle.createWritable();
  await w.write(JSON.stringify(gameState, null, 2));
  await w.close();
}

// first‐click on “Start” will init file; subsequent will reset game
controlButton.addEventListener('click', async () => {
  // 1) if we don’t yet have a file handle, grab one now
  if (!fileHandle) {
    try {
      [fileHandle] = await window.showOpenFilePicker({
        types: [{ description: 'TicTacToe JSON', accept: { 'application/json': ['.json'] } }],
        multiple: false
      });
    } catch {
      fileHandle = await window.showSaveFilePicker({
        suggestedName: 'gamestate.json',
        types: [{ description: 'TicTacToe JSON', accept: { 'application/json': ['.json'] } }]
      });
      await saveState();  // write default
    }
    await loadState();
    controlButton.textContent = 'Reset';
    return;
  }

  // 2) if file is open, this click is a “Reset”
  gameState = { board: Array(9).fill(''), turn: 'X' };
  await saveState();
  await loadState();
});

// only allow clicks *after* the file is open
cells.forEach(cell => {
  cell.addEventListener('click', async () => {
    if (!fileHandle) return;                // guard
    const idx = +cell.dataset.cell;
    if (checkWin(gameState.board)) return;  // no moves after win
    gameState = applyMove(gameState, idx);
    await saveState();
    await loadState();
  });
});