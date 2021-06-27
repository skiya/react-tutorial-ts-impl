import React, { MouseEventHandler } from 'react';
import ReactDOM from 'react-dom';
import './index.css';

const BOARD_SIZE = 3;

/**
 * Function Component represents one single square on the board
 * 表示 棋盘上一个格子 的 函数组件
 *
 * @param props
 * @returns html Button
 */
const Square: React.FC<{value: string, onClick: MouseEventHandler}> = (props) => {
  return <button className="square" onClick = { props.onClick }>
          { props.value }
        </button>;
}

/**
 * Class Component renders a single history button
 * 代表 一个历史按钮的 类组件
 */
class History extends React.Component<{description: string}, {isMouseHovering: boolean}> {
  state = {
    isMouseHovering: false
  }
  render() {
    return (
      <button onMouseOver={() => { this.setState({isMouseHovering: true}) }}
              onMouseLeave={() => { this.setState({isMouseHovering: false}) }}
              style={{fontWeight: this.state.isMouseHovering ? "bold": "normal"}}> { this.props.description } </button>
    )
  }
}

/**
 * Function Component renders the game board
 * 表示 整个游戏棋盘 的 函数组件
 *
 * @param props
 * @returns html div
 */
const Board: React.FC<{squares: Array<string>, onClick: Function}> = (props) => {
  // index array for rendering multiple components
  // 用来 循环渲染多个组件 的 索引数组
  const numbers = [0, 1, 2]

  const renderSquare = (i: number) => {
    return <Square value={ props.squares[i] } onClick={ () => props.onClick(i) } key={i} />
  }

  return (
    <div>
      {/* render a row each loop */}
      {/* 每次循环渲染一行格子 */}
      {numbers.map((_, row) => {
        return (
          <div className="board-row" key={row}>
            {/* render one square inside a row each loop */}
            {/* 每次循环渲染一行里的一个格子 */}
            {numbers.map((_, col) => {
              return renderSquare(row * BOARD_SIZE + col)
            })}
          </div>
        )})}
    </div>
  )
}

/**
 * interface that represents the state of the <Game /> Component
 * 代表游戏状态的接口
 */
interface GameState {
  history: {
    squares: Array<string>,
    coords?: number[]
  }[],
  step: number ,xIsNext: boolean
}

/**
 * Class Component represents the Game app
 * 代表 整个游戏 的 类组件
 */
class Game extends React.Component<{},
  GameState> {
  // init game state
  // 初始化 游戏组件状态
  state: GameState = {
    history: [{
      squares: Array<string>(9).fill('')
    }],
    step: 0,
    xIsNext: true
  };

  /**
   * Function to handle click events
   * 用来处理鼠标点击的函数
   *
   * @param i The number of clicked square 被点击的格子的编号
   * @returns no return
   */
  handleClick = (i: number) => {
    // slice the altered future to keep timeline sane
    // 剪掉已经被覆盖的记录，保持时间线正常
    const history = this.state.history.slice(0, this.state.step + 1);

    const current = history[this.state.step];
    const squares = current.squares.slice();
    const xIsNext = this.state.xIsNext;
    if (calculateWinner(squares) || squares[i]) return;
    squares[i] = xIsNext? 'X': 'O';
    this.setState({
      history: history.concat({squares, coords: calculateCoordinate(i)}),
      step: history.length,
      xIsNext: !xIsNext
    });
  };
  /**
   * Function to jump back to a specified step in the history
   * 用来 跳回指定的步数 的函数
   * @param step the move you want to jump back
   */
  jumpTo = (move: number) => {
    this.setState({
      step: move,
      xIsNext: (move % 2 === 0)
    })
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.step];
    const winner = calculateWinner(current.squares);
    const nextPlayer = this.state.xIsNext ? 'X': 'O';
    const status = winner ? ('Winner is ' + winner + '!') : ('Next Player is ' + nextPlayer);

    // Game history
    const moves = history.map(
      /**
       * Function to render time jump buttons
       * 用来 渲染回溯按钮 的 函数
       *
       * @param move 步数
       * @returns html Button
       */
      (it, move) => {
        const description = move? 'Go to move #' + move + " at (" + it.coords!.join(', ') + ")": 'Go to start';
        return (
          <li>
            <History key={move} description={description} />
          </li>
        )
      });
    return (
      <div className="game">
        <div className="game-board">
          <Board squares={ current.squares } onClick={ this.handleClick }/>
        </div>
        <div className="game-info">
          <div>{ status }</div>
          <ol>{ moves }</ol>
        </div>
      </div>
    );
  }
}

/**
 * Function to calculate the winner
 * 用于 计算赢家 的 函数
 *
 * @param squares 当前的棋盘
 * @returns the winner's symbol or null 赢家的棋子或者空值
 */
const calculateWinner = (squares: Array<string>) => {
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
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a];
    }
  }
  return null;
}

/**
 * Function to calculate square coordinates by it's number
 * 用于计算 被点击格子的坐标 的函数
 *
 * @param i number of square 格子的编号
 * @returns `coords?` square coordinates 格子的坐标
 */
const calculateCoordinate = (i: number) => {
  const coordinateMap = new Map<number, number[]>()
  // far upper-left corner as (1, 1)
  // 以最左上一格为(1, 1)坐标
  coordinateMap.set(0, [1, 1]).set(1, [2, 1]).set(2, [3, 1])
                .set(3, [1, 2]).set(4, [2, 2]).set(5, [3, 2])
                .set(6, [1, 3]).set(7, [2, 3]).set(8, [3, 3]);
  let coords = coordinateMap.get(i);
  return coords;
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);


