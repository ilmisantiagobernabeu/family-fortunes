"use client";
import styles from "./page.module.css";
import * as bigMoneyController from "../controllers/bigMoney";
import { useCallback, useEffect, useState } from "react";
import { Answer, BigMoneyGame } from "../types/types";
import useSound from "use-sound";
import { useRouter } from "next/navigation";
import { bigMoneyQuestions } from "../data/bigMoneyQuestions";

export default function BigMoney() {
  const router = useRouter();
  const [game, setGame] = useState<BigMoneyGame>(bigMoneyController.init());
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
          const questionNumber = bigMoneyController.getQuestionNumber(
            game,
            bigMoneyQuestions.length
          );
          setGame(
            bigMoneyController.correctAnswer(
              game,
              bigMoneyQuestions[questionNumber].answers[answer],
              bigMoneyQuestions.length
            )
          );
          break;
        case 39:
          if (game.round === bigMoneyQuestions.length) {
            router.push("/big-money");
          }
          // setGame(bigMoneyController.nextRound(game, bigMoneyQuestions.length));
          break;
        case 87:
          wrongAnswer();
          // setGame(bigMoneyController.incorrectAnswer(game));
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

  const renderAnswer = (answers: Array<Answer>, index: number) => {
    if (answers[index] === undefined) {
      return (
        <li key={index}>
          <span style={{ float: "left" }}>----------------------------</span>
          <span style={{ float: "right" }}>**</span>
        </li>
      );
    }
    return (
      <li key={index}>
        <span style={{ float: "left" }}>{answers[index].answer}</span>
        <span style={{ float: "right" }}>{answers[index].count}</span>
      </li>
    );
  };

  const total = (game: BigMoneyGame, roundNumber: number) => {
    return (
      <>
        <span style={{ float: "right", marginTop: "40px" }}>
          {bigMoneyController.getTotals(game)[roundNumber - 1]}
        </span>
        <span
          style={{ float: "right", marginTop: "40px", marginRight: "50px" }}
        >
          Total
        </span>
      </>
    );
  };

  return (
    <main className={styles.main}>
      <div className={styles.surveyContainer}>
        <div className={styles.leftAnswers}>
          <ol style={{ fontSize: 50 }}>
            {bigMoneyQuestions.map((question, index: number) =>
              renderAnswer(game.answers1, index)
            )}
            <span>{total(game, 1)}</span>
          </ol>
        </div>
        <div className={styles.rightAnswers}>
          <ol style={{ fontSize: 50 }}>
            {bigMoneyQuestions.map((question, index: number) =>
              renderAnswer(game.answers2, index)
            )}
            <span>{total(game, 2)}</span>
          </ol>
        </div>
      </div>
    </main>
  );
}
