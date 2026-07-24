const root = document.documentElement;
const board = document.querySelector('#board');
const textContainer = document.querySelector('#text');

cells = [];

class Game {
    constructor() {
        this.x = {
            id: 'X',
            boards: Array(9).fill(true),
        };
        this.o = {
            id: 'O',
            boards: Array(9).fill(true),
        };
        this.currentPlayer = this.x;
        this.availableSubboards = Array(9).fill(true);
        this.gameOver = false;
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer.id === 'X' ? this.o : this.x;
        root.style.setProperty('--cell-hover-color', `var(--${this.currentPlayer.id.toLowerCase()}-hover-color)`);
    }

    makeMove(board, id) {
        if (this.gameOver) return;
        
        console.log(board, id);
        console.log(this.currentPlayer);

        const cell = board.subboard[id];
        if (!cell.element.classList.contains('open')) return;

        // text content
        // textContainer.textContent = `${this.currentPlayer.id}'s turn`;

        const piece = cell.element.firstChild;
        piece.classList.add(this.currentPlayer.id.toLowerCase());
        cell.element.classList.remove('open');
        cell.value = this.currentPlayer.id;

        if (!board.full) {
            board.full = checkFull(board.subboard);
        }
        if (board.value === '') {
            this.checkSubboardWin(board);
        }

        if (this.gameOver) return;

        this.availableSubboards[board.id] = !board.full && (board.value === '');
        if (board.full || (board.value !== '')) {
            if (this.x.boards[board.id]) {
                this.x.boards = this.availableSubboards.map((available) => available);
            }
            if (this.o.boards[board.id]) {
                this.o.boards = this.availableSubboards.map((available) => available);
            }
        }

        if (this.availableSubboards[id]) {
            this.currentPlayer.boards = Array(9).fill(false);
            this.currentPlayer.boards[id] = true;
        } else {
            this.currentPlayer.boards = this.availableSubboards.map((available) => available);

        }

        this.switchPlayer();
        restrictToSubBoards(this.currentPlayer.boards);
    }

    checkThreeInARow(board) {
        const winConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        for (let i = 0; i < winConditions.length; i++) {
            if (winConditions[i].every(value => board.includes(value))) {
                return true;
            }
        }
        return false;
    }

    checkSubboardWin(board) {
        const playerPositions = board.subboard.map((subcell, index) => subcell.value === this.currentPlayer.id ? index : '').filter(value => value !== '');
        if (!this.checkThreeInARow(playerPositions)) {
            console.log(board)
            if (board.full) {
                board.value = 'XO';
                const icon = document.createElement('div');
                icon.classList.add('o');
                board.element.insertBefore(icon, board.element.firstChild);
                board.element.classList.add('draw', "x");
                this.checkWin(cells);
            }
            return;
        }
        board.value = this.currentPlayer.id;

        if (board.value === 'X') {
            board.element.classList.add(this.currentPlayer.id.toLowerCase());
        } else {
            const icon = document.createElement('div');
            icon.classList.add('o');
            board.element.insertBefore(icon, board.element.firstChild);
        }

        this.checkWin(cells);
    }

    checkWin(board) {
        const xPlayerPositions = board.map((subboard) => subboard.value.includes(this.x.id) ? subboard.id : '').filter(value => value !== '');
        const oPlayerPositions = board.map((subboard) => subboard.value.includes(this.o.id) ? subboard.id : '').filter(value => value !== '');
        console.log("hi")
        console.log(xPlayerPositions)
        console.log(oPlayerPositions)

        let winner = null;
        if (this.checkThreeInARow(xPlayerPositions)) {
            winner = this.x;
        } 
        
        if(this.checkThreeInARow(oPlayerPositions)) {
            if (winner !== null) {
                this.gameOver = true;
                textContainer.textContent = `It's a draw!`;
                return;
            }
            winner = this.o;
        }

        if (winner !== null) {
            this.gameOver = true;
            textContainer.textContent = `${winner.id} wins!`;
            cells.forEach(cell => {
                cell.element.classList.remove('open');
                cell.subboard.forEach(subcell => {
                    subcell.element.classList.remove('open');
                })
            });
            return;
        }

        if (checkFull(board)) {
            this.gameOver = true;
            textContainer.textContent = `It's a draw!`;
        }
    }
}

const game = new Game();

function createSubBoard(element, cell) {
    subboard = [];

    for (let i = 0; i < 9; i++) {
        const div = document.createElement('div');
        div.classList.add('subcell', 'open');
        element.appendChild(div);
        div.addEventListener('click', () => game.makeMove(cell, i));
        const piece = document.createElement('div');
        piece.classList.add('piece');
        div.appendChild(piece);

        subcell = {
            element: div,
            value: ''
        };
        subboard.push(subcell);
    }

    return subboard;
}

function createBoard() {
    for (let i = 0; i < 9; i++) {
        const div = document.createElement('div');
        div.classList.add('cell', 'open');
        board.appendChild(div);

        cell = {
            id: i,
            element: div,
            subboard: [],
            value: '',
            full: false
        };
        cell.subboard = createSubBoard(div, cell);
        cells.push(cell);
    }
}

function unlockSubBoard(cell) {
    cell.element.classList.add('open');
    cell.subboard.forEach(subcell => {
        if (!(subcell.element.firstChild.className.includes('x') || subcell.element.firstChild.className.includes('o'))) {
            subcell.element.classList.add('open');
        }
    });
}

function lockSubBoard(cell) {
    if (cell.element.className.includes('open')) {
        cell.element.classList.remove('open');
    }
    cell.subboard.forEach(subcell => {
        if (subcell.element.className.includes('open')) {
            subcell.element.classList.remove('open');
        }
    });
}

function restrictToSubBoards(boards) {
    cells.forEach((cell, i) => {
        if (boards[i]) {
            unlockSubBoard(cell);
        } else {
            lockSubBoard(cell);
        }   
    }); 
}

function checkFull(board) {
    return board.every(cell => cell.value !== '');
}

createBoard();