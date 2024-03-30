import { BigMoneyGame, Answer } from "../types/types";

export const init = (): BigMoneyGame => {
  return {
    round: 1,
    answers1: [],
    answers2: [],
  };
};

export const correctAnswer = (
  game: BigMoneyGame,
  answer: Answer,
  questionLength: number
): BigMoneyGame => {
  let answers = game[`answers${game.round}`];
  let round = game.round;
  if (answers.length === questionLength) {
    if (game.round === 2) {
      return game;
    }
    round = 2;
    answers = game.answers2;
  }
  if (round === 2) {
    if (game.answers1[answers.length].answer === answer.answer) {
      return game;
    }
  }
  answers.push(answer);
  return {
    ...game,
    round,
    [`answers${round}`]: answers,
  };
};

export const getQuestionNumber = (
  game: BigMoneyGame,
  questionLength: number
): number => {
  return game[`answers${game.round}`].length < questionLength
    ? game[`answers${game.round}`].length
    : 0;
};

export const getTotals = (game: BigMoneyGame): [number, number] => {
  let round1Total = 0;
  let round2Total = 0;
  game.answers1.forEach((answer) => (round1Total += answer.count));
  game.answers2.forEach((answer) => (round2Total += answer.count));
  return [round1Total, round2Total];
};
