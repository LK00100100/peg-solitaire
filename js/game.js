//Note: i could make a peg object...
//TODO: pass in json instead of hardwiring board

window.onload = function () {
	new PegSolitare();
};

class PegSolitare {

	constructor() {
		this.numRows = 9;
		this.numCols = 9;

		this.gameDiv = document.getElementById("game");

		this.selectedPeg = null;

		this.board = [];

		this.direction =
			[{ row: -1, col: 0 }, { row: 1, col: 0 }, { row: 0, col: -1 }, { row: 0, col: 1 }];

		//a list of {row, col} that are jumpable.
		//calculated by highlightMoves;
		this.validMoves = [];

		document.getElementById("reset-btn").onclick = this.resetGame.bind(this);

		this.initBoard();
		this.resetGame();
	}

	/**
	 * reset the game state
	 */
	resetGame() {
		this.selectedPeg = null;
		this.validMoves = [];

		this.clearBoard();
		this.placePegs();
		this.initInvalidBoard();
		this.isGameOver();
	}

	/**
	 * define all of the images. call only once
	 */
	initBoard() {
		for (let i = 0; i < this.numRows; i++) {
			let row = document.createElement("div");
			row.className = "row";

			let boardRow = [];

			//make a row
			for (let j = 0; j < this.numCols; j++) {
				//make an image
				let boardSquare = new Image();
				boardSquare.src = '.../img/empty.png';
				boardSquare.className = "square"
				boardSquare.setAttribute("row", i)
				boardSquare.setAttribute("col", j)
				boardSquare.setAttribute("has-peg", false)
				boardSquare.setAttribute("invalid", false)
				boardSquare.onclick = function () {
					this.squareClicked(boardSquare, i, j);
				}.bind(this);

				boardRow.push(boardSquare)
				row.appendChild(boardSquare);
			}

			this.board.push(boardRow);
			this.gameDiv.appendChild(row);
		}
	}

	/**
	 * define what spots on the board are invalid
	 */
	initInvalidBoard() {
		//fill out a square
		let squaresTopLeftCorners = [[0, 0], [0, 6], [6, 0], [6, 6]];

		for (let corner of squaresTopLeftCorners) {
			let row = corner[0];
			let col = corner[1];

			for (let i = 0; i < 3; i++) {
				for (let j = 0; j < 3; j++) {
					this.markInvalid(row + i, col + j);
				}
			}
		}
	}

	/**
	 * mark a spot on the board as "NON PLAYABLE"
	 * @param {number} row 
	 * @param {number} col 
	 */
	markInvalid(row, col) {
		row = parseInt(row);
		col = parseInt(col);

		let img = this.board[row][col];
		img.setAttribute("invalid", true);
		img.src = "./img/empty-invalid.png";
	}

	/**
	 * remove all pegs from board
	 */
	clearBoard() {
		let rows = document.getElementsByClassName("square");

		for (let square of rows) {
			let row = square.getAttribute("row");
			let col = square.getAttribute("col");
			this.removePeg(row, col);
		}
	}

	//TODO: read from json instead or something
	placePegs() {
		//horizontal cross
		for (let row = 3; row <= 5; row++) {
			for (let col = 0; col < this.board[0].length; col++) {
				this.placePeg(row, col);
			}
		}

		//vertical cross
		for (let row = 0; row < this.board.length; row++) {
			for (let col = 3; col <= 5; col++) {
				this.placePeg(row, col);
			}
		}

		this.removePeg(4, 4);
	}

	/**
	 * do stuff when a board square is clicked
	 * 
	 * this = PegSolitaire
	 * @param {HTMLImageElement} clickedImg 
	 * @param {number} row 
	 * @param {number} col 
	 */
	squareClicked(clickedImg, row, col) {
		console.log(row + "," + col);
		console.log("moves: " + this.countMoves(row, col));

		let hasPeg = clickedImg.getAttribute("has-peg");

		if (this.selectedPeg == null) {
			if (hasPeg == "false")
				return;

			this.selectedPeg = clickedImg;
			clickedImg.src = "./img/peg-selected.png";

			this.toggleHighlightMoves(row, col, true);
		}
		//has selected peg before
		else {
			//same peg, deselect
			if (this.selectedPeg == clickedImg) {
				this.selectedPeg = null;
				clickedImg.src = "./img/peg.png";

				this.toggleHighlightMoves(row, col, false);
				return;
			}

			//new peg selected. switch selected.
			if (hasPeg == "true") {
				this.selectedPeg.src = "./img/peg.png";
				this.toggleHighlightMoves(this.selectedPeg.getAttribute("row"), this.selectedPeg.getAttribute("col"), false);

				this.selectedPeg = clickedImg;
				this.selectedPeg.src = "./img/peg-selected.png";
				this.toggleHighlightMoves(this.selectedPeg.getAttribute("row"), this.selectedPeg.getAttribute("col"), true);
			}
			//empty space. try jumping
			else {
				let jumpRow = clickedImg.getAttribute("row");
				let jumpCol = clickedImg.getAttribute("col");
				if (this.isValidJump(jumpRow, jumpCol)) {
					this.jumpToSpace(jumpRow, jumpCol);
				}
			}
		}
	}

	/**
	 * highlight or unhighlight valid moves
	 * also sets this.validMoves for later use
	 * @param {number} row the peg to move's row
	 * @param {number} col the peg to move's col
	 * @param {boolean} doHighlight true if you want highlight. false to unhighlight
	 */
	toggleHighlightMoves(row, col, doHighlight) {
		row = parseInt(row);
		col = parseInt(col);

		for (let direction of this.direction) {
			let secondPegRow = row + direction.row;
			let secondPegCol = col + direction.col;
			let jumpRow = row + (direction.row * 2);
			let jumpCol = col + (direction.col * 2);

			//check if the second "to-be-jumped-over" peg exists
			if (this.isValidCoordinate(secondPegRow, secondPegCol)) {
				let secondPeg = this.board[secondPegRow][secondPegCol];
				if (secondPeg.getAttribute("has-peg") == "false") {
					continue;
				}

				//check if valid target
				if (this.isValidCoordinate(jumpRow, jumpCol)) {
					let targetSquare = this.board[jumpRow][jumpCol];
					if (targetSquare.getAttribute("has-peg") == "false") {
						if (targetSquare.getAttribute("invalid") == "false") {
							targetSquare.src = "./img/empty.png";

							if (doHighlight) {
								this.validMoves.push({
									row: jumpRow,
									col: jumpCol
								})
								targetSquare.src = "./img/empty-valid.png";
							}
						}
					}
				}
			}
		}

		if (doHighlight == false)
			this.validMoves = [];
	}

	/**
	 * is this coordinate with the board limits?
	 * @param {number} row 
	 * @param {number} col 
	 */
	isValidCoordinate(row, col) {
		row = parseInt(row);
		col = parseInt(col);

		if (row < 0 || col < 0)
			return false;

		if (row >= this.board.length || col >= this.board[0].length)
			return false;

		return true;
	}

	/**
	 * is this empty space a valid jump? must be pre-calculated by calling
	 * toggleHighlightMoves() first.
	 * 
	 * @param {number} row 
	 * @param {number} col 
	 * @returns returns true if you can jump there with the selectedPeg. false otherwise
	 */
	isValidJump(row, col) {
		if (this.selectedPeg == null)
			return false;

		if (!this.isValidCoordinate(row, col))
			return false;

		for (let coordinates of this.validMoves) {
			if (coordinates.row == row && coordinates.col == col) {
				return true;
			}
		}

		return false;
	}

	/**
	 * jumps with the selectedPeg
	 * @param {number} targetRow 
	 * @param {number} targetCol 
	 */
	jumpToSpace(targetRow, targetCol) {
		let currentPegRow = this.selectedPeg.getAttribute("row");
		let currentPegCol = this.selectedPeg.getAttribute("col");

		//put in new spot
		this.placePeg(targetRow, targetCol);

		//remove old spot
		this.removePeg(currentPegRow, currentPegCol);
		this.toggleHighlightMoves(currentPegRow, currentPegCol, false);

		//second peg "middle"
		let secondPegRow = (currentPegRow == targetRow) ? currentPegRow : this.getMiddleAmount(currentPegRow, targetRow);
		let secondPegCol = (currentPegCol == targetCol) ? currentPegCol : this.getMiddleAmount(currentPegCol, targetCol);
		this.removePeg(secondPegRow, secondPegCol);

		this.selectedPeg = null;

		this.isGameOver();
	}

	/**
	 * helper method to help calculate the midpoint
	 * @param {number} a 
	 * @param {number} b 
	 */
	getMiddleAmount(a, b) {
		let max = Math.max(a, b);
		let min = Math.min(a, b);

		return (max + min) / 2;
	}

	placePeg(row, col) {
		row = parseInt(row);
		col = parseInt(col);

		let img = this.board[row][col];
		img.src = "./img/peg.png";
		img.setAttribute("has-peg", true);
	}

	removePeg(row, col) {
		row = parseInt(row);
		col = parseInt(col);

		let img = this.board[row][col];
		img.src = "./img/empty.png";
		img.setAttribute("has-peg", false);
	}

	/**
	 * checks if the game is over.
	 * also updates the possibleMoves text
	 */
	isGameOver() {
		let totalPossibleMoves = this.countMovesAll();

		document.getElementById("possible-moves").innerHTML = "possibleMoves: " + totalPossibleMoves;

		//set victory/loss message
		if (totalPossibleMoves == 0) {
			let message = "No more moves, you lose!";
			if (this.countPegs() == 1)
				message = "You win!";

			document.getElementById("possible-moves").innerHTML = message;
		}
	}

	/**
	 * counts the moves of all pieces.
	 * @returns total moves count
	 */
	countMovesAll() {
		let totalPossibleMoves = 0;
		for (let row = 0; row < this.board.length; row++) {
			for (let col = 0; col < this.board[0].length; col++) {
				totalPossibleMoves += this.countMoves(row, col);
			}
		}
		return totalPossibleMoves;
	}

	/**
	 * counts the number of moves this one piece can make
	 * @param {number} row 
	 * @param {number} col 
	 */
	countMoves(row, col) {
		row = parseInt(row);
		col = parseInt(col);

		if (this.board[row][col].getAttribute("has-peg") == "false")
			return 0;

		let moves = 0;

		for (let direction of this.direction) {
			let secondPegRow = row + direction.row;
			let secondPegCol = col + direction.col;
			let jumpRow = row + (direction.row * 2);
			let jumpCol = col + (direction.col * 2);

			//check if the second "to-be-jumped-over" peg exists
			if (this.isValidCoordinate(secondPegRow, secondPegCol)) {
				let secondPeg = this.board[secondPegRow][secondPegCol];
				if (secondPeg.getAttribute("has-peg") == "false") {
					continue;
				}

				//check if valid target
				if (this.isValidCoordinate(jumpRow, jumpCol)) {
					let targetSquare = this.board[jumpRow][jumpCol];
					if (targetSquare.getAttribute("has-peg") == "false") {
						if (targetSquare.getAttribute("invalid") == "false") {
							moves++;
						}
					}
				}
			}
		}

		return moves;
	}

	countPegs() {
		let count = 0;
		for (let row of this.board) {
			for (let square of row) {
				if (square.getAttribute("has-peg") == "true")
					count++;
			}
		}

		return count;
	}
}
