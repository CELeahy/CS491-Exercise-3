/**
 * Author: Canon Leahy
 * Date: June 28, 2025
 * Tic-Tac-Toe
 */

/**
 * Check the board for a winning combination.
 * @param {Array<string>} board - Array of 9 cells: 'X', 'O', or ''.
 * @returns {{winner: string, combo: number[]} | null} Returns the winner & winning indices or null.
 */
function checkWin(board) {
  const wins = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (const combo of wins) {
    const [a, b, c] = combo;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], combo };
    }
  }
  return null;
}

/**
 * Determine computer moves.
 * win, block, otherwise picks random empty cell.
 * @param {Array<string>} board - Current state.
 * @returns {number} Index (0-8) of a move.
 */
function nextMove(board) {
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'O';
      if (checkWin(board)) { board[i] = ''; return i; }
      board[i] = '';
    }
  }
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'X';
      if (checkWin(board)) { board[i] = ''; return i; }
      board[i] = '';
    }
  }
  const empties = board.map((v, i) => v ? null : i).filter(i => i !== null);
  return empties[Math.floor(Math.random() * empties.length)];
}

const cells = Array.from(document.querySelectorAll('#board td'));
const controlButton = document.getElementById('controlButton');
let boardState = Array(9).fill('');
let gameActive = false;
let firstMover = null;

function render() {
  cells.forEach((cell, i) => {
    cell.textContent = boardState[i] || '';
    cell.classList.remove('win');
  });
  const result = checkWin(boardState);
  if (result) {
    result.combo.forEach(i => cells[i].classList.add('win'));
    gameActive = false;
  }
}

function placeRandom(board, mark, count) {
  const empties = board.map((v, i) => v ? null : i).filter(i => i !== null);
  for (let k = 0; k < count; k++) {
    const idx = empties.splice(Math.floor(Math.random() * empties.length), 1)[0];
    board[idx] = mark;
  }
}

function initGame() {
  boardState.fill('');
  gameActive = true;
  controlButton.textContent = 'Clear';
  controlButton.disabled = true;

  if (firstMover === 'human') {
    placeRandom(boardState, 'X', 2);
    const comp = nextMove(boardState);
    if (comp != null) boardState[comp] = 'O';
  } else {
    placeRandom(boardState, 'O', 2);
  }
  render();
}

cells.forEach(cell => cell.addEventListener('click', () => {
  const i = +cell.dataset.cell;
  if (!gameActive) {
    if (!firstMover) {
      firstMover = 'human';
      initGame();
    }
    return;
  }
  if (!boardState[i]) {
    boardState[i] = 'X'; render();
    controlButton.disabled = false;
    if (gameActive) {
      const comp = nextMove(boardState);
      if (comp != null) boardState[comp] = 'O';
      render();
    }
  }
}));

controlButton.addEventListener('click', () => {
  if (!firstMover) {
    firstMover = 'computer';
    initGame();
  } else {
    boardState.fill('');
    gameActive = false;
    firstMover = null;
    render();
    controlButton.textContent = 'Start';
    controlButton.disabled = false;
  }
});
