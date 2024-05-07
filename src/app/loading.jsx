"use client";
import Typewriter from "typewriter-effect";
import "@/Style/Def_loading.css";


function loading() {
  return (
    <>
      <div className="Def_loading">
        <div className="container">
          <h1 className="Typing">
            <Typewriter
              options={{
                strings: ["Loading...."],
                autoStart: true,
                loop: true,
              }}
            />
          </h1>
        </div>
      </div>
    </>
  );
}
export default loading;
