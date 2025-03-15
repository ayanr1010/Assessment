import React, { useState, useEffect, useRef } from "react";
import * as handTrack from "handtrackjs";

const App = () => {
  const [playerY, setPlayerY] = useState(150);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([{ x: 400 }]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const videoRef = useRef(null);
  const modelRef = useRef(null);

  const handleJump = () => {
    if (!isJumping) {
      setIsJumping(true);
      let jumpHeight = 100;
      let jumpSpeed = 5;
      let downSpeed = 3;

      let upInterval = setInterval(() => {
        setPlayerY((prev) => {
          if (prev > 150 - jumpHeight) {
            return prev - jumpSpeed;
          } else {
            clearInterval(upInterval);

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

  const restartGame = () => {
    setPlayerY(150);
    setObstacles([{ x: 400 }]);
    setScore(0);
    setIsGameOver(false);
  };

  useEffect(() => {
    const loadModel = async () => {
      const modelParams = {
        flipHorizontal: true,
        maxNumBoxes: 1,
        scoreThreshold: 0.5
      };

      const model = await handTrack.load(modelParams);
      console.log("✅ HandTrack.js model loaded successfully!");
      modelRef.current = model;

      const videoElement = videoRef.current;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 }
        });

        videoElement.srcObject = stream;

        // Ensure `.play()` only runs after the video has loaded
        videoElement.addEventListener("loadeddata", () => {
          console.log("📷 Camera loaded successfully!");
          videoElement.play();
          setTimeout(() => detectHands(), 100); // Fix for the timing error
        });

      } catch (error) {
        console.error("❌ Error accessing camera:", error);
      }
    };

    const detectHands = async () => {
      if (modelRef.current) {
        modelRef.current.detect(videoRef.current).then((predictions) => {
          console.log("🖐 Hand Predictions:", JSON.stringify(predictions, null, 2));

          if (predictions.length > 0 && !isJumping) {
            handleJump();
          }
          requestAnimationFrame(detectHands);
        });
      }
    };

    loadModel();

    return () => {
      if (videoRef.current) {
        const tracks = videoRef.current.srcObject?.getTracks();
        tracks?.forEach((track) => track.stop());
      }
    };
  }, [isJumping]);

  useEffect(() => {
    let gameLoop = setInterval(() => {
      if (!isGameOver) {
        setObstacles((prev) =>
          prev.map((obs) => {
            if (obs.x < 40 && obs.x > 30 && playerY <= 150) {
              setIsGameOver(true);  // Death screen
            }

            if (obs.x < 40 && playerY > 150) {
              setScore((prevScore) => prevScore + 5); // Score count
            }

            return { x: obs.x - 5 };
          }).filter((obs) => obs.x > -20)
        );

        if (Math.random() < 0.02) {
          setObstacles((prev) => [...prev, { x: 400 }]);
        }
      }
    }, 30);

    return () => clearInterval(gameLoop);
  }, [playerY, isGameOver]);

  return (
    <div
      style={{
        textAlign: "center",
        height: "100vh",
        width: "100vw",
        border: "2px solid black",
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#87CEEB", // Background color (light blue) 
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {isGameOver && (
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            padding: "30px",
            borderRadius: "10px",
            zIndex: 10,
          }}
        >
          <h1>Game Over</h1>
          <p>Score: {score}</p>
          <button
            onClick={restartGame}
            style={{
              padding: "10px 20px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Restart
          </button>
        </div>
      )}

      <div
        style={{
          position: "relative",
          width: "75%",
          height: "100%",
          borderRight: "2px solid black"
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

        {/* Score Counter */}
        <div
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            padding: "5px 10px",
            borderRadius: "5px",
          }}
        >
          Score: {score}
        </div>
      </div>

      <div style={{ width: "25%", height: "100%" }}>
        <video
          ref={videoRef}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
          autoPlay
          muted
          playsInline
          id="videoElement"
        />
      </div>
    </div>
  );
};

export default App;
