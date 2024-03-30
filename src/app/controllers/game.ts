import {
  Answered,
  Game,
  CurrentRound,
  TeamsStatus,
  TeamNames,
  Team,
} from "../types/types";

export const LIVES = 3;
const STEAL_LIVES = 1;

const getTeamsStatus = (game: Game): TeamsStatus | undefined => {
  if (!game.currentRound.inControl) {
    return;
  }
  const activeTeamId = game.currentRound.inControl;
  const inActiveTeamId = game.currentRound.inControl === "A" ? "B" : "A";
  const activeTeamName = `team${activeTeamId}`;
  const inActiveTeamName = `team${inActiveTeamId}`;
  const activeTeam = game[`team${activeTeamId}`];
  const inActiveTeam = game[`team${inActiveTeamId}`];
  return {
    activeTeam: {
      id: activeTeamId,
      name: activeTeamName,
      team: activeTeam,
    },
    inActiveTeam: {
      id: inActiveTeamId,
      name: inActiveTeamName,
      team: inActiveTeam,
    },
  };
};

export const newGame = (inControl: TeamNames = "A"): Game => {
  return {
    round: 1,
    teamA: {
      score: 0,
    },
    teamB: {
      score: 0,
    },
    currentRound: initCurrentRound(),
  };
};

export const nextRound = (game: Game, questionLength: number): Game => {
  const teams = getTeamsStatus(game);
  if (
    teams?.activeTeam?.team?.lives === undefined ||
    !game.currentRound.inControl ||
    !game.currentRound.roundComplete
  ) {
    return game;
  }
  if (teams.activeTeam.team.lives > 0) {
    teams.activeTeam.team.score += game.currentRound.total;
  } else {
    teams.inActiveTeam.team.score += game.currentRound.total;
  }

  const newRound = initCurrentRound();
  return {
    ...game,
    round: game.round + (game.round === questionLength ? 0 : 1),
    [teams.activeTeam.name]: {
      score: teams.activeTeam.team.score,
    },
    [teams.inActiveTeam.name]: {
      score: teams.inActiveTeam.team.score,
    },
    currentRound: newRound,
  };
};

export const initTeam = (lives: number): Team => {
  return {
    score: 0,
    lives,
    initialLives: lives,
  };
};

export const initActiveTeam = (): Team => {
  return initTeam(LIVES);
};

export const initInactiveTeam = (): Team => {
  return initTeam(STEAL_LIVES);
};

export const initCurrentRound = (): CurrentRound => {
  return {
    total: 0,
    answered: [false, false, false, false, false, false, false, false,],
    roundComplete: false,
    stealAttempt: "none",
  };
};

export const correctAnswer = (
  game: Game,
  questionIndex: number,
  count: number
): Game => {
  let answered: Answered = [...game.currentRound.answered];
  const teams = getTeamsStatus(game);

  if (
    teams?.activeTeam?.team?.lives === undefined ||
    answered[questionIndex] === true ||
    game.currentRound.roundComplete ||
    game.currentRound.stealAttempt === "success"
  ) {
    return game;
  }
  answered.splice(questionIndex, 1, true);

  return {
    ...game,
    currentRound: {
      ...game.currentRound,
      answered,
      roundComplete:
        !answered.includes(false) || teams.inActiveTeam.team.lives === 0,
      total: game.currentRound.total + count,
      stealAttempt:
        game.currentRound.stealAttempt === "attempt"
          ? "success"
          : game.currentRound.stealAttempt,
    },
  };
};

export const incorrectAnswer = (game: Game): Game => {
  const teams = getTeamsStatus(game);
  let stealAttempt = game.currentRound.stealAttempt;
  if (
    stealAttempt === "success" ||
    teams?.activeTeam?.team?.lives === undefined ||
    teams?.inActiveTeam?.team?.lives === undefined
  ) {
    return game;
  }
  const lives = Math.max(0, teams.activeTeam.team.lives - 1);
  let inControl = game.currentRound.inControl;
  let roundComplete = false;
  if (lives === 0 && teams.inActiveTeam.team.lives > 0) {
    inControl = teams.inActiveTeam.id;
    stealAttempt = "attempt";
  } else if (lives === 0 && teams.inActiveTeam.team.lives === 0) {
    roundComplete = true;
  }
  const x = {
    ...game,
    currentRound: {
      ...game.currentRound,
      inControl,
      roundComplete,
      stealAttempt,
    },
    [teams.activeTeam.name]: {
      ...teams.activeTeam.team,
      lives,
    },
  };
  return x;
};

export const setInControl = (game: Game, inControl: TeamNames): Game => {
  // if there's already someone in control then do nothing
  if (game.currentRound.inControl) {
    return game;
  }
  const activeTeamName = `team${inControl}`;
  const activeTeam = game[`team${inControl}`];
  const inActiveTeamId = inControl === "A" ? "B" : "A";
  const inActiveTeamName = `team${inActiveTeamId}`;
  const inActiveTeam = game[`team${inActiveTeamId}`];

  return {
    ...game,
    currentRound: {
      ...game.currentRound,
      inControl,
    },
    [activeTeamName]: {
      ...initActiveTeam(),
      score: activeTeam.score,
    },
    [inActiveTeamName]: {
      ...initInactiveTeam(),
      score: inActiveTeam.score,
    },
  };
};
