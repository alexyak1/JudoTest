import React from "react";
import BeltSelector from "../components/Test/selectBelt"
import ProgressBar from "../components/Test/progressBar"
import { useBeltWithUrl, usePageTracking, trackBeltAction } from "../hooks/useBeltWithUrl";
import { useAuth } from "../hooks/useAuth";
import { apiRequest } from "../utils/api";
import { useSeo } from "../utils/seo";
import { QUIZ_COPY, QUIZ_PATHS, QUIZ_ALTERNATES } from "../i18n/quizCopy";
import { storeLang } from "../i18n/language";
import '../quiz.css';
import { API_BASE } from "../utils/apiBase";

// Import technique media at build time. Each question loads one technique, so
// the video is worth autoplaying here -- recognising a throw depends on motion.
const posters = require.context('./judo_techniques', true, /\.webp$/);
const videos = require.context('./judo_techniques', true, /\.mp4$/);

const resolve = (ctx, path) => {
	try {
		return ctx(path);
	} catch (e) {
		return null;
	}
};

export default function Test({ lang = 'en' }) {
	const { useState, useEffect, Fragment } = React
	const baseUrl = API_BASE;
	const copy = QUIZ_COPY[lang] || QUIZ_COPY.en;

	// Use URL-based belt selection with analytics tracking
	const { belt: urlBelt } = useBeltWithUrl('yellow', 'quiz');

	// Track page views with belt information
	usePageTracking('quiz', urlBelt);

	useSeo({
		title: copy.seo.title,
		description: copy.seo.description,
		path: QUIZ_PATHS[lang] || QUIZ_PATHS.en,
		lang: copy.lang,
		alternates: QUIZ_ALTERNATES,
	});

	async function getTechniques(beltColor) {
		let data;
		
		if (beltColor === 'all') {
			// Fetch techniques from all belts
			const allBelts = ['yellow', 'orange', 'green', 'blue', 'brown'];
			const allTechniques = [];
			
			for (const belt of allBelts) {
				const response = await fetch(`${baseUrl}/techniques?belt=${belt}`);
				const beltData = await response.json();
				allTechniques.push(...beltData);
			}
			
			data = allTechniques;
		} else {
			// Fetch techniques from specific belt
			const response = await fetch(`${baseUrl}/techniques?belt=${beltColor}`);
			data = await response.json();
		}

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
			const base = `./${techniques[i].belt}/${techniques[i].name}`;
			quizQuestions.push({
				'image': resolve(posters, `${base}.webp`),
				'video': resolve(videos, `${base}.mp4`),
				'correctAnswer': techniques[i].name,
				'correctAnswerId': i,
				'answers': answers.sort(() => Math.random() - 0.5)
			})
		}
		return quizQuestions
	}

	function getRandom3Int(max, exeption) {
		let first = Math.floor(Math.random() * max)
		first = exeption === first ? Math.floor(Math.random() * max) : first
		let second = Math.floor(Math.random() * max)
		second = second === first || second === exeption ? Math.floor(Math.random() * max) : second
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
					{question.video ? (
						<video
							key={question.video}
							className="img-technique"
							src={question.video}
							poster={question.image}
							autoPlay
							muted
							loop
							playsInline
							aria-label="Judo technique"
						/>
					) : (
						<img
							key={question.image}
							className="img-technique"
							src={question.image}
							alt="Judo technique">
						</img>
					)}
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
		const [resultSaved, setResultSaved] = useState(false)
		const [selectedBelt, setSelectedBelt] = useState(urlBelt)
		const { isAuthenticated, refreshUser } = useAuth()

		useEffect(() => {
			setAnswerStatus(null)
		}, [questionIndex])

		useEffect(() => {
			if (answerStatus) {
				setCorrectAnswerCount(count => count + 1)
			}
		}, [answerStatus])

		useEffect(() => {
			if (quizComplete && isAuthenticated && quizQuestions.length > 0) {
				apiRequest('/user/quiz-results', {
					method: 'POST',
					body: JSON.stringify({
						belt: selectedBelt,
						total_questions: quizQuestions.length,
						correct_answers: correctAnswerCount,
					}),
				}).then(() => { setResultSaved(true); refreshUser(); })
				  .catch(() => {});
			}
		}, [quizComplete])

		// Auto-start quiz if belt is specified in URL
		useEffect(() => {
			if (urlBelt && urlBelt !== 'yellow' && questionIndex === null) {
				setBeltColor(urlBelt);
			}
		}, [urlBelt]);

		async function setBeltColor(childdata) {
			// Track belt selection for quiz
			trackBeltAction('quiz_belt_selection', 'quiz', childdata);
			setSelectedBelt(childdata);

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
			setResultSaved(false)
		}

		if (questionIndex == null) {
			return (
				<div className='quiz-landing'>
					<div className="quiz-header">
						<h1 className="quiz-title">
							<span className="gradient-text-1">{copy.titleA}</span>
							<span className="gradient-text-2">{copy.titleB}</span>
						</h1>
						<p className="quiz-description">{copy.tagline}</p>
					</div>
					<BeltSelector setBeltColor={setBeltColor}></BeltSelector>

					<section className="quiz-seo">
						<h2>{copy.howHeading}</h2>
						<p>{copy.howBody1}</p>
						<p>
							{copy.howBody2Pre}
							<a href="/login">{copy.howBody2Link}</a>
							{copy.howBody2Post}
						</p>

						<h2>{copy.beltsHeading}</h2>
						<ul className="quiz-seo-list">
							{copy.belts.map(({ belt, count, summary, examples }) => (
								<li key={belt}>
									<strong>{belt} &mdash; {count} {copy.beltUnit}.</strong> {summary}: {examples}.
								</li>
							))}
						</ul>
						<p>
							{copy.allBeltsPre}
							<strong>{copy.allBeltsStrong}</strong>
							{copy.allBeltsPost}
							<a href="/techniques">{copy.techniquesLink}</a>
							{copy.allBeltsMid}
							<a href="/kata">{copy.kataLink}</a>
							{copy.allBeltsEnd}
						</p>

						<h2>{copy.faqHeading}</h2>
						<dl className="quiz-seo-faq">
							{copy.faq.map(({ q, a }) => (
								<Fragment key={q}>
									<dt>{q}</dt>
									<dd>{a}</dd>
								</Fragment>
							))}
						</dl>

						{/* A crawlable link between the two translations. hreflang tells
						    Google they are a pair; this lets a person switch too.

						    Following it records the choice, which is what stops the
						    detection at "/" from undoing it: a Swedish browser that
						    picks English here has to keep getting English. The write
						    is synchronous, so it lands before the link navigates. */}
						<p className="quiz-seo-lang">
							<a
								href={lang === 'sv' ? QUIZ_PATHS.en : QUIZ_PATHS.sv}
								onClick={() => storeLang(lang === 'sv' ? 'en' : 'sv')}
							>
								{copy.otherLangLabel}
							</a>
						</p>
					</section>
				</div >
			)
		}

		return (
			<div className="quiz app">
				{quizComplete ? (
					<Fragment>
						<h1>Quiz complete!</h1>
						<p>You answered {correctAnswerCount} questions correctly (out of a total {quizQuestions.length} questions)</p>
						{isAuthenticated ? (
							resultSaved && <p style={{color: '#4ade80', fontSize: '0.9rem'}}>Result saved to your account</p>
						) : (
							<p style={{fontSize: '0.9rem'}}>
								<a href="/login" style={{color: '#667eea'}}>Log in</a> to save your quiz results
							</p>
						)}
					</Fragment>
				) : (
					<Fragment>
						<ProgressBar currentQuestion={questionIndex} totalQuestionsCount={quizQuestions.length} />
						<Question
							key={questionIndex}
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
		<div>
			<Quiz> </Quiz>
		</div>
	)
}