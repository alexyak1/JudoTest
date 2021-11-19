import React, { useState, useEffect } from "react";
import BeltSelector from "../components/Test/selectBelt"

export default function Test() {
	const questionText = 'What is the technick on picture?';
	// const url = 'http://localhost:8787/techniques';
    // const [items, setItems] = useState([]);

	// useEffect(() => {
	// 	fetch(url)
	// 	.then(res => res.json())
	// 	.then(
	// 		(result) => {
	// 			setItems(result)
	// 		},
	// 		(error) => {
	// 			setError(error);
	// 		}
	// 	)
	// }, [])

	const questions = [
		{
			questionText: questionText,
			answerOptions: [
				{ answerText: 'uchi-mata', isCorrect: false },
				{ answerText: 'haray-goshi', isCorrect: false },
				{ answerText: 'thai-otoshi', isCorrect: false },
				{ answerText: 'o-goshi', isCorrect: true },
			],
		},
		{
			questionText: questionText,
			answerOptions: [
				{ answerText: 'uchi-mata', isCorrect: false },
				{ answerText: 'haray-goshi', isCorrect: true },
				{ answerText: 'thai-otoshi', isCorrect: false },
				{ answerText: 'o-goshi', isCorrect: false },
			],
		},
	];

	const [currentQuestion, setCurrentQuestion] = useState(0);
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

	const [showScore, setShowScore] = useState(false);
	const [pageStates, setPageStates] = useState({
		"selectBelt": true,
		"color": "",
	})

    const onchange = (data) => {
		setPageStates(data);
		setShowScore(false);
		setScore(0);
		setCurrentQuestion(0);
    }

	return (
		<div className='app'>
			{showScore ? (
				<div className='score-section'>
					<div>
					You scored {score} out of {questions.length}
					<p>ready to practice more?</p>
					<BeltSelector data={pageStates} onchange={(e) => {onchange(e) }}></BeltSelector>
					</div>

				</div>
			) : (
				<>
				{pageStates.selectBelt ? (
					<BeltSelector data={pageStates} onchange={(e) => {onchange(e) }}></BeltSelector>
					) : (
					<>
						<div className='question-section'>
							<div className='question-count'>
								<span>Question {currentQuestion + 1}</span>/{questions.length}
								<span>For {pageStates.color} belt</span>
							</div>
							<div className='question-text'>
								{questions[currentQuestion].questionText}

							</div>
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
				</>
			)}
		</div>
	);
}