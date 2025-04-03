// Global variable for selected cell
let selectedCell = null;
let board = [];

let selRow, selCol;

// Function to handle cell selection
// Function to handle cell selection
function selectCell(row, col) {
    if (board[row][col] != 0) return;

    if (selectedCell) {
        selectedCell.classList.remove("selected-cell");
        selectedCell.removeAttribute("contenteditable"); // Remove contenteditable attribute
    }

    selRow = row;
    selCol = col;

    selectedCell = document.getElementById(`cell-${row}-${col}`);
    selectedCell.classList.add("selected-cell");
    selectedCell.setAttribute("contenteditable", true); // Add contenteditable attribute to allow typing
    selectedCell.focus(); // Set focus to the selected  cell
    
    // create an observer instance
    var observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if(selectedCell.innerHTML != '') {
                if(!isValidMove(board, selRow, selCol, Number(selectedCell.innerHTML))) {
                    alert("Invalid move!");
                    selectedCell.innerHTML = "";
                } else {
                    observer.disconnect();
                    selectedCell.setAttribute("contenteditable", false);

                    board[selRow][selCol] = Number(selectCell.innerHTML);
                }
            }
        });
    });

    // configuration of the observer:
    var config = { attributes: true, childList: true, characterData: true }

    // pass in the target node, as well as the observer options
    observer.observe(selectedCell, config);
}


// Function to generate a Sudoku board
function generateSudoku() {
    for (let i = 0; i < 9; i++) {
        board[i] = [];
        for (let j = 0; j < 9; j++) {
            board[i][j] = 0;
        }
    }
    generateSudokuHelper(board);
    return board;
}

// Helper function to recursively generate Sudoku
function generateSudokuHelper(board) {
    let random = () => Math.floor(Math.random() * 9) + 1;
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                let nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                shuffle(nums);
                for (let num of nums) {
                    if (isValidMove(board, row, col, num)) {
                        board[row][col] = num;
                        if (generateSudokuHelper(board)) return true;
                        board[row][col] = 0;
                    }
                }
                return false; // No valid move
            }
        }
    }
    return true; // Sudoku generated successfully
}

// Shuffle elements in an array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Function to start the game when the Start Game button is clicked
function startGame() {
   // let difficulty = document.getElementById("difficulty").value;

    let difficulty = document.querySelector('input[type=radio]:checked').value;
 
    let board = initializeSudoku(difficulty);
    playSudoku(board);
}

// Function to initialize the Sudoku board based on the selected difficulty
function initializeSudoku(difficulty) {
    let board = generateSudoku();
    switch (difficulty) {
        case "easy":
            removeNumbers(board, 24);
            break;
        case "medium":
            removeNumbers(board, 39);
            break;
        case "hard":
            removeNumbers(board, 61);
            break;

        default:
            removeNumbers(board, 24);
            break;
    }
    return board;
}

// Main logic for playing Sudoku
function playSudoku(board) {
    let userEntered = [];
    for (let i = 0; i < 9; i++) {
        userEntered[i] = [];
        for (let j = 0; j < 9; j++) {
            userEntered[i][j] = false;
        }
    }

    // Display the initial Sudoku board
    printBoard(board, userEntered);

    // Add event listener for keydown events
    document.addEventListener("keydown", function(event) {
        switch (event.key) {
            case "Enter":
                if (selectedCell && board[currentRow][currentCol] === 0) {
                    let num = parseInt(prompt("Enter number (1-9):"));
                    if (!isNaN(num) && num >= 1 && num <= 9) {
                        if (!userEntered[currentRow][currentCol] && isValidMove(board, currentRow, currentCol, num)) {
                            board[currentRow][currentCol] = num;
                            userEntered[currentRow][currentCol] = true; // Mark the number as user-entered
                            printBoard(board, userEntered); // Update the displayed board
                            if (isSudokuSolved(board)) {
                                alert("Congratulations! Sudoku solved!");
                                document.removeEventListener("keydown", handleKeyDown); // Remove the event listener
                            }
                        } else {
                            alert("Invalid move! Try again.");
                        }
                    } else {
                        alert("Invalid number! Try again.");
                    }
                } else {
                    alert("This cell already has a number or no cell is selected. Try again.");
                }
                break;
            default:
                break;
        }
    });

    // Add event listener for cell clicks
    let cells = document.querySelectorAll(".cell");
    cells.forEach(cell => {
        cell.addEventListener("click", function() {
            let idParts = cell.id.split("-");
            let row = parseInt(idParts[1]);
            let col = parseInt(idParts[2]);
            selectCell(row, col);
        });
    });
}

// Function to print the Sudoku board
// Function to print the Sudoku board
// Function to print the Sudoku board
function printBoard(board, userEntered) {
    let gameBoard = document.getElementById("game-board");
    gameBoard.innerHTML = ""; // Clear previous content

    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            let cell = document.createElement("div");
            cell.classList.add("cell");
            cell.id = `cell-${i}-${j}`; // Add id to each cell
            cell.textContent = board[i][j] === 0 ? "" : board[i][j];

            if(userEntered[i][j])
            {
                cell.setAttribute("contenteditable", false);
            }
           
            cell.style.backgroundColor = userEntered[i][j] ? "#fff" : "rgb(220, 228, 181)";

            gameBoard.appendChild(cell);
        }
    }
}


// Add event listener for keydown events
document.addEventListener("keydown", function(event) {
    event.preventDefault(); // Prevent default behavior

    switch (event.key) {
        case "Enter":
            if (selectedCell) {
                let num = parseInt(selectedCell.textContent.trim());
                if (!isNaN(num) && num >= 1 && num <= 9) {
                    if (!userEntered[currentRow][currentCol]) {
                        if (isValidMove(board, currentRow, currentCol, num)) {
                            selectedCell.style.color = "blue";
                        } else {
                            selectedCell.style.color = "red";
                        }
                    }
                }
            }
            break;
        case "Backspace":
            if (selectedCell) {
                selectedCell.textContent = ""; // Clear the cell on backspace
            }
            break;
        default:
            if (selectedCell) {
                let num = parseInt(event.key);
                if (!isNaN(num) && num >= 1 && num <= 9) {
                    selectedCell.textContent = num;
                }
            }
            break;
    }
});







// Check the validity of a move
function isValidMove(board, row, col, num) {
    return isRowValid(board, row, num) && isColValid(board, col, num) && isBoxValid(board, row - row % 3, col - col % 3, num);
}

// Check the validity of numbers in a row
function isRowValid(board, row, num) {
    for (let col = 0; col < 9; col++) {
        if (board[row][col] === num) return false;
    }
    return true;
}

// Check the validity of numbers in a column
function isColValid(board, col, num) {
    for (let row = 0; row < 9; row++) {
        if (board[row][col] === num) return false;
    }
    return true;
}

// Check the validity of numbers in a 3x3 box
function isBoxValid(board, startRow, startCol, num) {
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 3; col++) {
            if (board[startRow + row][startCol + col] === num) return false;
        }
    }
    return true;
}

// Check if Sudoku is solved (no empty cells)
function isSudokuSolved(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) return false;
        }
    }
    return true;
}

// Function to remove numbers from Sudoku to adjust difficulty
function removeNumbers(board, count) {
    let random = () => Math.floor(Math.random() * 9);
    while (count > 0) {
        let row = random();
        let col = random();
        if (board[row][col] !== 0) {
            let temp = board[row][col];
            board[row][col] = 0;
            if (!isValidMove(board, row, col, temp) || !isUniqueSolution(board)) {
                board[row][col] = temp;
                count--;
            } else {
                count--;
            }
        }
    }
}

// Check if there is a unique solution for Sudoku
function isUniqueSolution(board) {
    let tempBoard = [];
    for (let i = 0; i < 9; i++) {
        tempBoard[i] = board[i].slice();
    }
    return solveSudoku(tempBoard);
}

// Solve Sudoku using backtracking
function solveSudoku(board) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (board[row][col] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValidMove(board, row, col, num)) {
                        board[row][col] = num;
                        if (solveSudoku(board)) return true;
                        board[row][col] = 0;
                    }
                }
                return false; // No valid move
            }
        }
    }
    return true; // Sudoku solved successfully
}

// Add event listener to the Start Game button
document.getElementById("start-button").addEventListener("click", startGame);

// Loads the game on window load
window.addEventListener("DOMContentLoaded", () => {
   startGame();
});

//Adds click functionality and active status styling to buttons
document.querySelectorAll('input[name="radio"]').forEach(radioButton =>{
    radioButton.addEventListener("click", () => {
        startGame();
        toggleActiveClass(radioButton)
    } )
});

// Toggles active/selected state of button for styling purposes
function toggleActiveClass(selectedButton) {
    document.querySelectorAll('input[name="radio"]').forEach(radioButton => {
        if (radioButton.parentElement.classList.contains('active')) {
            radioButton.parentElement.classList.remove('active')
        }

        if (!selectedButton.parentElement.classList.contains('active')) {
            selectedButton.parentElement.classList.add('active')
        }
    })
};

