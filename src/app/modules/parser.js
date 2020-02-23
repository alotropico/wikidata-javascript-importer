import { wikiMap } from '../model/config';

function parseWikidataItem(data){
	return parseClaims(data.claims);
}

function parseClaims(claims){
	let ret = {};

	for(let i = 0; i<wikiMap.length; i++){
		let val = wikiMap[i];

		let wikiIds = Array.isArray(val.wikiId) ? val.wikiId : [val.wikiId];

		let combinedClaims = [];

		for(let j=0; j<wikiIds.length; j++){
			let wikiId = wikiIds[j];

			if(claims.hasOwnProperty(wikiId)){
				combinedClaims = combinedClaims.concat(claims[wikiId]);
			}
		}

		if(combinedClaims.length)
			ret[val.label] = getWikiPropsVal(combinedClaims, val.action);
	}

	return ret;
}

function getWikiPropsVal(dataSet, action){

	switch(action){
		case 'getHigh':
			return getWikiPropsValHigh(dataSet);
			break;

		case 'getAll':
			return getWikiPropsValArray(dataSet);
			break;

		default:
			return false;
	}
}

function getWikiPropsValArray(dataSet){
	let ar = [];

	for(let i = 0; i<dataSet.length; i++){
		ar.push(getWikiPropVal(dataSet[i]));
	}

	return ar;
}

function getWikiPropsValHigh(dataSet){
	let ret = 0;

	for(let i = 0; i<dataSet.length; i++){
		let val = Number(getWikiPropVal(dataSet[i]));

		if(val>ret) ret = val;
	}

	return ret;
}

function getWikiPropVal(dataGroup){
	let valueSet = dataGroup.mainsnak.datavalue.value;

	if(valueSet.hasOwnProperty('amount')){
		return valueSet.amount;
	} else if(valueSet.hasOwnProperty('id')){
		return valueSet.id;
	} else {
		return false;
	}
}

export function parser(data) {
  return parseWikidataItem(data);
}