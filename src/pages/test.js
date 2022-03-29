import { render } from "@testing-library/react";
import React from "react";
import BeltSelector from "../components/Test/selectBelt"
import '../test.css';

export default function Test() {
	const { useState, useEffect, Fragment } = React
	const quizQuestions = [];

	function getTechniques(beltColor) {
		fetch("http://localhost:8787/techniques?belt=" + beltColor)
			.then(response => {
				if (!response.ok) {
					throw new Error(response.statusText)
				}
				response.json()
			})
			.then(data => {
				quizQuestions = setTechniques(data);
			})
			.catch(error => {
				console.error("Error fething data", error)
				return (<>XYU</>)
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
			if (selectedAnswer != null) {
				setAnswerStatus(selectedAnswer === question.correctAnswer)
			}
		}, [selectedAnswer, question.correctAnswer, setAnswerStatus])

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

		return (
			<div className="question">
				<div className="questionText">What is technique on the picture?</div>
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
	}

	const ProgressBar = ({ currentQuestion, totalQuestionsCount }) => {
		const progressPercentage = (currentQuestion / totalQuestionsCount) * 100

		return <div className="progressBar">
			<div className="text">{currentQuestion} answered ({totalQuestionsCount - currentQuestion} remaining)</div>
			<div className="inner" style={{ width: `${progressPercentage}%` }} />
		</div>
	}

	const Quiz = () => {
		const [questionIndex, setQuestionIndex] = useState(null)
		const [answerStatus, setAnswerStatus] = useState(null)
		const [correctAnswerCount, setCorrectAnswerCount] = useState(0)
		const [quizComplete, setQuizComplete] = useState(false)
		const [beltColor, setData] = useState('');
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
			setData(childdata);
			let quizQuestions = getTechniques(childdata)
			if (quizQuestions.length > 0) {
				console.log('not here')
				setQuizQuestions(quizQuestions)
				setTimeout(() => {
					onNextClick()
				}, 50);
			} else {
				render(
					<div class="alert-message">
						<h1 class="alert">Something went wrong</h1>
						<p>Could not load judo techniques.
							We have a problem with DataBase
						</p>
					</div>
				)
			}
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
					<p>Celect belt color to check your knowlage about judo techniques</p>
					<BeltSelector setBeltColor={setBeltColor}></BeltSelector>
				</div >
			)
		}
		console.log("setBeltColor")
		console.log(setBeltColor)
		if (setBeltColor == '') {
			console.log('shouldnt be here')
			return (<><p>problem</p></>)
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
								<div className="answerStatus">{!!answerStatus ? "Correct! :)" : "Your answer was incorrect :("}</div>
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