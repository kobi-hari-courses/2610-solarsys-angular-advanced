import { Question } from "./models/question.model";
import type { QuizReport, ReportItem, ReportAnswer } from "./models/report.model";

export function correctAnswersCount(questions: Question[], answers: number[]): number {
    const correctAnswers = answers.filter((a, i) => a === questions[i].correctAnswerIndex);
    return correctAnswers.length;
}

export function buildReport(questions: Question[], answers: number[]): QuizReport {
    const items: ReportItem[] = answers.map((item, i) => ({
        question: questions[i].caption, 
        answers: questions[i].answers.map((a, index) => ({
            answer: questions[i].answers[index], 
            isCorrect: questions[i].correctAnswerIndex === index, 
            isSelected: index === item
        }))
    }));

    return {
        items
    }
}