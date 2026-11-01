export interface ReportAnswer {
    readonly answer: string;
    readonly isCorrect: boolean;
    readonly isSelected: boolean;
}

export interface ReportItem {
    readonly question: string;
    readonly answers: ReportAnswer[];
}

export interface QuizReport {
    readonly items: ReportItem[];
}