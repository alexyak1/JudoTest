import React from "react";
import BeltSelector from "../components/Test/selectBelt"
import ProgressBar from "../components/Test/progressBar"
import '../quiz.css';

export default function Test() {
	const { useState, useEffect, Fragment } = React

	async function getTechniques(beltColor) {
		const response = await fetch("https://quiz-judo.herokuapp.com/techniques?belt=" + beltColor)
		const data = await response.json()

		return setTechniques(data)
	}

	function setTechniques(techniques) {
		let quizQuestions = [];
		for (var i = 0; i < techniques.length; i++) {
			let threeRandomNumbers = getRandom3Int(techniques.length, i)
			const answers = [
				techniques[threeRandomNumbers[0]].name,
				techniques[threeRandomNumbers[1]].name,
				techniques[threeRandomNumbers[2]].name,
				techniques[i].name
			]
			quizQuestions.push({
				'image': './judo_techniques/' + techniques[i].belt + '/' + techniques[i].name + '.gif',
				'correctAnswer': techniques[i].name,
				'correctAnswerId': i,
				'answers': answers.sort(() => Math.random() - 0.5)
			})
		}
		return quizQuestions
	}

	function getRandom3Int(max, exeption) {

		let first = Math.floor(Math.random() * max)
		first = exeption === first ?  Math.floor(Math.random() * max) : first
		let second = Math.floor(Math.random() * max)
		second = second === first || second === exeption ?  Math.floor(Math.random() * max) : second
		let third = Math.floor(Math.random() * max)
		third = third === first || third === second || third === exeption ? Math.floor(Math.random() * max) : third

		return [first, second, third]
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
					<img
						className="img-technique"
						src={require(`${question.image}`)}
						alt="Judo technique">
					</img>
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

		async function setBeltColor(childdata) {
			let quizQuestions = await getTechniques(childdata)
			setQuizQuestions(quizQuestions)
			onNextClick()
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
				<div className='app'>
					<h1>Start judo quiz</h1>
					<p>Select belt color to check your knowledge about judo techniques.</p>
					<BeltSelector setBeltColor={setBeltColor}></BeltSelector>
				</div >
			)
		}

		return (
			<div className="quiz app">
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