import React, {useEffect, useState} from "../_snowpack/pkg/react.js";
import classNames from "../_snowpack/pkg/classnames.js";
import Modal from "../Modal/index.js";
import {AVATARS, CLASSES, FOOD, GAME_STATES, SYMBOLS} from "../constants.js";
import {useInterval} from "../hooks.js";
const foodKeys = Object.keys(FOOD);
const WIDTH = 12;
const HEIGHT = 12;
const KEYS = {
  UP: "ArrowUp",
  DOWN: "ArrowDown",
  LEFT: "ArrowLeft",
  RIGHT: "ArrowRight"
};
const validKeys = Object.values(KEYS);
const INITS = {
  WALLS: [[0, 0]],
  FOOD_XY: [10, 10],
  PLAYER_XY: [5, 5],
  VECTOR: [-1, 0],
  FOOD: FOOD.BURGER
};
function parseClassName(gameState) {
  return gameState.toLowerCase().replace(/_/g, "-");
}
function isCollision([x1, y1], [x2, y2]) {
  return x1 === x2 && y1 === y2;
}
function getRandomInt(max) {
  return Math.floor(Math.random() * Math.floor(max));
}
function createGrid(walls, playerXY, foodXY) {
  return [...Array(HEIGHT)].map((_, i) => createGridRow(i, walls, playerXY, foodXY));
}
function createGridRow(index, walls, [playerX, playerY], [foodX, foodY]) {
  const row = new Array(WIDTH).fill(SYMBOLS.BOARD_SPACE);
  walls.forEach(([x, y]) => {
    if (y === index)
      row[x] = SYMBOLS.WALL;
  });
  if (foodY === index)
    row[foodX] = SYMBOLS.FOOD;
  if (playerY === index)
    row[playerX] = SYMBOLS.PLAYER;
  return row;
}
function getAvatarForSymbol(symbol, currentFood, isGameOver) {
  const symbolKey = Object.keys(SYMBOLS).find((key) => SYMBOLS[key] === symbol);
  if (isGameOver && symbol === SYMBOLS.PLAYER)
    return AVATARS.DEATH;
  return AVATARS[symbolKey] || currentFood.AVATAR;
}
function getNextPlayerXY([playerX, playerY], [dx, dy]) {
  const nextX = wrapAroundValue(playerX + dx, 0, WIDTH - 1);
  const nextY = wrapAroundValue(playerY + dy, 0, HEIGHT - 1);
  return [nextX, nextY];
}
function wrapAroundValue(value, min, max) {
  if (value < min) {
    return max;
  } else if (value > max) {
    return min;
  } else {
    return value;
  }
}
function getNextVector(keyName) {
  const vectorMap = {
    [KEYS.UP]: [0, -1],
    [KEYS.DOWN]: [0, 1],
    [KEYS.LEFT]: [-1, 0],
    [KEYS.RIGHT]: [1, 0]
  };
  return vectorMap[keyName] || vector;
}
function isWall(walls, [x, y]) {
  return walls.some((wall) => isCollision(wall, [x, y]));
}
function getNextFood(walls) {
  const nextFoodIndex = getRandomInt(foodKeys.length);
  let newFoodX = getRandomInt(WIDTH);
  let newFoodY = getRandomInt(HEIGHT);
  while (isWall(walls, [newFoodX, newFoodY])) {
    newFoodX = getRandomInt(WIDTH);
    newFoodY = getRandomInt(HEIGHT);
  }
  return [
    FOOD[foodKeys[nextFoodIndex]],
    [newFoodX, newFoodY]
  ];
}
function getNextWall(walls, playerXY, foodXY) {
  let newWallX = getRandomInt(WIDTH);
  let newWallY = getRandomInt(HEIGHT);
  while ([...walls, playerXY, foodXY].some((xy) => isCollision(xy, [newWallX, newWallY]))) {
    newWallX = getRandomInt(WIDTH);
    newWallY = getRandomInt(HEIGHT);
  }
  return [newWallX, newWallY];
}
function App() {
  const [gameState, setGameState] = useState(GAME_STATES.STARTUP);
  const [frameRate] = useState(120);
  const [vector2, setVector] = useState(INITS.VECTOR);
  const [playerXY, setPlayerXY] = useState(INITS.PLAYER_XY);
  const [foodXY, setFoodXY] = useState(INITS.FOOD_XY);
  const [currentFood, setCurrentFood] = useState(INITS.FOOD);
  const [walls, setWalls] = useState(INITS.WALLS);
  const [score, setScore] = useState(0);
  const [grid, setGrid] = useState(createGrid(walls, playerXY, foodXY));
  function bindInput() {
    document.addEventListener("keydown", ({key}) => {
      if (key && validKeys.includes(key)) {
        setVector(getNextVector(key));
      }
    });
  }
  useEffect(bindInput, []);
  useInterval(() => {
    const nextPlayerXY = getNextPlayerXY(playerXY, vector2);
    if (walls.some((wall) => isCollision(playerXY, wall))) {
      setGameState(GAME_STATES.GAME_OVER);
      return;
    }
    if (isCollision(playerXY, foodXY)) {
      setScore(score + currentFood.SCORE);
      const [nextFood, nextFoodPosition] = getNextFood(walls);
      setCurrentFood(nextFood);
      setFoodXY(nextFoodPosition);
      setWalls([...walls, getNextWall(walls, playerXY, foodXY)]);
    }
    setPlayerXY(nextPlayerXY);
    setGrid(createGrid(walls, nextPlayerXY, foodXY));
  }, gameState === GAME_STATES.RUNNING ? frameRate : null);
  function resetGame() {
    setScore(0);
    setVector(INITS.VECTOR);
    setPlayerXY(INITS.PLAYER_XY);
    setFoodXY(INITS.FOOD_XY);
    setWalls(INITS.WALLS);
    setGrid(createGrid(INITS.WALLS, INITS.PLAYER_XY, INITS.FOOD_XY));
    setGameState(GAME_STATES.STARTUP);
  }
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h1", {
    id: "score"
  }, /* @__PURE__ */ React.createElement("strong", null, "OAT Delivery Score:"), " ", score), /* @__PURE__ */ React.createElement("div", {
    id: "game",
    className: `is-${parseClassName(gameState)}`
  }, grid.map((row, y) => {
    return /* @__PURE__ */ React.createElement("div", {
      key: `row-${y}`,
      className: CLASSES.GAME_BOARD_ROW
    }, row.map((cellValue, x) => {
      return /* @__PURE__ */ React.createElement("span", {
        key: `cell-${x}`,
        className: classNames(CLASSES.GAME_BOARD_CELL, {
          "is-wall": cellValue === SYMBOLS.WALL,
          "is-food": cellValue === SYMBOLS.FOOD,
          "is-player": cellValue === SYMBOLS.PLAYER,
          "is-death": cellValue === SYMBOLS.DEATH
        })
      }, /* @__PURE__ */ React.createElement("span", null, getAvatarForSymbol(cellValue, currentFood, gameState === GAME_STATES.GAME_OVER)));
    }));
  })), /* @__PURE__ */ React.createElement("div", {
    id: "info"
  }, foodKeys.map((foodKey) => `${FOOD[foodKey].AVATAR} = ${FOOD[foodKey].SCORE} points`).join(" ")), gameState === GAME_STATES.STARTUP && /* @__PURE__ */ React.createElement(Modal, {
    title: "Welcome to the OAT Arcade!",
    confirmText: "Start Driving",
    onConfirm: () => setGameState(GAME_STATES.RUNNING)
  }, /* @__PURE__ */ React.createElement("p", null, "Help the OAT delivery driver to collect all the menu items"), /* @__PURE__ */ React.createElement("p", null, "Avoid the roadblocks, we don't want to keep our customers waiting...")), gameState === GAME_STATES.GAME_OVER && /* @__PURE__ */ React.createElement(Modal, {
    title: "You Hit a Roadblock. Game Over!",
    confirmText: "Play Again",
    onConfirm: () => resetGame()
  }, /* @__PURE__ */ React.createElement("p", null, "You earned ", score, " points on your delivery")));
}
export default App;
