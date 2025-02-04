const gameElem = document.querySelector("#games");
const statusElem = document.querySelector("#sudoku-status");
document.querySelector("#sudoku-solve").addEventListener("click", solve);

//constants used to find what numbers are in the same block.
const sudokuSubGrid = [0, 3, 6, 27, 30, 33, 54, 57, 60]; //number of left top corners of sub grids (3*3) in main grid (9*9)
const sudokuOffset = [0, 1, 2, 9, 10, 11, 18, 19, 20]; //numbers thats added to corner to get coordinates of every number in that subgrid (3*3)

const sudokuData = [];
sudokuData.length = 81;
sudokuData.fill(null); //null == empty

function createGrid() {
  let gameHtml = "";
  for (let i = 0; i < 81; i++) {
    gameHtml += `<input type="text" maxlength="1" id="sudoku-input-js-${i}" class="sudoku-input" data-border-color="black" readonly>`;
  }

  document.querySelector("#sudoku-game").innerHTML = gameHtml;
  
  //different background colors for different subgrids
  let odd = true;
  for(let i = 0; i < 9; i++){
    for(let j = 0; j < 9; j++){
      const index = sudokuSubGrid[i] + sudokuOffset[j];
      if(odd){
        document.querySelector(`#sudoku-input-js-${index}`).classList.add('sudoku-odd');
      } else{
        document.querySelector(`#sudoku-input-js-${index}`).classList.add('sudoku-even')
      };
    };
    odd ? odd = false: odd = true;
  };

  inputControl();
}
createGrid();

function inputControl(){ //TODO finish
  for(let i = 0; i < 81; i++){
    document.querySelector(`#sudoku-input-js-${i}`).addEventListener('keydown', (event)=>{movement(event, i)});
  };
}

function movement(event, i){ //TODO finish
  const key = event.key;
  let column = i % 9;
  let row = Math.floor(i / 9);
  let index;

  switch(key) {
    //add cases for numbers to overwrite whats inside input
    case '1':
      document.querySelector(`#sudoku-input-js-${i}`).value = '1';
      break;
    case '2':
      document.querySelector(`#sudoku-input-js-${i}`).value = '2';
      break;
    case '3':
      document.querySelector(`#sudoku-input-js-${i}`).value = '3';
      break;
    case '4':
      document.querySelector(`#sudoku-input-js-${i}`).value = '4';
      break;
    case '5':
      document.querySelector(`#sudoku-input-js-${i}`).value = '5';
      break;
    case '6':
      document.querySelector(`#sudoku-input-js-${i}`).value = '6';
      break;
    case '7':
      document.querySelector(`#sudoku-input-js-${i}`).value = '7';
      break;
    case '8':
      document.querySelector(`#sudoku-input-js-${i}`).value = '8';
      break;
    case '9':
      document.querySelector(`#sudoku-input-js-${i}`).value = '9';
      break;

    //movment arrows + enter
    case 'ArrowUp':
      row--;
      if(row === -1){
        row = 8;
      };
      index = row * 9 + column;
      document.querySelector(`#sudoku-input-js-${index}`).focus();
      break;
    case 'ArrowLeft':
      column--;
      if(column === -1){
        column = 8;
      };
      index = row * 9 + column;
      document.querySelector(`#sudoku-input-js-${index}`).focus();
      break;
    case 'ArrowDown':
      index = (i + 9) % 81;
      document.querySelector(`#sudoku-input-js-${index}`).focus();
      break;
    case 'ArrowRight':
      column = (column + 1) % 9;
      index = row * 9 + column;
      document.querySelector(`#sudoku-input-js-${index}`).focus();
      break;
    case 'Enter':
      index = (i + 1) % 81;
      document.querySelector(`#sudoku-input-js-${index}`).focus();
      break;
  };
};

function solve() {
  statusElem.innerText = "Solving";

  for (let i = 0; i < 81; i++) {
    if (document.querySelector(`#sudoku-input-js-${i}`).value === "") {
      document.querySelector(`#sudoku-input-js-${i}`).dataset.borderColor = "gray";
      sudokuData[i] = null;
      continue;
    } else {
      document.querySelector(`#sudoku-input-js-${i}`).dataset.borderColor = "black";
      const int = parseInt(
        document.querySelector(`#sudoku-input-js-${i}`).value
      );
      sudokuData[i] = int;
      //console.log(sudokuData);
    }
  }

  if (!checkValidity(sudokuData, true)) {
    statusElem.innerText = "Invalid input";
    return;
  }
  let sudokuSolutionData = sudokuData.slice();

  let solvable = solveAlgorithm(sudokuSolutionData);
  if (solvable) {
    statusElem.innerText = "Finished";
    updataSudoku(sudokuSolutionData);
  } else {
    statusElem.innerText = "No valid solution";
  }
}

function updataSudoku(sudokuData) {
  for (let i = 0; i < 81; i++) {
    document.querySelector(`#sudoku-input-js-${i}`).value = sudokuData[i];
  };
}

function solveAlgorithm(sudokuSolutionData, blockNumber = 0, blockIndex = -1) { //blockIndex = -1 because we increment first (with 0 we would skip first block)
  if(blockIndex >= 8){
    blockNumber++;
    blockIndex = 0;
  } else{
    blockIndex++;
  };

  //base case
  if(blockNumber >= 9){
    updataSudoku(sudokuSolutionData);
    return true;
  };
  const index = sudokuSubGrid[blockNumber] + sudokuOffset[blockIndex];
  if(sudokuSolutionData[index] === null){
    for(let i = 1; i <= 9; i++){
      //add to array if it can be there
      sudokuSolutionData[index] = i;
      if(!checkValidityOne(sudokuSolutionData, blockNumber, blockIndex)){ //if its not valid number try other
        sudokuSolutionData[index] = null;
        continue;
      };

      const solved = solveAlgorithm(sudokuSolutionData, blockNumber, blockIndex);
      if(solved){
        return true;
      };
    };
  } else{
    return solveAlgorithm(sudokuSolutionData, blockNumber, blockIndex);
  };
    return false;
};

function checkValidity(sudokuData, highlightConflicts = false) {
  let valid = true;
  for (let blockNumber = 0; blockNumber < 9; blockNumber++) {
    for (let blockIndex = 0; blockIndex < 9; blockIndex++) {
      const index = sudokuSubGrid[blockNumber] + sudokuOffset[blockIndex];
      if (sudokuData[index] === null) {
        continue;
      }
      /* //input is not readonly so checking for incorrect values is not necesary
      if(isNaN(sudokuData[index]) || (sudokuData[index] > 9 || sudokuData[index] < 1)){
        document.querySelector(`#sudoku-input-js-${index}`).dataset.borderColor = "red";
        console.log('not valid');
        valid = false;
        continue;
      };
      */
      valid &= checkValidityOne(
        sudokuData,
        blockNumber,
        blockIndex,
        highlightConflicts
      );
    }
  }
  return valid;
}

//block number specifies what 3*3 sub grid in 9*9 main grid is the number part of.
//block index represents whitch number it is in 3*3 sub grid
function checkValidityOne(
  sudokuData,
  blockNumber,
  blockIndex,
  highlightConflicts = false
) {
  const index = sudokuSubGrid[blockNumber] + sudokuOffset[blockIndex];
  const row = Math.floor(index / 9);
  const column = index % 9;
  let valid = true;

  //check row, column, block
  //row check (check all horizontaly)
  for (let columnIndex = 0; columnIndex < 9; columnIndex++) {
    const checkIndex = row * 9 + columnIndex;
    if (checkIndex === index) {
      continue;
    }
    valid &= sudokuData[checkIndex] !== sudokuData[index];

    if (sudokuData[checkIndex] === sudokuData[index] && highlightConflicts) {
      //test
      document.querySelector(`#sudoku-input-js-${checkIndex}`).dataset.borderColor = "red";
      document.querySelector(`#sudoku-input-js-${checkIndex}`).dataset.borderColor = "red";
    }
  }

  //column check (check all verticaly)
  for (let rowIndex = 0; rowIndex < 9; rowIndex++) {
    const checkIndex = rowIndex * 9 + column;
    if (checkIndex === index) {
      continue;
    }
    valid &= sudokuData[checkIndex] !== sudokuData[index];

    if (sudokuData[checkIndex] === sudokuData[index] && highlightConflicts) {
      //test
      document.querySelector(`#sudoku-input-js-${checkIndex}`).dataset.borderColor = "red";
      document.querySelector(`#sudoku-input-js-${checkIndex}`).dataset.borderColor = "red";
    }
  }

  //block check (check all in block)
  for (let blockIndex = 0; blockIndex < 9; blockIndex++) {
    const checkIndex = sudokuSubGrid[blockNumber] + sudokuOffset[blockIndex];
    if (checkIndex === index) {
      continue;
    }
    valid &= sudokuData[checkIndex] !== sudokuData[index];

    if (sudokuData[checkIndex] === sudokuData[index] && highlightConflicts) {
      //test
      document.querySelector(`#sudoku-input-js-${checkIndex}`).dataset.borderColor = "red";
      document.querySelector(`#sudoku-input-js-${checkIndex}`).dataset.borderColor = "red";
    }
  }

  return valid;
}
