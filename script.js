const root = document.documentElement;
const board = document.querySelector('#board');
const textContainer = document.querySelector('#text');

cells = [];

class Game {
    constructor() {
        this.currentPlayer = 'X';
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
        root.style.setProperty('--cell-hover-color', `var(--${this.currentPlayer.toLowerCase()}-hover-color)`);
    }

    makeMove(cell, id) {
        const piece = cell.firstChild;
        if (!cell.classList.contains('open')) return;
        piece.classList.add(this.currentPlayer.toLowerCase());
        cell.classList.remove('open');
        this.switchPlayer();
        restrictBoardToSubBoard(id);
    }
}

game = new Game();

function createSubBoard(cell) {
    subboard = [];

    for (let i = 0; i < 9; i++) {
        const div = document.createElement('div');
        div.classList.add('subcell', 'open');
        cell.appendChild(div);
        div.addEventListener('click', () => game.makeMove(div, i));
        const piece = document.createElement('div');
        piece.classList.add('piece');
        div.appendChild(piece);
        subboard.push(div);
    }

    return subboard;
}

function createBoard() {
    for (let i = 0; i < 9; i++) {
        const div = document.createElement('div');
        div.classList.add('cell');
        board.appendChild(div);

        subboard = createSubBoard(div);

        cell = {
            element: div,
            board: subboard,
            value: null
        };
        cells.push(cell);
    }
}

function unlockSubBoard(cell) {
    cell.board.forEach(subcell => {
        if (!'xo'.includes(cell.className)) {
            subcell.classList.add('open');
        }
    });
}

function lockSubBoard(cell) {
    cell.board.forEach(subcell => {
        if (subcell.className.includes('open')) {
            subcell.classList.remove('open');
        }
    });
}

function restrictBoardToSubBoard(index) {
    cells.forEach((cell, i) => {
        if (i === index) {
            unlockSubBoard(cell);
        } else {
            lockSubBoard(cell);
        }   
    }); 
}

createBoard();