import $ from "jquery";
import { validInstancesTypes } from '../model/config';
import { inputParser } from '../model/input-parser';
import { fetcher } from '../model/fetcher';
import { parser } from '../model/parser';
import { extractor } from '../model/extractor';
import { merger } from '../model/merger';
import { exporter } from '../model/exporter';
import { print } from '../view/messages';

let playing = false,
	processing = false;

let pointer = -1,
	inputItems = [],
	exportItems = {},
	pendingIds = [];

/*function loadWikidataIds(source){

	print('', 'hr');

	print('Loading wikidata ids labels: ' + source, '');

	$.getJSON( source, { full: "yes" } )
		.done(function( json ) {

		})
		.fail(function( jqxhr, textStatus, error ) {
			print('Loading wikidata ids failed: ' + textStatus + ' ... ' + error, 'error');
		});
}*/

function loadJson(source){

	print('', 'hr');

	print('Loading source: ' + source, '');

	showData('');

	$.getJSON( source, { full: "yes" } )
		.done(function( json ) {

			let ar = {};

			print('Loaded', 'ok');

			json = inputParser(json);

			inputItems = [];

			$.each(json, function( k, v ) {
				inputItems.push(v);
			});

			showItemsCount();

			if(playing)
				loadNextItem();
			else
				showData(json);

		})
		.fail(function( jqxhr, textStatus, error ) {
			print('Loading source json failed: ' + textStatus + ' ... ' + error, 'error');
		});
}

function loadNextItem(){

	pointer++;

	if(pointer < inputItems.length){

		print('', 'hr');

		let label = '';

		try{
			label = (inputItems[pointer].wikidata ? inputItems[pointer].wikidata : inputItems[pointer].name);
		}
		catch(e){
			label = 'UNDEFINED';
			console.log(inputItems[pointer]);
			console.log(e);
		}

		print('Loading item: ' + label, '');

		//showData(inputItems[pointer]);

		fetcher(inputItems[pointer], parser, fetcherResponse);

	} else {

		pointer = inputItems.length;

		print('', 'hr');

		print('All done - ' + getTime(), '');

		$('#start').trigger('click');
	}

	showItemsCount();
}

function fetcherResponse(data){

	showData(data);

	pendingIds = arConcatUnique(pendingIds, extractor(data, '(Q|P)\\d+'));

	let newItem = merger(inputItems[pointer], data);

	let itemKey;

	if(newItem.hasOwnProperty('wikidata') && newItem.wikidata){
		itemKey = newItem.wikidata;
	} else {
		itemKey = 'NO-WIKI-DATA-' + pointer;
	}

	exportItems[itemKey] = newItem;

	$('#imports').val(pendingIds.join(', '));

	if(hasInstanceOf(data, validInstancesTypes) && data.hasOwnProperty('parents'))
		insertItems(data.parents);

	if(playing)
		loadNextItem();
}

function loadNextOrphan(){

	let id = pendingIds.shift();

	if(id){

		$('#imports').val(pendingIds.join(', '));

	// if(pointer < inputItems.length){

		print('', 'hr');

		print('Loading item: ' + id, '');

		fetcher({wikidata: id}, parser, orphanResponse);

	} else if(pendingIds.length){
		loadNextOrphan();
	} else {
		print('', 'hr');

		print('All done - ' + getTime(), '');

		$('#process').trigger('click');
	}

	// 	let label = '';

	// 	try{
	// 		label = (inputItems[pointer].wikidata ? inputItems[pointer].wikidata : inputItems[pointer].name);
	// 	}
	// 	catch(e){
	// 		label = 'UNDEFINED';
	// 		console.log(inputItems[pointer]);
	// 		console.log(e);
	// 	}

	// 	print('Loading item: ' + label, '');

	// 	//showData(inputItems[pointer]);

	// 	fetcher(inputItems[pointer], parser, fetcherResponse);

	// } else {

	// 	pointer = inputItems.length;

	// 	print('', 'hr');

	// 	print('All done - ' + getTime(), 'ok');

	// 	$('#start').trigger('click');
	// }

	// showItemsCount();

}

function orphanResponse(data){
	console.log(data);

	if(processing)
		loadNextOrphan();
}

function hasInstanceOf(it, ids){
	if(it.hasOwnProperty('is')){
		for(let i=0; i<it.is.length; i++){
			for(let j=0; j<ids.length; j++){
				if(it.is[i] == ids[j])
					return true;
			}
		}
	} else {
		return false;
	}
}

function insertItems(its){
	// ASEGURARSE DE QUE NO EXISTAN YA

	for(let i=0; i<its.length; i++){
		if(!isInItems(its[i])){
			inputItems.push({
				wikidata: its[i]
			});
		}
	}

	showItemsCount();
}

function isInItems(id){
	for(let i=0; i<inputItems.length; i++){
		let it = inputItems[i];
		if(it.hasOwnProperty('wikidata') && it.wikidata == id){
			return true;
		}
	}
	return false;
}

function showItemsCount(){
	$('#status').text(pointer + ' of ' + inputItems.length + ' items searched');
}

function arConcatUnique(ar1, ar2){
	let ar = ar1.concat(ar2),
		unique = [];

	$.each(ar, function(i, el){
	    if($.inArray(el, unique) === -1) unique.push(el);
	});

	return unique;
}

// MONITOR MESSAGES

function showData(data){
	if(data == '')
		$('#editor').val('');
	else
		$('#editor').val( JSON.stringify(data, null, '\t') );
}

// TOOLKIT

function getTime(){
	var newDate = new Date();
	return newDate.toLocaleString();
}

// INIT

$('#load').on('click', function(e){
	loadJson( $('#source').val() );
});

$('#start').on('click', function(e){
	if(!playing){
		$(this).text('Pause');
		playing = true;
		loadNextItem();
	} else {
		$(this).text('Play');
		playing = false;
	}
});

$('#process').on('click', function(e){
	if(!processing){
		$(this).text('Stop process');
		processing = true;
		loadNextOrphan();
	} else {
		$(this).text('Process');
		processing = false;
	}
});

$('#save').on('click', function(e){
	exporter(exportItems);
});

print('READY - ' + getTime(), 'ok');

$('#load').trigger('click');


