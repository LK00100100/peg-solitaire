
window.onload = function () {
	new PegSolitare();
};

class PegSolitare {

	constructor() {
		this.numRows = 5;
		this.numCols = 5;

		this.gameDiv = document.getElementById("game");

		this.makeEmptyBoard();
		this.placePegs();
	}

	makeEmptyBoard() {

		for (let i = 0; i < this.numRows; i++) {
			let row = document.createElement("div");
			row.className = "row";

			//make a row
			for (let j = 0; j < this.numCols; j++) {
				//make an image
				let boardSquare = new Image();
				boardSquare.src = 'empty.png';
				boardSquare.className = "square"
				boardSquare.setAttribute("row", i)
				boardSquare.setAttribute("col", j)
				boardSquare.setAttribute("peg", false)
				boardSquare.onclick = function () {
					this.squareClicked(i, j);
				}.bind(this);

				row.appendChild(boardSquare);
			}

			this.gameDiv.appendChild(row);
		}
	}

	placePegs() {
		let rows = document.getElementsByClassName("square");

		for (let i = 0; i < rows.length; i++) {
			let square = rows[i];

			let x = square.getAttribute("row");
			let y = square.getAttribute("col");

			if (y < (x + 1)) {
				square.src = 'peg.png';
				square.setAttribute("peg", true);
			}
		}

	}

	squareClicked(x, y) {
		console.log(x + "," + y);
	};

}
