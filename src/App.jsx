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

function solveSystem(H, b) {
  // Function to perform Gauss elimination with partial pivoting
  function gaussElimination(A, b) {
    const n = A.length;

    // Create an array to store the row permutations
    const p = new Array(n);
    for (let i = 0; i < n; i++) {
      p[i] = i;
    }

    // Perform elimination
    for (let i = 0; i < n; i++) {
      // Find pivot row
      let maxIndex = i;
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(A[j][i]) > Math.abs(A[maxIndex][i])) {
          maxIndex = j;
        }
      }

      // Swap rows
      [A[i], A[maxIndex]] = [A[maxIndex], A[i]];
      [b[i], b[maxIndex]] = [b[maxIndex], b[i]];
      [p[i], p[maxIndex]] = [p[maxIndex], p[i]];

      // Eliminate lower rows
      for (let j = i + 1; j < n; j++) {
        const factor = A[j][i] / A[i][i];
        for (let k = i + 1; k < n; k++) {
          A[j][k] -= factor * A[i][k];
        }
        b[j] -= factor * b[i];
        A[j][i] = 0;
      }
    }

    // Back-substitution
    const x = new Array(n);
    for (let i = n - 1; i >= 0; i--) {
      let sum = 0;
      for (let j = i + 1; j < n; j++) {
        sum += A[i][j] * x[j];
      }
      x[i] = (b[i] - sum) / A[i][i];
    }

    // Apply row permutations to x
    const permutedX = new Array(n);
    for (let i = 0; i < n; i++) {
      permutedX[p[i]] = x[i];
    }

    return permutedX;
  }

  // Function to calculate the condition number of a matrix
  function conditionNumber(A) {
    const n = A.length;
    const L = Array.from({ length: n }, () => new Array(n).fill(0));
    const U = Array.from({ length: n }, () => new Array(n).fill(0));

    // Perform LU decomposition
    for (let i = 0; i < n; i++) {
      L[i][i] = 1;
      for (let j = i; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < i; k++) {
          sum += L[i][k] * U[k][j];
        }
        U[i][j] = A[i][j] - sum;
      }
      for (let j = i + 1; j < n; j++) {
        let sum = 0;
        for (let k = 0; k < i; k++) {
          sum += L[j][k] * U[k][i];
        }
        L[j][i] = (A[j][i] - sum) / U[i][i];
      }
    }

    // Calculate the norms of A and A^-1
    const normA = Math.sqrt(Math.max(...A.map(row => row.reduce((sum, val) => sum + val ** 2, 0))));
    const invA = Array.from({ length: n }, () => new Array(n).fill(0));
    for (let i = 0; i < n; i++) {
      const e = new Array(n).fill(0);
      e[i] = 1;
      const y = backwardSubstitution(U, forwardSubstitution(L, e));
      for (let j = 0; j < n; j++) {
        invA[j][i] = y[j];
      }
    }
    const normInvA = Math.sqrt(Math.max(...invA.map(row => row.reduce((sum, val) => sum + val ** 2, 0))));

    return normA * normInvA;
  }

  // Function to calculate the error between x and the true solution
  function calculateError(x) {
    const trueX = new Array(H.length).fill(1);
    const diff = x.map((val, i) => val - trueX[i]);
    const norm = Math.sqrt(diff.reduce((sum, val) => sum + val ** 2, 0));
    return norm;
  }

  // Solve the system
  const x = gaussElimination(H, b);
  const triangleX = calculateError(x);
  const r = conditionNumber(H);
  return { x, triangleX, r };
}


function HbResult() {
  // const [hValue, setHValue] = useState([]);
  // const [bValue, setBValue] = useState([]);
  // const [nValue, setNValue] = useState([]);

  // function generatorHb(n) {
  //   var H = [];
  //   for (let i = 0; i < n; i++) {
  //     H[i] = [];
  //     for (let j = 0; j < n; j++) {
  //       H[i][j] = 1.0 / (j + i + 1);
  //     }
  //   }
  //   setHValue(H);
  
  //   var b = [];
  //   for (let i = 0; i < n; i++) {
  //     b[i] = H[i].reduce((a, b) => a + b, 0);
  //   }
  //   setBValue(b);
  //   return H, b;
  // }

  // useEffect(() => {
  //   for (let i = 0; i < 14; i++) {
  //     let n = [];
  //     n[i] = n + 1;
  //     generatorHb(i);
  //     setNValue(n);
  //   }
  // }, []);

  const H = [
    [1, 1/2, 1/3],
    [1/2, 1/3, 1/4],
    [1/3, 1/4, 1/5]
  ];
  const b = [1, 1, 1];
  let { x, triangleX, r } = solveSystem(H, b);

  return (
    <div className="card">
      <table>
        <thead>
          <tr>
            <th>Hilbert Matrix</th>
            <th>n = 1</th>
            {/* <td>{nValue}</td> */}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>x-unit vector </td>
            <td>{x.map(val => val.toFixed(3)).join(', ')}</td>
          </tr>
          <tr>
            <td>||triangle x||</td>
            <td>{triangleX.toFixed(3)}</td>
          </tr>
          <tr>
            <td>r</td>
            <td>{r.toFixed(3)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
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
    <>
    <div>
      <h1>Linear Equation Solver</h1>
      <HbResult />
    </div>
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
      <div className="footer">
        <p>© 2023 McMaster University -SFWRTECH 4MA3 - Steve Sultan</p>
      </div>
    </div>
    </>
  );
}

export default App
