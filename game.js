//Note: i could make a peg object...

window.onload = function () {
	new PegSolitare();
};

class PegSolitare {

	constructor() {
		this.numRows = 5;
		this.numCols = 5;

		this.gameDiv = document.getElementById("game");

		this.selectedPeg = null;

		this.board = [];

		//[row, col]
		this.direction = [[-1, 0], [1, 0], [0, -1], [0, 1]];

		//a list of {row, col} that are jumpable.
		//calculated by highlightMoves;
		this.validMoves = [];

		document.getElementById("reset-btn").onclick = this.resetGame.bind(this);

		this.makeEmptyBoard();

		this.resetGame();
	}

	resetGame(){
		this.selectedPeg = null;
		this.validMoves = [];

		this.placePegs();
		this.isGameOver();
	}

	makeEmptyBoard() {
		for (let i = 0; i < this.numRows; i++) {
			let row = document.createElement("div");
			row.className = "row";

			let boardRow = [];

			//make a row
			for (let j = 0; j < this.numCols; j++) {
				//make an image
				let boardSquare = new Image();
				boardSquare.src = 'empty.png';
				boardSquare.className = "square"
				boardSquare.setAttribute("row", i)
				boardSquare.setAttribute("col", j)
				boardSquare.setAttribute("has-peg", false)
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

	placePegs() {
		let rows = document.getElementsByClassName("square");

		for (let square of rows) {
			let x = square.getAttribute("row");
			let y = square.getAttribute("col");

			//half a square (down the diagonal triangle)
			if (y < (x + 1)) {
				square.src = 'peg.png';
				square.setAttribute("has-peg", true);
			}
		}
	}

	/**
	 * do stuff when a board square is clicked
	 * 
	 * this = PegSolitaire
	 * @param {*} clickedImg 
	 * @param {*} row 
	 * @param {*} col 
	 */
	squareClicked(clickedImg, row, col) {
		console.log(row + "," + col);
		console.log("moves: " + this.countMoves(row, col));

		let hasPeg = clickedImg.getAttribute("has-peg");

		if (this.selectedPeg == null) {
			if (hasPeg == "false")
				return;

			this.selectedPeg = clickedImg;
			clickedImg.src = "peg-selected.png";

			this.toggleHighlightMoves(row, col, true);
		}
		//has selected peg before
		else {
			//same peg, deselect
			if (this.selectedPeg == clickedImg) {
				this.selectedPeg = null;
				clickedImg.src = "peg.png";

				this.toggleHighlightMoves(row, col, false);
				return;
			}

			//new peg selected. switch selected.
			if (hasPeg == "true") {
				this.selectedPeg.src = "peg.png";
				this.toggleHighlightMoves(this.selectedPeg.getAttribute("row"), this.selectedPeg.getAttribute("col"), false);

				this.selectedPeg = clickedImg;
				this.selectedPeg.src = "peg-selected.png";
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
	 * also sets validMoves
	 * @param {*} row the peg to move's row
	 * @param {*} col the peg to move's col
	 * @param {*} doHighlight true if you want highlight. false to unhighlight
	 */
	toggleHighlightMoves(row, col, doHighlight) {
		row = parseInt(row);
		col = parseInt(col);

		for (let direction of this.direction) {
			let secondPegRow = row + direction[0];
			let secondPegCol = col + direction[1];
			let jumpRow = row + (direction[0] * 2);
			let jumpCol = col + (direction[1] * 2);

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

						targetSquare.src = "empty.png";

						if (doHighlight) {
							this.validMoves.push({
								row: jumpRow,
								col: jumpCol
							})
							targetSquare.src = "empty-valid.png";
						}
					}
				}
			}
		}

		if (doHighlight == false)
			this.validMoves = [];
	}

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
	 * 
	 * @param {*} row 
	 * @param {*} col 
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
	 * @param {*} targetRow 
	 * @param {*} targetCol 
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

	getMiddleAmount(a, b) {
		let max = Math.max(a, b);
		let min = Math.min(a, b);

		return (max + min) / 2;
	}

	placePeg(row, col) {
		row = parseInt(row);
		col = parseInt(col);

		let img = this.board[row][col];
		img.src = "peg.png";
		img.setAttribute("has-peg", true);
	}

	removePeg(row, col) {
		row = parseInt(row);
		col = parseInt(col);

		let img = this.board[row][col];
		img.src = "empty.png";
		img.setAttribute("has-peg", false);
	}

	/**
	 * checks if the game is over.
	 * also updates the possibleMoves text
	 */
	isGameOver() {
		let totalPossibleMoves = 0;
		for (let row = 0; row < this.board.length; row++) {
			for (let col = 0; col < this.board[0].length; col++) {
				totalPossibleMoves += this.countMoves(row, col);
			}
		}

		document.getElementById("possible-moves").innerHTML = "possibleMoves: " + totalPossibleMoves;

		if (totalPossibleMoves == 0) {
			document.getElementById("possible-moves").innerHTML = "No more moves, you lose!";
		}
	}

	/**
	 * counts the number of moves this piece can make
	 * @param {*} row 
	 * @param {*} col 
	 */
	countMoves(row, col) {
		row = parseInt(row);
		col = parseInt(col);

		if(this.board[row][col].getAttribute("has-peg") == "false")
			return 0;

		let moves = 0;

		for (let direction of this.direction) {
			let secondPegRow = row + direction[0];
			let secondPegCol = col + direction[1];
			let jumpRow = row + (direction[0] * 2);
			let jumpCol = col + (direction[1] * 2);

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
						moves++;
					}
				}
			}
		}

		return moves;

	}
}
