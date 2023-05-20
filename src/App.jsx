import { useState } from 'react'
import './App.css'

function forwardSubstitution(A, b) {
  const n = A.length;
  const x = new Array(n).fill(0);

  for (let i = 0; i < n; i++) {
    x[i] = b[i];

    for (let j = 0; j < i; j++) {
      x[i] -= A[i][j] * x[j];
    }

    x[i] /= A[i][i];
  }

  return x;
}

function backwardSubstitution(A, b) {
  const n = A.length;
  const x = new Array(n).fill(0);

  for (let i = n - 1; i >= 0; i--) {
    x[i] = b[i];

    for (let j = i + 1; j < n; j++) {
      x[i] -= A[i][j] * x[j];
    }

    x[i] /= A[i][i];
  }

  return x;
}

function gaussElimination(A, b) {
  const n = A.length;

  // Augmented matrix [A|b]
  const augmentedMatrix = [];
  for (let i = 0; i < n; i++) {
    augmentedMatrix.push([...A[i], b[i]]);
  }

  for (let i = 0; i < n; i++) {
    // Pivot row selection
    let maxRowIndex = i;
    let maxAbsValue = Math.abs(augmentedMatrix[i][i]);

    for (let j = i + 1; j < n; j++) {
      const absValue = Math.abs(augmentedMatrix[j][i]);
      if (absValue > maxAbsValue) {
        maxAbsValue = absValue;
        maxRowIndex = j;
      }
    }

    // Swap rows
    [augmentedMatrix[i], augmentedMatrix[maxRowIndex]] = [
      augmentedMatrix[maxRowIndex],
      augmentedMatrix[i],
    ];

    // Elimination
    for (let j = i + 1; j < n; j++) {
      const ratio = augmentedMatrix[j][i] / augmentedMatrix[i][i];
      for (let k = i; k < n + 1; k++) {
        augmentedMatrix[j][k] -= ratio * augmentedMatrix[i][k];
      }
    }
  }

  // Back substitution
  const x = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    x[i] = augmentedMatrix[i][n];

    for (let j = i + 1; j < n; j++) {
      x[i] -= augmentedMatrix[i][j] * x[j];
    }

    x[i] /= augmentedMatrix[i][i];
  }

  return x;
}


function App() {
  const [A, setA] = useState([[1, 2,1,-1], [3, 2,4,4], [4, 4,3,4], [2, 0,1,5]]);
  const [b, setB] = useState([5,16,22,15]);
  const [x, setX] = useState([]);
  const [numArrays, setNumArrays] = useState(A.length);
  const [numColumns, setNumColumns] = useState(A[0].length);

  const handleButtonClick = (func) => {
    let newX = [];
    if (func === 'forward') {
      newX = forwardSubstitution(A, b);
    } else if (func === 'backward') {
      newX = backwardSubstitution(A, b);
    } else if (func === 'gauss') {
      newX = gaussElimination(A, b);
    }
    setX(newX);
  };

  const handleNumArraysChange = (delta) => {
    const newNumArrays = Math.max(1, numArrays + delta);
    const newA = [...A];
    while (newA.length < newNumArrays) {
      newA.push(new Array(numColumns).fill(0));
    }
    while (newA.length > newNumArrays) {
      newA.pop();
    }
    setA(newA);
    setNumArrays(newNumArrays);
  };

  const handleNumColumnsChange = (delta) => {
    const newNumColumns = Math.max(1, numColumns + delta);
    const newA = [...A];
    for (let i = 0; i < newA.length; i++) {
      while (newA[i].length < newNumColumns) {
        newA[i].push(0);
      }
      while (newA[i].length > newNumColumns) {
        newA[i].pop();
      }
    }
    setA(newA);
    setNumColumns(newNumColumns);
  };

  // const parseMatrixInput = (input) => {
  //   const rows = input.trim().split('\n');
  //   const matrix = rows.map(row => row.split(',').map(Number));
  //   return matrix;
  // };

  const handleVectorValueChange = (event) => {
    const input = event.target.value;
    const numberArray = input.replace(/[^0-9,-]/g, "").split(",").map((num) => parseFloat(num));
    setB(numberArray);
  };

  return (
    <div className="card">
      <p>
        Gauss Elimination Algorithm - Assignment 2
      </p>
      <div>
        <label htmlFor="matrixA">Matrix A:</label>
        <div>
          {A.map((row, i) => (
            <div key={i}>
              {row.map((value, j) => (
                <input key={j} type="number" value={value} onChange={(e) => {
                  const newA = [...A];
                  newA[i][j] = Number(e.target.value);
                  setA(newA);
                }} />
              ))}
            </div>
          ))}
        </div>
        <div>
          <label htmlFor="numArrays">Number of row:</label>
          <button onClick={() => handleNumArraysChange(-1)}>-</button>
          <span>{numArrays}</span>
          <button onClick={() => handleNumArraysChange(1)}>+</button>
        </div>
        <div>
          <label htmlFor="numArrays">Number of column:</label>
          <button onClick={() => handleNumColumnsChange(-1)}>-</button>
          <span>{numColumns}</span>
          <button onClick={() => handleNumColumnsChange(1)}>+</button>
        </div>
      </div>
      <div>
        <label htmlFor="vectorB">Vector b:</label>
        <input type="text" id="vectorB" value={b} onChange={handleVectorValueChange}/>
      </div>
      <div className="row">
        <div className="col">
          <button onClick={() => handleButtonClick('forward')}>Calculate x using forwardSubstitution</button>
        </div>
        <div className="col">
          <button onClick={() => handleButtonClick('backward')}>Calculate x using backwardSubstitution</button>
        </div>
        <div className="col">
          <button onClick={() => handleButtonClick('gauss')}>Calculate x using gaussElimination</button>
        </div>
      </div>
      {x.length > 0 && (
        <div className="output">
          <label htmlFor="outputX">Output x:</label>
          <div id="outputX">{JSON.stringify(x)}</div>
        </div>
      )}
    </div>
  );
}

export default App
