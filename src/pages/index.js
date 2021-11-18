import React from 'react';
const val = 4
const number = 5
function sum (a, b) {
  return a+b;
}
const Home = () => {
  return (
    <div>
      <h1>Welcome to our website!</h1>
      <table>{sum(val, number)}</table>
    </div>
  );
};

export default Home;
