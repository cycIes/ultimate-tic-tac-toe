const container = document.querySelector('.container');

cells = [];

function createSubBoard(cell) {
    for (let i = 0; i < 9; i++) {
        const div = document.createElement('div');
        div.classList.add('subcell');
        cell.appendChild(div);
    }
}

function createBoard() {
    for (let i = 0; i < 9; i++) {
        const div = document.createElement('div');
        div.classList.add('cell');
        container.appendChild(div);
        createSubBoard(div);

        subboard = [];
        for (let j = 0; j < 9; j++) {
            subboard.push(null);
        }

        cell = {
            id: i,
            element: div,
            board: subboard,
            value: null
        };
        cells.push(cell);
    }
}

createBoard();