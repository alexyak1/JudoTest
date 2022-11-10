import React from 'react';
import '../quiz.css';

function VoteTechnique({voteСandidate}) {
    return (
        <div className='answers'>
            {voteСandidate.map(technique => (
                <p className='answer'>{technique}</p>
            ))}
        </div>
    );
}

export {VoteTechnique};