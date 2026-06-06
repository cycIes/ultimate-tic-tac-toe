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
        console.log(board, id);
        console.log(this.currentPlayer);

        const cell = board.subboard[id];
        if (!cell.element.classList.contains('open')) return;

        const piece = cell.element.firstChild;
        piece.classList.add(this.currentPlayer.id.toLowerCase());
        cell.element.classList.remove('open');
        cell.value = this.currentPlayer.id;

        if (!board.full) {
            board.full = checkFull(board);
        }
        this.checkSubboardWin(board);

        this.availableSubboards[board.id] = !board.full;
        if (board.full) {
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
        const playerPositions = board.subboard.map((subcell, index) => subcell.value === this.currentPlayer.id ? index : null).filter(value => value !== null);
        if (!this.checkThreeInARow(playerPositions)) {
            console.log(board)
            if (board.full) {
                board.value = 'draw';
                const icon = document.createElement('div');
                icon.classList.add('o');
                board.element.appendChild(icon);
                board.element.classList.add('draw', "x");
            }
            return;
        }
        board.value = this.currentPlayer.id;

        if (board.value === 'X') {
            board.element.classList.add(this.currentPlayer.id.toLowerCase());
        } else {
            const icon = document.createElement('div');
            icon.classList.add('o');
            board.element.appendChild(icon);
        }
    }

    checkWin(board) {
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
            value: null
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
            value: null,
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
    return board.subboard.every(subcell => subcell.value !== null);
}

createBoard();