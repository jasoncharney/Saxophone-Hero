var currentLevel = 0;
var levelList = [];

function bang(){
	currentLevel = 0;
	outlet(0,currentLevel);
	currentLevel++;
	outlet(0,currentLevel);
	var rep = shuffleAndGetFirstElement([2,3,4]);
	while (currentLevel >= 1 && currentLevel < 17){
		if (currentLevel == 1){
			rep = shuffleAndGetFirstElement([2,3]);
		}
		for (var i = 0; i < rep; i++){
			outlet(0,currentLevel);
		}
			currentLevel++; //increase level
			rep = shuffleAndGetFirstElement([2,3,4]); // calculate new number of repetitions
		
	}
}

function shuffleAndGetFirstElement(arr) {
    // Shuffle the array using the Fisher-Yates algorithm
    for (var i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
    }
    // Return the first element of the shuffled array
    return arr[0];
}