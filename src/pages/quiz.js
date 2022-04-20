import React from "react";
import BeltSelector from "../components/Test/selectBelt"
import ProgressBar from "../components/Test/progressBar"
import '../test.css';

export default function Test() {
	const { useState, useEffect, Fragment } = React
	let quizQuestions = [];

	function getTechniques(beltColor) {
		quizQuestions.length = 0; //reset quizQuestions before fetch new
		fetch("https://quiz-judo.herokuapp.com/techniques?belt=" + beltColor)
			.then((response) => response.json())
			.then(data => {
				quizQuestions = setTechniques(data);
			})
			.catch(error => {
				console.error("Error fething data", error)
			})
		return quizQuestions
	}
	function setTechniques(techniques) {
		for (var i = 0; i < techniques.length; i++) {
			const start = `file/d/`;
			const end = `/view`;
			const imageId = techniques[i].image_url.split(start)[1].split(end)[0]
			const answers = [
				techniques[getRandomInt(techniques.length)].name,
				techniques[getRandomInt(techniques.length)].name,
				techniques[getRandomInt(techniques.length)].name,
				techniques[i].name
			]
			quizQuestions.push({
				'image': 'https://drive.google.com/uc?export=view&id=' + imageId,
				'correctAnswer': techniques[i].name,
				'correctAnswerId': i,
				'answers': answers.sort(() => Math.random() - 0.5)
			})
		}
		return quizQuestions
	}
	function getRandomInt(max) {
		return Math.floor(Math.random() * max);
	}

	const Question = ({ question, setAnswerStatus }) => {
		const [selectedAnswer, setSelectedAnswer] = useState(null)

		useEffect(() => {
			if (selectedAnswer != null && question != null) {
				setAnswerStatus(selectedAnswer === question.correctAnswer)
			}
		}, [selectedAnswer, setAnswerStatus, question])

		useEffect(() => {
			setSelectedAnswer(null)
		}, [question])

		const getClasses = (answer) => {
			let classes = []
			if (selectedAnswer != null) {
				if (selectedAnswer === answer) {
					classes.push("selected")
				}
				if (answer === question.correctAnswer) {
					if (selectedAnswer === answer) {
						classes.push("correct")
					} else {
						classes.push("incorrect")
					}
				}
			}

			return classes.join(" ")
		}

		if (question) {
			return (
				<div className="question">
					<div className="questionText">What technique is on the picture?</div>
					<img src={question.image} alt="Judo technique"></img>
					<div className="answers">
						{question.answers.map((answer, index) => {
							return <div
								key={index}
								className={`answer ${getClasses(answer)}`}
								onClick={() => selectedAnswer == null && setSelectedAnswer(answer)}>{answer}
							</div>
						})}
					</div>
				</div>
			)
		} else { return (<>Could not load techniques. Please restart the quiz </>) }
	}

	const Quiz = () => {
		const [questionIndex, setQuestionIndex] = useState(null)
		const [answerStatus, setAnswerStatus] = useState(null)
		const [correctAnswerCount, setCorrectAnswerCount] = useState(0)
		const [quizComplete, setQuizComplete] = useState(false)
		const [quizQuestions, setQuizQuestions] = useState([])

		useEffect(() => {
			setAnswerStatus(null)
		}, [questionIndex])

		useEffect(() => {
			if (answerStatus) {
				setCorrectAnswerCount(count => count + 1)
			}
		}, [answerStatus])

		const setBeltColor = (childdata) => {
			let quizQuestions = getTechniques(childdata)
			setQuizQuestions(quizQuestions)
			setTimeout(() => {
				onNextClick()
			}, 600);
		}

		const onNextClick = () => {
			if (questionIndex === quizQuestions.length - 1) {
				setQuizComplete(true)
			} else {
				setQuestionIndex(questionIndex == null ? 0 : questionIndex + 1)
			}
		}

		const onRestartClick = () => {
			setQuizComplete(false)
			setQuestionIndex(null)
			setCorrectAnswerCount(0)
		}


		if (questionIndex == null) {
			return (
				<div className="quiz">
					<h1>Start Quiz</h1>
					<p>This is a simple Judo quiz.</p>
					<p>Select belt color to check your knowledge about judo techniques</p>
					<BeltSelector setBeltColor={setBeltColor}></BeltSelector>
				</div >
			)
		}

		return (
			<div className="quiz">
				{quizComplete ? (
					<Fragment>
						<h1>Quiz complete!🥳</h1>
						<p>You answered {correctAnswerCount} questions correctly (out of a total {quizQuestions.length} questions)</p>
					</Fragment>
				) : (
					<Fragment>
						<ProgressBar currentQuestion={questionIndex} totalQuestionsCount={quizQuestions.length} />
						<Question
							question={quizQuestions[questionIndex]}
							setAnswerStatus={setAnswerStatus}
						/>
						{answerStatus != null && (
							<div>
								<button className="next" onClick={onNextClick}>
									{questionIndex === quizQuestions.length - 1 ? "See results of this quiz" : "Next Question ->"}
								</button>
							</div>
						)}
					</Fragment>
				)}

				{questionIndex != null && <button className="restart" onClick={onRestartClick}>Restart quiz</button>}
			</div>
		)
	}

	return (
		<Quiz> </Quiz>
	)
}