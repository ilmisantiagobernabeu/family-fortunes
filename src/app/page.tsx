"use client";
import styles from "./page.module.css";
import { questions } from "./data/questions";
import * as gameController from "./controllers/game";
import { useCallback, useEffect, useState } from "react";
import { Answer, Game } from "./types/types";
import useSound from "use-sound";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [game, setGame] = useState<Game>(gameController.newGame());
  const [correct] = useSound("/sounds/correct.mp3");
  const [topAnswer] = useSound("/sounds/top-answer.mp3");
  const [wrongAnswer] = useSound("/sounds/wrong-answer.mp3");

  const handleUserKeyPress = useCallback(
    (event: any) => {
      const { keyCode } = event;
      switch (keyCode) {
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
          const answer: number = +keyCode - 49;
          if (answer === 0) {
            topAnswer();
          } else {
            correct();
          }
          setGame(
            gameController.correctAnswer(
              game,
              answer,
              questions[game.round - 1].answers[answer].count
            )
          );
          break;
        case 65:
          setGame(gameController.setInControl(game, "A"));
          break;
        case 66:
          setGame(gameController.setInControl(game, "B"));
          break;
        case 78:
          setGame(gameController.newGame());
          break;
        case 87:
          wrongAnswer();
          setGame(gameController.incorrectAnswer(game));
          break;
        case 39:
          if (game.round === questions.length) {
            router.push("/big-money");
          }
          setGame(gameController.nextRound(game, questions.length));
          break;
      }
    },
    [game]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleUserKeyPress);
    return () => {
      window.removeEventListener("keydown", handleUserKeyPress);
    };
  }, [handleUserKeyPress]);

  const renderAnswer = (answer: Answer, answered: boolean, index: number) => {
    if (answered) {
      return (
        <li key={index}>
          <span style={{ float: "left" }}>{answer.answer}</span>
          <span style={{ float: "right" }}>{answer.count}</span>
        </li>
      );
    }
    return (
      <li key={index}>
        <span style={{ float: "left" }}>----------------------------</span>
        <span style={{ float: "right" }}>**</span>
      </li>
    );
  };

  const renderWrong = (lives?: number, initialLives?: number) => {
    const rows: Array<JSX.Element> = [];
    if (initialLives === undefined || lives === undefined) {
      <div className={styles.wrongItemContainer}>
        <span className={`${styles.wrongHidden}`}>X</span>
      </div>;
      return rows;
    }

    const wrongCount = initialLives - lives;
    for (let i = 0; i < initialLives; i++) {
      rows.push(
        <div className={styles.wrongItemContainer}>
          <span
            className={`${styles.wrongHidden} ${
              wrongCount > i && styles.wrongShown
            }`}
          >
            X
          </span>
        </div>
      );
    }
    return rows;
  };

  const total = (game: Game) => {
    return (
      <>
        <span style={{ float: "right" }}>{game.currentRound.total}</span>
        <span style={{ float: "right", marginRight: "20px" }}>Total</span>
      </>
    );
  };

  return (
    <main className={styles.main}>
      <div
        className={`${styles.score}${game.currentRound.inControl === "A" ? " " + styles.selected : ""}`}
      >
        {game.teamA.score}
      </div>
      <div className={styles.surveyContainer}>
        <div className={styles.wrong}>
          {renderWrong(game.teamA.lives, game.teamA.initialLives)}
        </div>
        <div
          className={styles.description}
          style={{ width: "840px", marginTop: "40px" }}
        >
          <ol style={{ fontSize: 70, width: "82%" }}>
            {questions[game.round - 1].answers.map((answer, index: number) =>
              renderAnswer(answer, game.currentRound.answered[index], index)
            )}
          </ol>
        </div>
        <div className={styles.wrong}>
          <div className={styles.wrong}>
            {renderWrong(game.teamB.lives, game.teamB.initialLives)}
          </div>
        </div>
        <span className={styles.total}>{total(game)}</span>
      </div>
      <div
        className={`${styles.score}${game.currentRound.inControl === "B" ? " " + styles.selected : ""}`}
      >
        {game.teamB.score}
      </div>
    </main>
  );
}
