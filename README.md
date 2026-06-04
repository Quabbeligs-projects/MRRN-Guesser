# MRRN-Guesser

## WHO DOES WHAT
### Nikki:
- Frontend (UI)
- Backend 
### Nih:
- Databases
### Big D:
- Something
### Tomasch:
- sound design
- scoring algorithm
- map & images
### Small B:
- Jack off

## STRUCTURE
- still images
- 20 sec timer

## FEATURES & DESIGN
### Sound Effects: (deleted because i put them in the Audios folder (audios.txt) 

### Features:
- Share score at the end of the round button, people enter usernames (MAKE SURE TO HAVE FILTERS), if guy pressed on share they get teleported to leaderboard to see other scores
- Leaderboard (+confetti & sfx when you finish the game)
- **20 photos / 5 photos per round**

### Algo: (d = distance)
- d < 10: 5000 points
- d > 1000: 0 points
- 10 < d < 1000: (1-(d-10)/990)*5000
- distance formula: d = sqrt((x_guess - x_true)^2 + (y_guess - y_true)^2) 



