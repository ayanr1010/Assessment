// Remove the FaceDetection import and component usage temporarily
import React, { useState, useEffect, useRef } from "react";

const App = () => {
  const [playerY, setPlayerY] = useState(150); // Block's vertical position
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([{ x: 400 }]); // Initial obstacle
  const gameRef = useRef(null);

  const handleJump = () => {
    if (!isJumping) {
      setIsJumping(true);
      let jumpHeight = 100;
      let jumpSpeed = 5;
      let downSpeed = 3;

      // Move up
      let upInterval = setInterval(() => {
        setPlayerY((prev) => {
          if (prev > 150 - jumpHeight) {
            return prev - jumpSpeed;
          } else {
            clearInterval(upInterval);

            // Move down
            let downInterval = setInterval(() => {
              setPlayerY((prev) => {
                if (prev < 150) {
                  return prev + downSpeed;
                } else {
                  clearInterval(downInterval);
                  setIsJumping(false);
                  return 150;
                }
              });
            }, 20);
          }
          return prev;
        });
      }, 20);
    }
  };

  useEffect(() => {
    let gameLoop = setInterval(() => {
      setObstacles((prev) =>
        prev
          .map((obs) => ({ x: obs.x - 5 })) // Move obstacles left
          .filter((obs) => obs.x > -20) // Remove obstacles that go off-screen
      );

      if (Math.random() < 0.02) {
        setObstacles((prev) => [...prev, { x: 400 }]);
      }
    }, 30);

    return () => clearInterval(gameLoop);
  }, []);

  return (
    <div
      ref={gameRef}
      style={{
        textAlign: "center",
        height: "300px",
        width: "400px",
        border: "2px solid black",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#ddd",
      }}
    >
      <div
        style={{
          position: "absolute",
          bottom: `${playerY}px`,
          left: "50px",
          width: "20px",
          height: "20px",
          backgroundColor: "blue",
        }}
      ></div>

      {obstacles.map((obs, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            bottom: "150px",
            left: `${obs.x}px`,
            width: "20px",
            height: "20px",
            backgroundColor: "red",
          }}
        ></div>
      ))}

      <button onClick={handleJump} style={{ position: "absolute", bottom: "10px", left: "50%" }}>
        Jump
      </button>
    </div>
  );
};

export default App;



