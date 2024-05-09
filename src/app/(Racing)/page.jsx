"use client";
import "./Racing.css";
import { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Typewriter from "typewriter-effect";

function Racing() {
  const [Text, SetText] = useState("");
  const [Loading, SetLoading] = useState(false);

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
      SetLoading(true);
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
          SetLoading(false);
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
    //eslint-disable-next-line
  }, [TimeLeft, IsTyping]);

  const HandleFocused = () => {
    SetFocused(true);
    if (InputRef.current) {
      InputRef.current.focus();
    }
  };

  const HandleFocuseOut = () => {
    SetFocused(false);
    if (InputRef.current) {
      InputRef.current.focus();
    }
  };

  const countMistakes = () => {
    return SetMistakes(
      Correct_Wrong.filter((ele) => ele !== null && ele.Status === "InCorrect")
        .length
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
          Correct_Wrong[CharIndex] = {
            Status: "Correct",
            Char: CurrentChar.textContent,
          };
        } else {
          SetCharIndex(CharIndex + 1);
          SetMistakes(Mistakes + 1);
          Correct_Wrong[CharIndex] = {
            Status: "InCorrect",
            Char: CurrentChar.textContent,
          };
        }
        if (CharIndex == Correct_Wrong.length - 1) GetText();
      }
    }
    countMistakes();
  };

  const CalculateWidth = () => {
    const TextLength = Text.length;
    const ChangedLength = Correct_Wrong.filter((ele) => ele !== null).length;
    return (ChangedLength / TextLength) * 100;
  };

  return (
    <div className="Racing" onClick={() => HandleFocused()}>
      <div className="container">
        <div className="result">
          <div className="time">
            <p>{TimeLeft}s</p>
          </div>
          <p className="Mistakes">
            Mistakes : <span> {Mistakes}</span>
          </p>
        </div>
        {Loading ? (
          <div className="LoadingText">
            <h1>
              <Typewriter
                options={{
                  strings: [
                    "Loading . . . .",
                    "please wait !",
                    "Check your connection is stable !",
                  ],
                  autoStart: true,
                  loop: true,
                }}
              />
            </h1>
          </div>
        ) : (
          <>
            <div className="test" onChange={(e) => HandleChange(e)}>
              <input
                type="text"
                ref={InputRef}
                onBlur={() => HandleFocuseOut()}
                onFocus={() => HandleFocused()}
              />
              <div className="Test-Chars">
                <div className="pre-Chars">
                  {Correct_Wrong.filter((ele) => ele !== null)
                    .slice(-2)
                    .map((ele, index) => (
                      <span
                        key={index}
                        className={`${ele.Status} ${
                          ele.Char === " " ? "space" : ""
                        }`}
                      >
                        {ele.Char}
                      </span>
                    ))}
                </div>
                <div className="main-chars">
                  {Text.split("").map((char, index) => (
                    <span
                      key={index}
                      ref={(e) => (CharsRef.current[index] = e)}
                      className={`${index === CharIndex ? "active" : ""} ${
                        Correct_Wrong[index] === null
                          ? ""
                          : Correct_Wrong[index].Status
                      }
                  ${char === " " ? "space" : ""}`}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="test-race-animation">
              <div className="race-trach">
                <div
                  className="trach"
                  style={{ width: `calc(${CalculateWidth()}% + 70px)` }}
                >
                  <i className="fa-solid fa-car-side" />
                </div>
              </div>
              <div className="test-race-result">
                <p className="WPM">WPM :{WPM}</p>
                <p className="CPM">CPM :{CPM}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
export default Racing;
