import React from 'react';
// import Question from 'quiz.js'

const title = "Junior Europ Championship"
const date = "12 Aug 2022"

const Home = () => {
  return (
    <div className="homePageText app">

      <div>
        <h2>{title}</h2>
        <p>{date}</p>
        <img
          className="img-technique"
          src={require("./judo_techniques/yellow/O-goshi.gif").default}
          alt="technique"
        />
      </div>



      <h1 className="homePageText">Welcome 柔道家</h1>
      <p className="homePageText">Juudouka, 柔 juu (mjuk) + 道 dou (väg) + 家 ka (person).</p>
      <p className="homePageText">In this website you will find information about judo which should help you at exam for next belt</p>
      <p className="homePageText">Under Quiz tab you can practice in judo quiz</p>
      <p className="homePageText">Techniques tab collected all techniques which needed for selected belt</p>
    </div >
  );
};

export default Home;
