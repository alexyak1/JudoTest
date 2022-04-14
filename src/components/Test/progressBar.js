

import React from "react";

export default function ProgressBar({ currentQuestion, totalQuestionsCount }) {
    const progressPercentage = (currentQuestion / totalQuestionsCount) * 100

    return <div className="progressBar">
        <div className="text">{currentQuestion} answered ({totalQuestionsCount - currentQuestion} remaining)</div>
        <div className="inner" style={{ width: `${progressPercentage}%` }} />
    </div>
}
