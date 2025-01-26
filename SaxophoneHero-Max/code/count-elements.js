var arr;

const counter = {};

function anything() {
	var a = arrayfromargs(messagename, arguments);
	arr = a;
	arr.forEach(ele => {
		if (counter[ele]) {
			counter[ele] += 1;
		} else {
			counter[ele] = 1;
		}
	});
}