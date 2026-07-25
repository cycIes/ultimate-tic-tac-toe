const root = document.documentElement;
const container = document.querySelector('#container');
const board = document.querySelector('#board');
const textContainer = document.querySelector('#text');
const replayButton = document.querySelector('#reset');
const replayButtonText = replayButton.querySelector('span');

replayButton.addEventListener('click', () => {
    replayButtonText.textContent = 'Reset';
    game = new Game();
});

const winConditions = [
    { name: 'row1',
        positions: [0, 1, 2] },
    { name: 'row2',
        positions: [3, 4, 5] },
    { name: 'row3',
        positions: [6, 7, 8] },
    { name: 'col1',
        positions: [0, 3, 6] },
    { name: 'col2',
        positions: [1, 4, 7] },
    { name: 'col3',
        positions: [2, 5, 8] },
    { name: 'diag1',
        positions: [0, 4, 8] },
    { name: 'diag2',
        positions: [2, 4, 6] }
];

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
        this.winner = null;

        cells = [];
        createBoard();

        // text content
        textContainer.textContent = `${this.currentPlayer.id}'s turn`;

        root.style.setProperty('--cell-hover-color', `var(--${this.currentPlayer.id.toLowerCase()}-hover-color)`);
    }

    switchPlayer() {
        this.currentPlayer = this.currentPlayer.id === 'X' ? this.o : this.x;
        root.style.setProperty('--cell-hover-color', `var(--${this.currentPlayer.id.toLowerCase()}-hover-color)`);

        // text content
        textContainer.textContent = `${this.currentPlayer.id}'s turn`;
    }

    makeMove(board, id) {
        if (this.gameOver) return;
        
        // console.log(board, id);
        // console.log(this.currentPlayer);

        const cell = board.subboard[id];
        if (!cell.element.classList.contains('open')) return;

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

        if (this.gameOver) {
            const playerPositions = board.subboard.map((subcell, index) => subcell.value === this.currentPlayer.id ? index : '').filter(value => value !== '');
            if (this.winner !== null) {
                displayWinLines();
            }
            replayButtonText.textContent = 'Play Again';
            return;
        }

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

    checkThreeInARow(positions) {
        for (let i = 0; i < winConditions.length; i++) {
            if (winConditions[i].positions.every(value => positions.includes(value))) {
                return true;
            }
        }
        return false;
    }

    checkSubboardWin(board) {
        const playerPositions = board.subboard.map((subcell, index) => subcell.value === this.currentPlayer.id ? index : '').filter(value => value !== '');
        if (!this.checkThreeInARow(playerPositions)) {
            // console.log(board)
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
        // console.log(xPlayerPositions)
        // console.log(oPlayerPositions)

        if (this.checkThreeInARow(xPlayerPositions)) {
            this.winner = this.x;
        } 
        
        if(this.checkThreeInARow(oPlayerPositions)) {
            if (this.winner !== null) {
                this.gameOver = true;
                this.winner = null;
                textContainer.textContent = `It's a draw!`;
                return;
            }
            this.winner = this.o;
        }

        if (this.winner !== null) {
            this.gameOver = true;
            textContainer.textContent = `${this.winner.id} wins!`;
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

game = new Game();

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
    board.replaceChildren();
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

function displayWinLines() {
    const positions = cells.map((subboard) => subboard.value.includes(game.currentPlayer.id) ? subboard.id : '').filter(value => value !== '');

    for (let i = 0; i < winConditions.length; i++) {
        if (winConditions[i].positions.every(value => positions.includes(value))) {
            const winLine = document.createElement('div');
            winLine.classList.add('win-line', winConditions[i].name);
            board.appendChild(winLine);
        }
    }
}