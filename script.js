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

        let boardFull = checkFull(board);
        this.availableSubboards[board.id] = !boardFull;
        if (boardFull) {
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
            value: null
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