import { DueCardsSummary } from "./index";

export interface DailyStudyData {
    dueCards: any[];
    summary: DueCardsSummary;
    stats: {
        totalCards: number;
        newCards: number;
        learningCards: number;
        matureCards: number;
        dueToday: number;
        retentionRate: number;
    };
    activeDecksWithDue: Array<{
        deck: any;
        dueToday: number;
        totalDue: number;
    }>;
}