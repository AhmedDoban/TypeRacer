"use client";
import "./Racing.css";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";

function Racing() {
  const [Text, SetText] = useState("");

  const [Focused, SetFocused] = useState(false);
  const [IsTyping, SetIsTyping] = useState(false);
  const [Correct_Wrong, SetCo_Wron] = useState([]);

  const [TimeLeft, SetTimeLeft] = useState(60);
  const [Mistakes, SetMistakes] = useState(0);
  const [CharIndex, SetCharIndex] = useState(0);
  const [WPM, SetWPM] = useState(0);
  const [CPM, SetCPM] = useState(0);

  const InputRef = useRef();
  const CharsRef = useRef([]);

  const GetText = async () => {
    try {
      await axios
        .get("https://api.quotable.io/random?minLength=100&maxLength=140")
        .then((response) => {
          SetText(response.data.content);
          if (InputRef.current) {
            InputRef.current.focus();
          }
          SetCo_Wron(new Array(response.data.content.length).fill(null));
          SetCharIndex(0);
          SetTimeLeft(60);
          SetIsTyping(false);
        });
    } catch (err) {
      toast.error("can't get Game !", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  useEffect(() => {
    GetText();
  }, []);

  useEffect(() => {
    let interval;
    if (TimeLeft > 0 && IsTyping) {
      interval = setInterval(() => {
        SetTimeLeft(TimeLeft - 1);

        let correctChars = CharIndex - Mistakes;
        let TotalTime = 60 - TimeLeft;

        let cpm = correctChars * (60 / TotalTime);
        cpm = cpm < 0 || !cpm || cpm === Infinity ? 0 : cpm;
        SetCPM(parseInt(cpm, 10));

        let WPM = Math.round((correctChars / 5 / TotalTime) * 60);
        WPM = WPM < 0 || !WPM || WPM === Infinity ? 0 : WPM;
        SetWPM(WPM);
      }, 1000);
    } else {
      clearInterval(interval);
      SetIsTyping(false);
    }
    return () => clearInterval(interval);
  }, [TimeLeft, IsTyping]);

  const HandleFocused = () => {
    if (!Focused) {
      SetFocused(true);
      InputRef.current.focus();
    }
  };

  const HandleFocusedOut = () => {
    SetFocused(false);
  };

  const countMistakes = () => {
    return SetMistakes(
      Correct_Wrong.filter((ele) => ele === "InCorrect").length
    );
  };

  const HandleChange = (e) => {
    let CurrentChar = CharsRef.current[CharIndex];
    const TypedChar = e.target.value.slice(-1);
    if (TimeLeft === 0) {
      GetText();
      return;
    }
    SetIsTyping(true);
    if (e.nativeEvent.inputType === "deleteContentBackward") {
      Correct_Wrong[CharIndex] = null;
      if (CharIndex > 0) {
        SetCharIndex(CharIndex - 1);
        Correct_Wrong[CharIndex - 1] = null;
      }
    } else {
      if (CharIndex < Correct_Wrong.length && TimeLeft > 0) {
        if (TypedChar === CurrentChar.textContent) {
          SetCharIndex(CharIndex + 1);
          Correct_Wrong[CharIndex] = "Correct";
        } else {
          SetCharIndex(CharIndex + 1);
          SetMistakes(Mistakes + 1);
          Correct_Wrong[CharIndex] = "InCorrect";
        }
        if (CharIndex == Correct_Wrong.length - 1) GetText();
      }
    }
    countMistakes();
  };

  return (
    <div className="Racing">
      <div className="container" onClick={() => HandleFocused()}>
        <div className="result">
          <p>
            Time : <span className="TIME">{TimeLeft}</span>
          </p>
          <p>
            Mistakes : <span className="Mistakes">{Mistakes}</span>
          </p>
          <p>
            WPM : <span className="WPM">{WPM}</span>
          </p>
          <p>
            CPM : <span>{CPM}</span>
          </p>
        </div>
        <div className="test">
          <input
            type="text"
            onChange={(e) => HandleChange(e)}
            ref={InputRef}
            onBlur={() => HandleFocusedOut()}
          />

          {Text.split("").map((char, index) => (
            <span
              key={index}
              ref={(e) => (CharsRef.current[index] = e)}
              className={`${index === CharIndex ? "active" : ""} ${
                Correct_Wrong[index]
              }`}
            >
              {char}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
export default Racing;
