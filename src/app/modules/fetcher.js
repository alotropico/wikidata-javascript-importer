import $ from "jquery";
import { print } from '../modules/messages';

const search_by_id = false,
	wikipediaURL = 'https://en.wikipedia.org/w/api.php?action=query&prop=pageprops&format=json&redirects&titles=',
	wikidataURL = 'https://www.wikidata.org/w/api.php?action=wbgetentities&props=labels%7Cdescriptions%7Cclaims&languages=en&format=json&ids=';

let lastSearchByName = '',
	parser = {},
	callback = function(){};

function search(datum){
	if(search_by_id && datum.hasOwnProperty('wikidata') && datum['wikidata'])
		searchById(datum.wikidata);
	else if(datum.hasOwnProperty('name') && datum['name'])
		searchByName(datum.name);
}

function searchById(id){
	fetchItem(id);
}

function searchByName(name){

	print('Searching on Wikipedia by name: ' + name, '');

	lastSearchByName = name;

	$.getJSON( wikipediaURL + name + '' + '&origin=*' )
		.done(function( json ) {

			let datum = false;

			let wikibaseId = false;

			try{
				datum = getProperty(json.query.pages, 0)['pageprops'];
			}

			catch(e){
				console.log(e);
			}

			if(!datum){

				print('Unexpected format. See catched error in the console.', 'error');

			}else if(datum.hasOwnProperty('disambiguation')){

				print('Disambiguation page. Trying again...', 'warn');

				reSearchByName();

			} else if(datum.hasOwnProperty('wikibase_item')){

				print('Item found on Wikipedia', 'ok');

				fetchItem(datum['wikibase_item']);
			}

		})
		.fail(function( jqxhr, textStatus, error ) {
			print('Search by name failed: ' + textStatus + ' ... ' + error, 'error');
		});
}

function reSearchByName(){
	let name = lastSearchByName;

	if(name.indexOf('_language') == -1){
		searchByName(name + '_language');
	}
}

function fetchItem(id){

	print('Fetching from Wikidata: <a href="https://www.wikidata.org/wiki/' + id + '" target="_blank">' + id + '</a>', '');

	$.getJSON( wikidataURL + id + '&origin=*' )
		.done(function( json ) {

			
			if(json.hasOwnProperty('success')) {
				print('Item found on Wikidata', 'ok');

				let parsedData = parser(getProperty(json.entities, 0));

				if(Object.keys(parsedData).length === 0 && parsedData.constructor === Object){
					print('No useful data. Trying again...', 'warn');

					reSearchByName();
				} else {
					callback(parsedData);
				}

			} else if(json.hasOwnProperty('error')){
				print('Wikidata error: ' + JSON.stringify(json.error), 'error');
			} else{
				print('Fetch from Wikidata failed. See further data in the console.', 'error');
				console.log(json);
			}

		})
		.fail(function( jqxhr, textStatus, error ) {
			print('Fetch from Wikidata failed: ' + textStatus + ' ... ' + error, 'error');
		});
}

function getProperty(obj, idx){
	return obj[Object.getOwnPropertyNames(obj)[idx]];
}

export function fetcher(datum, parseFuncion, callbackFunction){
	parser = parseFuncion;
	callback = callbackFunction;
	search(datum);
}