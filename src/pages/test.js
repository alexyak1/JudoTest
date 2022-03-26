import React from "react";
import BeltSelector from "../components/Test/selectBelt"
import '../test.css';

export default function Test() {
	const { useState, useEffect, Fragment } = React

	const Question = ({ question, setAnswerStatus }) => {
		const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null)

		useEffect(() => {
			if (selectedAnswerIndex != null) {
				setAnswerStatus(selectedAnswerIndex === question.correctAnswerIndex)
			}
		}, [selectedAnswerIndex, question.correctAnswerIndex, setAnswerStatus])

		useEffect(() => {
			setSelectedAnswerIndex(null)
		}, [question])

		const getClasses = (index) => {
			let classes = []
			if (selectedAnswerIndex != null) {
				if (selectedAnswerIndex === index) {
					classes.push("selected")
				}
				if (index === question.correctAnswerIndex) {
					if (selectedAnswerIndex === index) {
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
				<div className="questionText">{question.question}</div>
				<img src={question.image} alt="Judo technique"></img>
				{/* <div className="questionText">{question.image}</div> */}
				<div className="answers">
					{question.answers.map((answer, index) => {
						return <div key={index} className={`answer ${getClasses(index)}`} onClick={() => selectedAnswerIndex == null && setSelectedAnswerIndex(index)}>{answer}</div>
					})}
				</div>
			</div>
		)
	}

	const ProgressBar = ({ currentQuestionIndex, totalQuestionsCount }) => {
		const progressPercentage = (currentQuestionIndex / totalQuestionsCount) * 100

		return <div className="progressBar">
			<div className="text">{currentQuestionIndex} answered ({totalQuestionsCount - currentQuestionIndex} remaining)</div>
			<div className="inner" style={{ width: `${progressPercentage}%` }} />
		</div>
	}

	const Quiz = ({ questions }) => {
		const [questionIndex, setQuestionIndex] = useState(null)
		const [answerStatus, setAnswerStatus] = useState(null)
		const [correctAnswerCount, setCorrectAnswerCount] = useState(0)
		const [quizComplete, setQuizComplete] = useState(false)
		const [beltColor, setData] = useState('');

		const childToParent = (childdata) => {
			setData(childdata);
		}

		useEffect(() => {
			setAnswerStatus(null)
		}, [questionIndex])

		useEffect(() => {
			if (answerStatus) {
				setCorrectAnswerCount(count => count + 1)
			}
		}, [answerStatus])

		const onNextClick = () => {
			if (questionIndex === questions.length - 1) {
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
					<button className="start" onClick={onNextClick}>Start</button>
					<BeltSelector childToParent={childToParent}></BeltSelector>
					<p>color is {beltColor}</p>
				</div>
			)
		}

		return (
			<div className="quiz">
				{quizComplete ? (
					<Fragment>
						<h1>Quiz complete!🥳</h1>
						<p>You answered {correctAnswerCount} questions correctly (out of a total {questions.length} questions)</p>
					</Fragment>
				) : (
					<Fragment>
						<ProgressBar currentQuestionIndex={questionIndex} totalQuestionsCount={questions.length} />
						<Question
							question={questions[questionIndex]}
							setAnswerStatus={setAnswerStatus}
						/>
						{answerStatus != null && (
							<div>
								<div className="answerStatus">{!!answerStatus ? "Correct! :)" : "Your answer was incorrect :("}</div>
								<button className="next" onClick={onNextClick}>
									{questionIndex === questions.length - 1 ? "See results of this quiz" : "Next Question ->"}
								</button>
							</div>
						)}
					</Fragment>
				)}

				{questionIndex != null && <button className="restart" onClick={onRestartClick}>Restart quiz</button>}
			</div>
		)
	}

	var buildQuestion = 'What technique in a build?'
	const questions = [
		{
			question: buildQuestion,
			image: 'https://drive.google.com/uc?export=view&id=1p3JuGkd533lBv4lrzzUD4BibXy4Jjinz',
			answers: ["O-uchi-gari", "O-soto-otoshi", "Koshi-guruma", "Mune-gatame"],
			correctAnswerIndex: 1,
			color: 'yellow',
		},
		{
			question: buildQuestion,
			image: 'https://drive.google.com/uc?export=view&id=1APzyii2ibDU82E_OZXilW3fl7_KZMFSr',
			answers: ["O-goshi", "Ko-soto-gari", "O-uchi-gari", "Koshi-guruma"],
			correctAnswerIndex: 2,
			color: 'yellow',
		},
		{
			question: buildQuestion,
			image: 'https://drive.google.com/uc?export=view&id=1zD67DXdh8AqLsdXXuuoiTcU7z0fkn3Gz',
			answers: ["Tsuri-komi-goshi", "Kubi-nage", "O-soto-gari", "Harai-goshi"],
			correctAnswerIndex: 3,
			color: 'orange',
		},
		{
			question: buildQuestion,
			image: 'https://drive.google.com/uc?export=view&id=10v5XIdURJXmAFAQC-Mg65RbsFfHPKLWT',
			answers: ["Kubi-nage", "Morote-seoi-nage", "Koshi-guruma", "Kata-juji-jime"],
			correctAnswerIndex: 0,
			color: 'orange',
		},
	]

	return (
		<Quiz questions={questions}> </Quiz>
	)
}