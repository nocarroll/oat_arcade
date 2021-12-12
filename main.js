import CONSTANTS from './constants';
const { AVATARS, CLASSES, FOOD, SYMBOLS } = CONSTANTS;
const foodKeys = Object.keys(FOOD);
const WIDTH = 12;
const HEIGHT = 12;
const KEYS = {
  UP: 'ArrowUp',
  DOWN: 'ArrowDown',
  LEFT: 'ArrowLeft',
  RIGHT: 'ArrowRight'
};
const validKeys = Object.values(KEYS);

const playerXY = [5, 5];
const foodXY = [10, 10];
const walls = [[0, 0]];

let vector = [-1, 0]
let score = 0;
let currentFood = FOOD.BURGER;
let speed = 120;

const gameBoard = document.getElementById('game');
const infoElement = document.getElementById('info');
const scoreElement = document.getElementById('score');

infoElement.innerText = foodKeys.map(foodKey => `${FOOD[foodKey].AVATAR} = ${FOOD[foodKey].SCORE} points`).join(' | ');

function getAvatarForSymbol (symbol) {
  const symbolKey = Object.keys(SYMBOLS).find(key => SYMBOLS[key] === symbol);

  return AVATARS[symbolKey] || currentFood.AVATAR;
}

function draw (grid) {
  gameBoard.innerHTML = '';
  grid.forEach(row => {
    const rowContainer = document.createElement('div');
    rowContainer.className = CLASSES.GAME_BOARD_ROW;
    const cells = row.map(value => {
      const cell = document.createElement('span');
      cell.innerHTML = `<span>${getAvatarForSymbol(value)}</span>`;
      cell.classList.add(CLASSES.GAME_BOARD_CELL);
      cell.classList.toggle('is-food', value === SYMBOLS.FOOD);
      cell.classList.toggle('is-player', value === SYMBOLS.PLAYER);
      cell.classList.toggle('is-death', value === SYMBOLS.DEATH);
      return cell;
    });
  
    cells.forEach(cell => rowContainer.appendChild(cell))
    gameBoard.appendChild(rowContainer);
  });
}

function getRandomInt (max) {
  return Math.floor(Math.random() * Math.floor(max));
}

function spawnFood () {
  const nextFoodIndex = getRandomInt(foodKeys.length);
  currentFood = FOOD[foodKeys[nextFoodIndex]];
  let newFoodX = getRandomInt(WIDTH);
  let newFoodY = getRandomInt(HEIGHT);
  while (isWall(newFoodX, newFoodY)) {
    newFoodX = getRandomInt(WIDTH);
    newFoodY = getRandomInt(HEIGHT);
  }
  foodXY[0] = newFoodX;
  foodXY[1] = newFoodY;
}

function isFood (x, y) {
  const [foodX, foodY] = foodXY;
  
  return x === foodX && y === foodY;
}

function isWall (x, y) {
  return walls.some(wall => wall[0] === x && wall[1] === y);
}

function spawnWall () {
  const [playerX, playerY] = playerXY;
  let newWallX = getRandomInt(WIDTH);
  let newWallY = getRandomInt(HEIGHT);

  while (isFood(newWallX, newWallY) || isPlayer(newWallX, newWallY) || isWall(newWallX, newWallY)) {
    newWallX = getRandomInt(WIDTH);
    newWallY = getRandomInt(HEIGHT);
  }
  walls.push([getRandomInt(WIDTH), getRandomInt(HEIGHT)]);
}

function isPlayer (x, y) {
  const [playerX, playerY] = playerXY;
  
  return x === playerX && y === playerY
}

function updatePlayerXY () {
  const [x, y] = playerXY;
  const [dx, dy] = vector;
  const nextX = wrapAroundValue(x + dx, 0, WIDTH - 1);
  const nextY = wrapAroundValue(y + dy, 0, HEIGHT - 1);
  
  playerXY[0] = nextX;
  playerXY[1] = nextY;
}

function getRow () {
  return new Array(WIDTH).fill(SYMBOLS.BOARD_SPACE);
}

function addWallsToGrid () {
  walls.forEach(([x, y]) => grid[y][x] = SYMBOLS.WALL);
}

const grid = [...Array(HEIGHT)].map(() => getRow());
addWallsToGrid();

function frame () {
  const [playerX, playerY] = playerXY;
  const [foodX, foodY] = foodXY;
  let isGameOver = false;

  const nextGrid = grid.map((row, i) => {
    const thisRow = [...row];
    // Player is in this row
    if (playerY === i) {
      if (!isGameOver && isWall(playerX, playerY)) {
        isGameOver = true;
      } else if (!isGameOver && playerX === foodX && playerY === foodY) {
        score += currentFood.SCORE;
        spawnFood();
        spawnWall();
        addWallsToGrid();
      }
      thisRow[playerX] = isGameOver ? SYMBOLS.DEATH : SYMBOLS.PLAYER;
    }
    if (foodY === i) thisRow[foodX] = SYMBOLS.FOOD;
    return thisRow;
  });

  draw(nextGrid);

  if (isGameOver) {
    gameOver();
  } else {
    scoreElement.innerHTML = `<strong>Delivery Score:</strong> ${score}`;
    updatePlayerXY();
  }
}

function changeVector (keyName) {
  const vectorMap = {
    [KEYS.UP]: [0, -1],
    [KEYS.DOWN]: [0, 1],
    [KEYS.LEFT]: [-1, 0],
    [KEYS.RIGHT]: [1, 0]
  }
  return vectorMap[keyName] || vector;
}

bindInput();
frame();

const game = setInterval(() => frame(), speed);

function wrapAroundValue (value, min, max) {
  if (value < min) {
    return max;
  } else if (value > max) {
    return min;
  } else {
    return value;
  }
}

function bindInput () {
  document.addEventListener('keydown', ({ key }) => {
    if (!key) return;
    if (validKeys.includes(key)) {
      vector = changeVector(key);
    } 
  });
}

function gameOver () {
  clearInterval(game);
  window.alert(`${AVATARS.CUSTOMER} You hit a roadblock, the food is late, and the OAT customer is not happy.`, 'Your score is:', score);
}
