import React from 'react';
import { VoteTechnique } from '../components/VoteTechnique';
import YoutubeEmbed from '../components/YoutubeEmbed';

const title = "KRAKOW WORLD CHAMPIONSHIPS VETERANS"
const date = "2022 Poland September 8-11"
const embedId = "eNS8lVEuFEw"

const quizQuestions = ['tomoe-nage', 'o-soto-o-toshi', 'kuzure-keso-gatame', 'ippon-seo-nage']


const Home = () => {
  return (
    <div>
      <h2 className='title'>{title}</h2>
      <p className='title'>{date}</p>

      <YoutubeEmbed embedId={embedId} />
      <h4 className='title'>Vote which thow it was</h4>
      <VoteTechnique voteСandidate={quizQuestions} />
    </div >
  );
};

export default Home;
