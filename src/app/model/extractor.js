let matches = [],
	re;
	
function parseItem(it){
	if(typeof it === 'object'){
		parseObject(it);
	}else if(typeof it === 'array'){
		parseArray(it);
	}else if(typeof it === 'string'){
		parseStr(it);
	}
}

function parseObject(obj){
	for(var i in obj) {
		if(i != 'wikidata')
			parseItem(obj[i]);
	}
}

function parseArray(ar){
	for(let j=0; j<ar.length; j++){
		parseItem(ar[j]);
    }
}

function parseStr(str){
	let match = str.match(re);

	if(match && match.length){

		for(let j=0; j<match.length; j++){
			matches.push(match[j].toUpperCase());
	    }
	}
}

export function extractor(data, regExp) {
	matches = [];
	re = new RegExp(regExp, "gi");
	parseItem(data);

	return matches;
}