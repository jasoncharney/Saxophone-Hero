outlets = 2;

function bang(){
	outlet(0,Date.now().toString());
	outlet(1,(Date.now()+5000).toString());
}