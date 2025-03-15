# Camera-Controlled Jump Game

## 1. Purpose
This project is a React-based camera-controlled game where a block jumps over obstacles based on hand movements detected through the webcam. It uses HandTrack.js for real-time hand tracking and React for building the UI. The goal is to jump over obstacles, earn points, and avoid collisions.

## 2. How to Use This
* Install Dependencies:

* Make sure you have Node.js and npm installed.
* Open a terminal or command prompt in the project folder and run:
* bash
* Copy
* Edit
* npm install
* Run the Game:

Start the game with:
* bash
* Copy
* Edit
* npm start
* This will launch the game in your browser.

How to Play:
The game will use your webcam to detect your hand movements.
Raising your hand will make the block jump.
You earn 5 points for every obstacle you jump over.
If the block hits an obstacle, the game ends, and a restart button appears.
Restart the Game:

Click the Restart button after losing to play again.

## 3. Features

* Hand gesture-based jumping using HandTrack.js
* Scoring system (5 points per successful jump)
* Game over screen with a restart button
* Dynamic obstacles that move across the screen
* Full-screen responsive layout for a better gaming experience

## Challenges Faced 
Challenges I occured throughout this project consisted of many issues with the camera detection. For example the camera not detecting movement and the troubleshooting for this issue was sometimes causing even more issues. Another challenge that I kept facing was multiple runtime errors that I was getting whilst trying to run the code which was happening due to my camera not being able to load fast enough causing the game to crash, I fixed this issue by making it to where the camera wouldnt pop up until it was fully loaded so that the game would not crash anymore. 

## Improvements I would make 
If given more time I would improve on the game design, such as adding a proper chracter and improving on the obstacles designs. Ways that I could improve on them would be by changing the obstacles from blocks to spikes and possibly adding more unique obstacles to the game to enhance the user's experience, I would also add a customization for the character's design so that the user can constantly change how their character looks. Lastly to make the user be engaged to the game I could add multiple levels with different obstacles, thus making each level unique and progressively getting harder to keep the user engaged. 


