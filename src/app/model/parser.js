import $ from "jquery";
import { wikiMap } from '../model/config';

function parseWikidataItem(data){
	let ret = {};

	ret.wikidata = data.id;

	$.extend(ret, parsePlain(data));

	if(data.hasOwnProperty('claims'))
		$.extend(ret, parseClaims(data.claims));

	return ret;
}

function parsePlain(plains){
	let ret = {};

	for(let i = 0; i<wikiMap.plain.length; i++){
		let val = wikiMap.plain[i];

		let wikiIds = Array.isArray(val.wikiId) ? val.wikiId : [val.wikiId];

		let combinedPlains = [];

		for(let j=0; j<wikiIds.length; j++){
			let wikiId = wikiIds[j];

			if(plains.hasOwnProperty(wikiId)){
				combinedPlains = combinedPlains.concat(plains[wikiId]);
			}
		}

		if(combinedPlains.length && combinedPlains[0].hasOwnProperty(val.lang))
			ret[val.label] = capitalizeFirstLetter(combinedPlains[0][val.lang].value);
			//}
			// catch(e){
			// 	console.log('PARSER PLAINS ERROR');
			// 	console.log(plains);
			// 	console.log(e);
			// }
	}

	return ret;
}

function parseClaims(claims){
	let ret = {};

	for(let i = 0; i<wikiMap.claims.length; i++){
		let val = wikiMap.claims[i];

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
	//try{
	if(dataGroup.hasOwnProperty('mainsnak') && dataGroup.mainsnak.hasOwnProperty('datavalue') && dataGroup.mainsnak.datavalue.hasOwnProperty('value')){
		let valueSet = dataGroup.mainsnak.datavalue.value;

		if(valueSet.hasOwnProperty('amount')){
			return valueSet.amount;
		}else if(valueSet.hasOwnProperty('id')){
			return valueSet.id;
		}
	}
	// catch(e){
	// 	console.log('PARSER PROPVAL ERROR');
	// 	console.log(dataGroup);
	// 	console.log(e);
	// }

	return false;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

export function parser(data) {
  return parseWikidataItem(data);
}