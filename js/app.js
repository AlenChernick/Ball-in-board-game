'use strict';
var WALL = 'WALL';
var FLOOR = 'FLOOR';
var BALL = 'BALL';
var GAMER = 'GAMER';
var GLUE = 'GLUE';

var GAMER_IMG = '<img src="img/gamer.png" />';
var GAMERG_IMG = '<img src="img/gamer-purple.png" />';
var BALL_IMG = '<img src="img/ball.png" />';
var GLUE_IMG = '<img src="img/candy.png" />';

var gStartedBalls = 2;
var gStartedGlues = 1;
var gRandomBall;
var gRandomGlue;
var gBall = 0;
var gBoard;
var gGamerPos;
var gIsGluent = false;

function initGame() {
  gGamerPos = { i: 2, j: 9 };
  gBoard = buildBoard();
  renderBoard(gBoard);
  gRandomBall = setInterval(placeRandomBall, 2500);
  gRandomGlue = setInterval(placeRandomGlue, 5000);
}

function placeRandomBall() {
  //TODO GET EMPTY CELLS
  var iIdx = rand(1, 9);
  var jIdx = rand(1, 11);
  if (gBoard[iIdx][jIdx].gameElement !== null) return;

  var ballPos = { i: iIdx, j: jIdx };
  gBoard[iIdx][jIdx].gameElement = BALL;
  gStartedBalls++;
  renderCell(ballPos, BALL_IMG);
}

function placeRandomGlue() {
  var iIdx = rand(1, 9);
  var jIdx = rand(1, 11);
  if (gBoard[iIdx][jIdx].gameElement !== null) return;

  var gluePos = { i: iIdx, j: jIdx };
  gBoard[iIdx][jIdx].gameElement = GLUE;
  gStartedGlues++;
  renderCell(gluePos, GLUE_IMG);
  setTimeout(removeGlue, 3000, iIdx, jIdx);
  setTimeout(() => {}, 3000);
}

function removeGlue(iIdx, jIdx) {
  if (gBoard[iIdx][jIdx].gameElement !== GLUE) return;
  gBoard[iIdx][jIdx].gameElement = null;

  var gluePos = { i: iIdx, j: jIdx };
  renderCell(gluePos, '');
}

function buildBoard() {
  // Create the Matrix
  var board = createMat(10, 12);

  // Put FLOOR everywhere and WALL at edges
  for (var i = 0; i < board.length; i++) {
    for (var j = 0; j < board[0].length; j++) {
      // Put FLOOR in a regular cell
      var cell = { type: FLOOR, gameElement: null };

      // Place Walls at edges
      if (
        (i === 0 && j !== board.length / 2) ||
        (i === board.length - 1 && j !== board.length / 2) ||
        (j === 0 && i !== board.length / 2) ||
        (j === board[0].length - 1 && i !== board.length / 2)
      ) {
        cell.type = WALL;
      }

      // Add created cell to The game board
      board[i][j] = cell;
    }
  }

  // Place the gamer at selected position
  board[gGamerPos.i][gGamerPos.j].gameElement = GAMER;

  // Place the Balls (currently randomly chosen positions)
  board[3][8].gameElement = BALL;
  board[2][7].gameElement = BALL;

  // Place the Glue (just for testing)
  board[rand(5, 9)][rand(3, 11)].gameElement = GLUE;

  // console.log(board);
  return board;
}

// Render the board to an HTML table
function renderBoard(board) {
  var strHTML = '';
  for (var i = 0; i < board.length; i++) {
    strHTML += '<tr>\n';
    for (var j = 0; j < board[0].length; j++) {
      var currCell = board[i][j];

      var cellClass = getClassName({ i: i, j: j });

      // TODO - change to short if statement
      if (currCell.type === FLOOR) cellClass += ' floor';
      else if (currCell.type === WALL) cellClass += ' wall';

      //TODO - Change To template string
      strHTML += '\t<td class="cell ' + cellClass + '"  onclick="moveTo(' + i + ',' + j + ')" >\n';

      // TODO - change to switch case statement
      if (currCell.gameElement === GAMER) {
        strHTML += GAMER_IMG;
      } else if (currCell.gameElement === BALL) {
        strHTML += BALL_IMG;
      } else if (currCell.gameElement === GLUE) {
        strHTML += GLUE_IMG;
      }

      strHTML += '\t</td>\n';
    }
    strHTML += '</tr>\n';
  }

  // console.log('strHTML is:');
  var elBoard = document.querySelector('.board');
  elBoard.innerHTML = strHTML;
}

// Move the player to a specific location
function moveTo(i, j) {
  var targetCell = gBoard[i][j];
  if (targetCell.type === WALL) return;
  if (gIsGluent) return;

  // Calculate distance to make sure we are moving to a neighbor cell
  var iAbsDiff = Math.abs(i - gGamerPos.i);
  var jAbsDiff = Math.abs(j - gGamerPos.j);
  // console.log(iAbsDiff);
  // console.log(jAbsDiff);

  // If the clicked Cell is one of the four allowed
  if (
    (iAbsDiff === 1 && jAbsDiff === 0) ||
    (jAbsDiff === 1 && iAbsDiff === 0) ||
    (iAbsDiff === 9 && jAbsDiff === 0) ||
    (jAbsDiff === 11 && iAbsDiff === 0)
  ) {
    if (targetCell.gameElement === BALL) {
      playSound();
      var elCollectedBallText = document.querySelector('h3');
      gBall++;
      // gStartedBalls++;
      console.log(gBall);
      console.log(gStartedBalls);
      elCollectedBallText.innerText = 'Balls Collected: ' + gBall;
      if (gBall === gStartedBalls) {
        clearInterval(gRandomBall);
        clearInterval(gRandomGlue);
        var elYouWonTxt = document.querySelector('h5');
        var elButton = document.querySelector('button');
        elButton.style.display = 'block';
        elYouWonTxt.innerText = 'You won and collected : ' + gBall + ' Balls';
      }
    }
    // MOVING from current position
    // Model:
    gBoard[gGamerPos.i][gGamerPos.j].gameElement = null;
    // Dom:
    renderCell(gGamerPos, '');

    // MOVING to selected position
    // Model:
    gGamerPos.i = i;
    gGamerPos.j = j;

    // GAMER GLUED CONDITION
    if (gBoard[gGamerPos.i][gGamerPos.j].gameElement === GLUE) {
      gIsGluent = true;
      setTimeout(() => {
        gIsGluent = false;
      }, '3000');
    }

    gBoard[gGamerPos.i][gGamerPos.j].gameElement = GAMER;
    // DOM:
    // if gamer is gluent change img to gluent img
    renderCell(gGamerPos, gIsGluent ? GAMERG_IMG : GAMER_IMG);
  } // else console.log('TOO FAR', iAbsDiff, jAbsDiff);
}

// Convert a location object {i, j} to a selector and render a value in that element
function renderCell(location, value) {
  var cellSelector = '.' + getClassName(location);
  var elCell = document.querySelector(cellSelector);
  elCell.innerHTML = value;
}

// Move the player by keyboard arrows
function handleKey(event) {
  var i = gGamerPos.i;
  var j = gGamerPos.j;

  switch (event.key) {
    case 'ArrowLeft':
      if (i === 5 && j === 0) {
        moveTo(5, 11);
      } else {
        moveTo(i, j - 1);
      }
      break;

    case 'ArrowRight':
      if (i === 5 && j === 11) {
        moveTo(5, 0);
      } else {
        moveTo(i, j + 1);
      }
      break;

    case 'ArrowUp':
      if (i === 0 && j === 5) {
        moveTo(9, 5);
      } else {
        moveTo(i - 1, j);
      }
      break;

    case 'ArrowDown':
      if (i === 9 && j === 5) {
        moveTo(0, 5);
      } else {
        moveTo(i + 1, j);
      }
      break;
  }
}

// Returns the class name for a specific cell
function getClassName(location) {
  var cellClass = 'cell-' + location.i + '-' + location.j;
  return cellClass;
}

// Play Sound
function playSound() {
  var collectedSound = new Audio('./sound/collected.mp3');
  collectedSound.play();
}

function restartGame() {
  window.location.reload();
}
