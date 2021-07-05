import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

class CounterButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {count: 1};
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.color !== nextProps.color) {
      return true;
    }
    if (this.state.count !== nextState.count) {
      return true;
    }
    return false;
  }

  render() {
    return (
      <button
        color={this.props.color}
        onClick={() => this.setState(state => ({count: state.count + 1}))}>
        Count: {this.state.count}
      </button>
    );
  }
}

function Square(props) {
  if (props.highlights.includes(props.index)) {
    // if the squqres to be highlighted includes this one
    return (
      <button className="square green" onClick={props.onClick}>
        {/* when clicked, call the onclick of the props (next level up) */}
        {props.value}
        {/* display the value passed down (x, o, or null) */}
      </button>
    );
    // make a green square, instead of a normal one
  }
  else {
    // normal square
    return (
      <button className="square" onClick={props.onClick}>
        {props.value}
      </button>
    );
  }
}


class Board extends React.Component {
  renderSquare(i) {
    // for rendering one specific square at index
    return (
    <Square key={"square"+i}
    // give it a specific key so react is happy
      index = {i}
      // index of the key (0,1,2,3...), used for highlighting
      value = {this.props.squares[i]} 
      // value of this square (x, o, or null)
      onClick = { () => this.props.onClick(i) }
      // when clicked, call the onclick of props (next level up)
      highlights = { this.props.highlights }
    /> );
  }

  render() {
    const loopTest = () => { 
      let content = [];
      // start with an empty array of content
      for (let i = 0; i < 3; i++) { 
        content.push(<div key={"board"+i} className="board-row"></div>)
        // 3 board divs, giving each an id so react is happy
        for (let j = 0; j < 3; j++) {
          // for each div
          content.push(this.renderSquare(3*i+j));
          // create 3 squares, and give it the proper number (0,1,2,3...)
        }
      }
      // make sure to return what has been assembled
      return content;
    }

    return (
      <div>
        <div className="counterbutton"> <CounterButton /> </div>
        {loopTest()}
        {/* call the function previously defined, allows us to avoid hard-coding in the grid */}
      </div>
    );
  }
}

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      history: [{
        squares: Array(9).fill(null),
      }],
      // history of previous board states, enabling going back in time
      prevPos: [],
      // history of which places were marked, allowing labelling coordinates of previous moves
      stepNumber: 0,
      // the current board in history on which to look at
      xIsNext: true,
      // boolean representing whether and x or o will be placed
    };
  }

  handleClick(i) {
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const prevPos = this.state.prevPos.slice(0, this.state.stepNumber + 1);
    // trim the history and previous pos (square) based on the current stepnumber, allowing us to rewrite history
    const current = history[history.length - 1];
    // get the current last board 
    const squares = current.squares.slice();
    // copy squares, so we can modify without mutating
    if (calculateWinner(squares) || squares[i]) { return; }
    // if the winner has already been declared or this square has been filled out, return and dont do anything
    squares[i] = this.state.xIsNext ? "X" : 'O';
    // depending on state, assign this square an X or O
    this.setState({
      history: history.concat([{
        squares: squares
      }]),
      prevPos: prevPos.concat([i]),
      // update the history with the current move
      stepNumber: history.length,
      // keep stepnumber up to date
      xIsNext: !this.state.xIsNext,
      // flip xIsNext so that whoever didnt go now has a turn
    });
  }

  jumpTo(step) {
    // called to jump to a previous state
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) === 0,
    });
    // update the current step, and set who is going next based on the step #
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    // get the current set of squares from history based on the stepnnumber
    const winner = calculateWinner(current.squares);
    // check if there has been a winner
    const moves = history.map((step, move) => {
      // use a map to create list elements for every previous move
      let index = this.state.prevPos[move-1];
      // set the index (to keep track of where the move was placed) based on the previous positions
      const desc = move ?
        // if the move exists (not the first move)
        `Go to move ${move} (${index%3+1}, ${Math.floor(index/3)+1})`
        // convert the number (0,1,2,3..) to a (col, row) format
        :
        'Go to game start';
        // otherwise default case of start
      if (move === this.state.stepNumber) {
        // if the current move is that of the stepnumber
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}><b>{desc}</b></button>
          </li>
        );
        // return the bolded button, for further clarity
      }
      else { 
        // else its a previous state (i.e. not the current one)
        return (
          <li key={move}>
            <button onClick={() => this.jumpTo(move)}>{desc}</button>
          </li>
        );
        // return a regular button with given desc
      }
    });
    let status;
    let highlights = [];
    // list of squares which should be highlighted
    if (winner) {
      // if the game has ended
      if (winner.length === 1) { status = "Tie!" }
      // based on the length, we know that it has been a tie
      else { 
        // else display who win, x or o
        status = `Winner:${winner[0]}!`; 
        for (let i = 0; i < 3; i++) { 
          highlights.push(winner[1][i]);
        }
        // add the winning squares to the list, for future highlighting
      }
    } else {
      // game has not yet ended, so display the default next move prompt
      status = 'Next player: ' + (this.state.xIsNext ? "X" : "O");
    }
    return (
      <div className="game">
        <div className="game-board">
          <Board
            squares={current.squares}
            onClick={(i) => this.handleClick(i)}
            highlights={highlights}
          />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

function calculateWinner(squares) {
  // determine if there was a winner
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  // lines that, if all have the same symbol, will result in a game end
  for (let i = 0; i < lines.length; i++) {
    // for every triplet in lines
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return [squares[a], [a,b,c]];
      // if the row matches, return it and the triplets that resulted in the win
    }
  }
  if (isATie(squares)) { return ["tie"]; }
  // check if there was a tie
  return null;
  // no tie and no winner, so the game should continue
}

  function isATie(squares) { 
    // determine if the game state is a tied or not
    for (let i = 0; i < squares.length; i++) { 
      // for every square in the array
      if (!squares[i]) { return false; }
      // if the square does not exist, instantly break out and return false
    }
    return true;
    // all of the squares were filled in, so return true because a tie occurred
  }

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);
// reactjs specific rendering