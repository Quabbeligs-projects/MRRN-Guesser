### HOW TO RUN: "python3 server.py" in terminal (I ain't hosting ts)



## STRUCTURE
- Simple white frame with blue "Start Game" button for start

- A black screen transforms into the location image every new location
- UI in the top middle of the screen displays the round (e.g 1/5), the timer, and the total score so far 
- 20 sec timer
- When the timer is up, -or the player has guessed, the map expands showing the players' guess (marker.png), the actual location (flag.png overlay), the distance, and the score
- The total score is then updated on the top-middle-bar
- Players can click the bottom right image of the map to expand it and also guess
- Marker is shown on the spot where the player guessed

- After the last guess, the final score is shown with a button underneath saying "Share your score!". Players then have the option of uploading the score with a username of their choice to the leaderboard. The leaderboard is only shown if the player decides to share his/her score -or by clicking the bold "leaderboard" text (which is located up-right on the screen)



## FEATURES & DESIGN
### Sound Effects: 
among us role reveal sound: when new image given
csgo countdown: plays at the start of each round
bomb explode: if you don't answer in time / < 1000 points
fah: 1000 - 2500 points
ding sound effect: 2500 - 4500 points
plants vs zombies: 4500+ points
vine-boom: everytime player clicks on the map to make a guess

### Features:
- MAKE SURE USERNAMES HAVE FILTERS!
- **MAKE SQL DATABASE TO SAVE SCORES**
- Confetti when leaderboard opens
- 20 photos / 5 photos per round

### Algorithm to check score: (d = distance in pixels)
- d < 10: 5000 points
- d > 1000: 0 points
- 10 < d < 1000: (1-(d-10)/990)*5000



### LOCATION COORDINATES: MAP: 720x720

1: (435, 225)
2: (500, 115)
3: (535, 135)
4: (530, 45)
5: (480, 215)
6: (485, 255)
7: (485, 315)
8: (435, 295)
9: (445, 345)
10: (420, 350)
11: (430, 390)
12: (435, 435)
13: (370, 430)
14: (410, 470)
15: (335, 450)
16: (360, 370)
17: (295, 395)
18: (290, 435)
19: (385, 400)
20: (385, 325)