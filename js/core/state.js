import { EmailsDatabase } from '../database/emails.js';

export const gameState = {
    currentDay: 1,
    time: "21:34",
    emails: [...EmailsDatabase], 
    unlockedFiles: [],
    historyLogs: [],
    insideObservatory: []
};