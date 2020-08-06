/* CONNECT FOUR
- Game takes two players who will alternate turns.
- Player 1 will be red and Player 2 will be blue.
- On each turn, the player will click on the game board
where they want to drop their piece.
- A player wins by getting four-in-a row (horizontally, vertically or diagonally).
- The game ends when a player wins or the board is full and the game is a draw.
*/
"use strict"
// Player 1 starts game
let player = 1;
// STORE PLAYER PIECE PLACEMENT FOR WIN CHECK
let playerPlacements = [];
 // STORE COUNT FOR DRAW CHECK
let selectedCount = 1;

// RENDER GAME
function createBoard() {
  // Create header
  const header = document.createElement('h1');
  header.innerText = 'CONNECT 4';
  // Create header to display current player and game status
  const gameStatus = document.createElement('h3');
  gameStatus.innerText = `Player 1`;
  // Create board 
  const container = document.getElementById('container');
  const table = document.createElement('table');
  table.setAttribute('id', 'gameboard');
  // Create board slots: 6 X 7 (H x W)
  for (let r = 0; r < 6; r++) { // 6-rows of squares
    const row = document.createElement('tr');
      row.setAttribute('id', `${r}`);
     // Create player placement array and match rows and cells 
     playerPlacements.push(Array.from({ length: 7}));  
    for (let c = 0; c < 7; c++) { // 7-columns of squares 
      let slot = document.createElement('td');
      slot.classList.add('slot');
      slot.setAttribute('id', `${c}`)
      slot.addEventListener('click', play);
      row.append(slot);
    }
    table.append(row);
  }
  // Create reset button
  const reset = document.createElement('button');
  reset.addEventListener('click', reloadPage);
  reset.innerText = "PLAY AGAIN";
// Append header, game status, board and play again button to container
container.append(header, gameStatus, table, reset);
}

// PLAY 
function play(e) {
  let selectedRow = +e.target.parentElement.id;
  let selectedCol = +e.target.id;
//   console.log(`Col: ${selectedCol}`)
//   console.log(`Row: ${selectedRow}`);
  let tableRows = document.getElementsByTagName('tr');
  let tableCells = document.getElementsByTagName('td');
  // console.log(tableCells[selectedCol]);
  // console.log(player);
  // Check selected column for empty space starting from bottom row
  for(var i = 5; i >= 0; i--) { 
    let selected = tableRows[i].children[selectedCol];
    if (!selected.classList.contains('selected')) { 
      // Add player number to player placement array
      playerPlacements[i][selectedCol] = player;
      // Check for win  
      if (checkForWin()) {
        document.getElementsByTagName('h3')[0].innerText = `PLAYER ${player} WINS!`;
        return;
      } 
      // Check for draw (total slots 42)
      if (selectedCount > 41) {
        document.getElementsByTagName('h3')[0].innerText = `DRAW!`;
        return;
      }
      if(player === 1) {
        selected.style.backgroundColor = 'red';
        document.getElementsByTagName('h3')[0].innerText = 'Player 1';   
        player = 2;
      } else {
        document.getElementsByTagName('h3')[0].innerText = 'Player 2';         
        selected.style.backgroundColor = '#323e49';
        player = 1;
      }
      selected.classList.add('selected');
      selectedCount += 1;
      return;
    } 
  }
}

// CHECK FOR WIN
function checkForWin() {
  function _win(slots) {
    // Check player placement array for four in a row of the same player numbers and within range
    return slots.every(([r,c]) =>
      r >= 0 && 
      r < 6 && 
      c >= 0 && 
      c < 7 &&
      playerPlacements[r][c] === player
    );
  } 
  // Iterate through all slots to test winning positions
  for(let r = 5; r >= 0; r--) { // 6-rows 
    for(let c = 0; c < 7; c++) { // 7-columns
      const horizontal = [[r,c], [r, c + 1], [r, c + 2], [r, c + 3]];
      const vertical = [[r,c], [r + 1, c], [r + 2, c], [r + 3, c]];
      const diagDownLeft = [[r,c], [r + 1, c + 1], [r + 2, c + 2], [r + 3, c + 3]]; 
      const diagDownRight = [[r,c], [r + 1, c - 1], [r + 2, c - 2], [r + 3, c - 3]];         
//       // return winner (checking each win possibility only as needed)
      if (_win(horizontal) || _win(vertical) || _win(diagDownLeft) || _win(diagDownRight)) {
        return true;
      }
    }  
  }
}

// RESET GAME 
function reloadPage() {
  location.reload();
}

createBoard();