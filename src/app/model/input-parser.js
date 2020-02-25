import $ from "jquery";

let properties = ["name", "nombre", /*"speakers", */"wikidata", "lat", "lon"/*, "wals" ,"iso-639-3", "genus", "family", "area"*/];

function extractCountries(d){
	let ar = [];
	ar.push(d['Países']);

	for(let i=0; i<10; i++){
		let idx = '__' + i;

		if(d.hasOwnProperty(idx) && d[idx] > ""){
			ar.push(d[idx]);
		}
	}

	return ar;
}

function getNumber(p){
	if(typeof p == 'string'){
		return parseInt(p.replace(/,/g, ''));
	} else{
		return p;
	}
}

export function inputParser(data) {
	let ar = {};

	$.each(data, function( k, v ) {

		let datum = {};

		for(let i=0; i<properties.length; i++){
			if(v.hasOwnProperty(properties[i]))
				datum[properties[i]] = v[properties[i]];
		}

		if(v.hasOwnProperty('speakers'))
			datum.speakers = getNumber(v.speakers);

		let countries = extractCountries(v);
		if(countries.length)
			datum.countries = countries;

		ar[k] = datum;
	});

	return ar;
}