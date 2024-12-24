var currentLevel = 0;
var nextLevel = 1;
var victoryLap = true;

function msg_int(v){
		if (v == currentLevel){
			nextLevel = currentLevel;
			victoryLap = false;
			}
		if (v != currentLevel){
			nextLevel = v;
			victoryLap = true;
			}
		if 
}
			