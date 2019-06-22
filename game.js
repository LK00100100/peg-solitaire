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

		this.makeEmptyBoard();
		this.placePegs();

		//[row, col]
		this.direction = [[-1, 0], [1, 0], [0, -1], [0, 1]];
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
	 * @param {*} img 
	 * @param {*} x 
	 * @param {*} y 
	 */
	squareClicked(img, x, y) {
		console.log(x + "," + y);

		let hasPeg = img.getAttribute("has-peg");

		if (this.selectedPeg == null) {
			if (hasPeg == false)
				return;

			this.selectedPeg = img;
			img.src = "peg-selected.png";

			this.toggleHighlightMoves(x, y, true);
		}
		//has selected peg before
		else {
			//same peg, deselect
			if (this.selectedPeg == img) {
				this.selectedPeg = null;
				img.src = "peg.png";

				this.toggleHighlightMoves(x, y, false);
				return;
			}
		}
	}

	/**
	 * highlight or unhighlight valid moves
	 * @param {*} row the peg to move's row
	 * @param {*} col the peg to move's col
	 * @param {*} highlight true if you want highlight.
	 */
	toggleHighlightMoves(row, col, highlight) {

		for (let direction of this.direction) {
			let secondPegRow = row + direction[0];
			let secondPegCol = col + direction[1];
			let jumpRow = row + (direction[0] * 2);
			let jumpCol = col + (direction[1] * 2);

			//second peg check
			if (this.isValidCoordinate(secondPegRow, secondPegCol)) {
				let secondPeg = this.board[secondPegRow][secondPegCol];
				if (secondPeg.getAttribute("has-peg") == "false") {
					continue;
				}

				if (this.isValidCoordinate(jumpRow, jumpCol)) {
					let targetSquare = this.board[jumpRow][jumpCol];
					if (targetSquare.getAttribute("has-peg") == "false") {

						targetSquare.src = "empty.png";

						if (highlight)
							targetSquare.src = "empty-valid.png";
					}
				}
			}
		}
	}

	isValidCoordinate(x, y) {
		if (x < 0 || y < 0)
			return false;

		if (x >= this.board.length || y >= this.board[0].length)
			return false;

		return true;
	}

}
