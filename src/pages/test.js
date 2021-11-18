import React, { useState } from "react";

export default function Test() {
	const questions = [
		{
			questionText: 'What is the technick on picture?',
			answerOptions: [
				{ answerText: 'o-soto', isCorrect: false },
				{ answerText: 'Kuzure-keso', isCorrect: false },
				{ answerText: 'Morote-seonagi', isCorrect: true },
				{ answerText: 'Haray-goshi', isCorrect: false },
			],
		},
		{
			questionText: 'What is the technick on picture?',
			answerOptions: [
				{ answerText: 'uchi-mata', isCorrect: false },
				{ answerText: 'haray-goshi', isCorrect: true },
				{ answerText: 'thai-otoshi', isCorrect: false },
				{ answerText: 'o-goshi', isCorrect: false },
			],
		},
		{
			questionText: 'What is the technick on picture?',
			answerOptions: [
				{ answerText: 'ippon-seo-nagi', isCorrect: true },
				{ answerText: 'morote-seonagi', isCorrect: false },
				{ answerText: 'o-uchi-gari', isCorrect: false },
				{ answerText: 'ko-uchi-gari', isCorrect: false },
			],
		},
		{
			questionText: 'What is the technick on picture?',
			answerOptions: [
				{ answerText: 'sasai-tsuri-komi-ashi', isCorrect: false },
				{ answerText: 'okuri-ashi-barai', isCorrect: false },
				{ answerText: 'de-ashi-haray', isCorrect: false },
				{ answerText: 'ko-uchi-makikomi', isCorrect: true },
			],
		},
	];

	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [showScore, setShowScore] = useState(false);
	const [score, setScore] = useState(0);

	const handleAnswerOptionClick = (isCorrect) => {
		if (isCorrect) {
			setScore(score + 1);
		}

		const nextQuestion = currentQuestion + 1;
		if (nextQuestion < questions.length) {
			setCurrentQuestion(nextQuestion);
		} else {
			setShowScore(true);
		}
	};
	return (
		<div className='app'>
			{showScore ? (
				<div className='score-section'>
					You scored {score} out of {questions.length}
				</div>
			) : (
				<>
					<div className='question-section'>
						<div className='question-count'>
							<span>Question {currentQuestion + 1}</span>/{questions.length}
						</div>
						<div className='question-text'>{questions[currentQuestion].questionText}</div>
					</div>
					<div className='answer-section'>
						{questions[currentQuestion].answerOptions.map((answerOption) => (
							<button className={`${answerOption.isCorrect ? 'correct' : 'incorrect'}`} onClick={() => handleAnswerOptionClick(answerOption.isCorrect)}>
                                {answerOption.answerText}
                            </button>
						))}
					</div>
				</>
			)}
		</div>
	);
}