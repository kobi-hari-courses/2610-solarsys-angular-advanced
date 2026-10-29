import { Question } from "./models/question.model";

export function correctAnswersCount(questions: Question[], answers: number[]): number {
    const correctAnswers = answers.filter((a, i) => a === questions[i].correctAnswerIndex);
    return correctAnswers.length;
}