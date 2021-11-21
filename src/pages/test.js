import React, { useState, useEffect } from "react";
import BeltSelector from "../components/Test/selectBelt"

export default function Test() {
	const questionText = 'What is the technick on picture?';
	const [pageStates, setPageStates] = useState({
		"selectBelt": true,
		"color": "yellow",
	})
	const url = 'http://localhost:8787/techniques?belt=' + pageStates.color;

    const [items, setItems] = useState([]);
    const [error, setError] = useState([]);
	useEffect(() => {
		fetch(url)
		.then(res => res.json())
		.then(
			(result) => {
				setItems(result)
			},
			(error) => {
				setError(error);
			}
		)
	}, [])

	const answers = [];
	for (let i=0; i < 4; i++) {
		answers.push(items[Object.keys(items)[Math.floor(Math.random() * items.length-1) + 1]])
	}

	const [currentQuestion, setCurrentQuestion] = useState(0);
	const [score, setScore] = useState(0);


	const handleAnswerOptionClick = (isCorrect) => {
		if (isCorrect) {
			setScore(score + 1);
		}

		const nextQuestion = currentQuestion + 1;
		if (nextQuestion < items.length) {
			setCurrentQuestion(nextQuestion);
		} else {
			setShowScore(true);
		}
	};

	const [showScore, setShowScore] = useState(false);

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
					You scored {score} out of {items.length}
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
								<span>Question {currentQuestion + 1}</span>/{items.length}
								<span>For {pageStates.color} belt</span>
							</div>
							<div className='question-text'>
								{questionText}

							</div>
						</div>
						<div className='answer-section'>
							{answers.map((answerOption) => (
								<button onClick={() => handleAnswerOptionClick(answerOption.isCorrect)}>
									{answerOption.name}
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