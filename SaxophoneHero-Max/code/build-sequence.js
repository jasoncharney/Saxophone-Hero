var currentLevel = 0;
var levelList = [];
var mode = 0; //mode 0: equally likely 3, 4, or 5 repetitions.

function bang(){
	currentLevel = 0;
	outlet(0,currentLevel);
	currentLevel++;
	outlet(0,currentLevel);
	modeZero();
	while (currentLevel >= 1 && currentLevel < 17){
		var choice = Math.random();
		if (choice < 0.375){
			currentLevel++;
		}
		outlet(0,currentLevel);
	}
}

function modeZero(){
	let reps = [3,4,5];
	for (let i = reps.length - 1; i > 0; i--) { 
    
    // Generate random index 
    const j = Math.floor(Math.random() * (i + 1));
                  
    // Swap elements at indices i and j
    const temp = reps[i];
    reps[i] = reps[j];
    reps[j] = temp;
}
	var rep = reps[0];
	post(rep);
}
