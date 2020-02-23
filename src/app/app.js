import $ from "jquery";

import { print } from './modules/messages';
import { fetcher } from './modules/fetcher';
import { parser } from './modules/parser';

let playing = false;

let pointer = -1;

let items = [];

function loadJson(source){

	print('', 'hr');

	print('Loading source: ' + source, '');

	showData('');

	$.getJSON( source, { full: "yes" } )
		.done(function( json ) {

			let ar = {};

			print('Loaded', 'ok');

			items = [];

			$.each(json, function( k, v ) {
				items.push(v);
			});

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

	if(pointer < items.length){

		print('', 'hr');

		print('Loading item: ' + items[pointer].name, '');

		showData(items[pointer]);

		fetcher(items[pointer], parser, fetcherResponse);

	} else {

		print('', 'hr');

		print('All done - ' + getTime(), 'ok');

		$('#start').trigger('click');
	}
}

function fetcherResponse(data){
	console.log(data);
	showData(data);

	// if(playing)
		// 	loadNextItem();
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

print('READY - ' + getTime(), 'ok');

$('#load').trigger('click');