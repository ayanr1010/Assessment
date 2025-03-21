import React, { useState, useEffect, useRef } from "react";
import * as handTrack from "handtrackjs";

const App = () => {
  const [playerY, setPlayerY] = useState(150);
  const [isJumping, setIsJumping] = useState(false);
  const [obstacles, setObstacles] = useState([{ x: 600 }]);
  const [score, setScore] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const modelRef = useRef(null);
  const streamRef = useRef(null);
  const jumpRef = useRef(false);
  const lastSpikeTime = useRef(Date.now());
  const spikeInterval = useRef(2000); // Default 2 sec gap between spikes

  // Handle Jump
  const handleJump = () => {
    if (!jumpRef.current) {
      jumpRef.current = true;
      setIsJumping(true);
      let startY = 150;
      let peakY = 50;
      let jumpSpeed = 5;
      let jumpDirection = -1; // Up

      const jumpAnimation = () => {
        setPlayerY((prevY) => {
          if (jumpDirection === -1 && prevY <= peakY) {
            jumpDirection = 1; // Start going down
          }
          if (jumpDirection === 1 && prevY >= startY) {
            jumpRef.current = false;
            setIsJumping(false);
            return startY;
          }
          return prevY + jumpSpeed * jumpDirection;
        });

        if (jumpRef.current) {
          requestAnimationFrame(jumpAnimation);
        }
      };

      requestAnimationFrame(jumpAnimation);
    }
  };

  // Restart Game
  const restartGame = () => {
    setPlayerY(150);
    setObstacles([{ x: 600 }]);
    setScore(0);
    setIsGameOver(false);
  };

  // Load Model and Video
  useEffect(() => {
    let isMounted = true;

    const loadModelAndCamera = async () => {
      if (modelRef.current) return;

      const modelParams = {
        flipHorizontal: true,
        maxNumBoxes: 1,
        scoreThreshold: 0.5, // Sensitivity
      };

      const model = await handTrack.load(modelParams);
      console.log("✅ HandTrack.js model loaded!");
      modelRef.current = model;

      try {
        if (!streamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 320, height: 240 },
          });

          if (isMounted) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
            videoRef.current.addEventListener("loadeddata", () => {
              console.log("📷 Camera loaded successfully!");
              detectHands(); // Start detecting
            });
          }
        }
      } catch (error) {
        console.error("❌ Error accessing camera:", error);
      }
    };

    const detectHands = async () => {
      if (!modelRef.current || !videoRef.current || videoRef.current.readyState !== 4) {
        requestAnimationFrame(detectHands);
        return;
      }

      modelRef.current.detect(videoRef.current).then((predictions) => {
        renderPredictions(predictions);
        if (predictions.length > 0 && !isJumping) {
          handleJump();
        }
        requestAnimationFrame(detectHands);
      });
    };

    const renderPredictions = (predictions) => {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

      predictions.forEach((prediction) => {
        const { bbox } = prediction;
        const [x, y, width, height] = bbox;

        ctx.strokeStyle = "#FF0000";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = "#FF0000";
        ctx.font = "14px Arial";
        ctx.fillText("Hand", x, y - 5);
      });
    };

    loadModelAndCamera();

    return () => {
      isMounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // Game Loop (Fixed for No Slowdown + Spacing)
  useEffect(() => {
    let gameLoop = setInterval(() => {
      if (!isGameOver) {
        setObstacles((prev) =>
          prev
            .map((obs) => {
              if (obs.x < 40 && obs.x > 30 && playerY >= 150) {
                setIsGameOver(true);
              }
              if (obs.x < 40 && playerY < 150) {
                setScore((prevScore) => prevScore + 5);
              }
              return { x: obs.x - 5 }; // Move spikes smoothly
            })
            .filter((obs) => obs.x > -20)
        );

        // Add new spike with randomized delay
        const currentTime = Date.now();
        if (currentTime - lastSpikeTime.current > spikeInterval.current) {
          const randomGap = Math.floor(Math.random() * 1500) + 2000; // Random 2s to 3.5s gap
          spikeInterval.current = randomGap;
          setObstacles((prev) => [...prev, { x: 600 }]);
          lastSpikeTime.current = currentTime;
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
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#87CEEB",
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

      {/* Game Canvas and Player */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Video Feed */}
        <video
          ref={videoRef}
          width="320"
          height="240"
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 2,
            opacity: 0.7,
            border: "2px solid black",
          }}
          autoPlay
          muted
          playsInline
        />

        {/* Canvas for Bounding Box */}
        <canvas
          ref={canvasRef}
          width="320"
          height="240"
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            zIndex: 3,
          }}
        />

        {/* Player (Blue Block) */}
        <div
          style={{
            position: "absolute",
            bottom: `${playerY}px`,
            left: "50px",
            width: "20px",
            height: "20px",
            backgroundColor: "blue",
            zIndex: 4,
          }}
        ></div>

        {/* Obstacles (Spikes) */}
        {obstacles.map((obs, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              bottom: "150px",
              left: `${obs.x}px`,
              width: "0",
              height: "0",
              borderLeft: "10px solid transparent",
              borderRight: "10px solid transparent",
              borderBottom: "20px solid red",
              zIndex: 4,
            }}
          ></div>
        ))}

        {/* Ground Line */}
        <div
          style={{
            position: "absolute",
            bottom: "150px",
            left: "0",
            width: "100%",
            height: "3px",
            backgroundColor: "#4B4B4B",
            zIndex: 4,
          }}
        ></div>

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
            zIndex: 5,
          }}
        >
          Score: {score}
        </div>
      </div>
    </div>
  );
};

export default App;
