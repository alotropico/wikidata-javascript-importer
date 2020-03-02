import $ from "jquery";

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

function exclude(ar, ex){
	let ret = [];

	for(let i=0; i<ar.length; i++){
		let a = ar[i];
		let goes = true;

		for(let j=0; j<ex.length; j++){
			let e = ex[j];

			if(typeof e === 'array'){

				for(let k=0; j<e.length; k++){
					if(e[k].hasOwnProperty('wikidata') && a == e[k].wikidata){
						goes = false;
						break;
					}
				}

			} else if(typeof e === 'object'){
				if(e.hasOwnProperty(a)){
					goes = false;
					break;
				}else {
					$.each(e, function(m, ele){
						if(ele.hasOwnProperty('wikidata') && a == ele.wikidata){
							goes = false;
							return false;
						}
					});

					if(!goes)
						break;
				}
			}
    	}

    	if(goes)
    		ret.push(a);
    }

	return ret;
}

export function extractor(data, regExp, excludes) {
	matches = [];
	re = new RegExp(regExp, "gi");
	parseItem(data);

	return exclude(matches, excludes);
}