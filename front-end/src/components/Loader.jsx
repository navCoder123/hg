import React from "react";
import "./Loader.css";

const Loader = () => {
  return (
    <div className="loader">
      <h1 className="loader-text">LOADING</h1>
      <div className="particles">
        {[...Array(50)].map((_, i) => (
          <span
            key={i}
            className="particle"
            style={{
              '--i': i,
              '--angle': `${Math.random() * 360}deg`,
              '--radius': `${50 + Math.random() * 100}px`,
              '--duration': `${2 + Math.random() * 2}s`,
            }}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default Loader;
