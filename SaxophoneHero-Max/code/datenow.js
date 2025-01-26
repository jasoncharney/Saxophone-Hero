outlets = 2;

function bang(){
	outlet(0,(Date.now()+4000)); //original
	outlet(1,(Date.now()+16000)); //8 bars from now
}