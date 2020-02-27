import $ from "jquery";
import { validInstancesTypes } from '../model/config';
import { inputParser } from '../model/input-parser';
import { fetcher } from '../model/fetcher';
import { parser } from '../model/parser';
import { extractor } from '../model/extractor';
import { merger } from '../model/merger';
import { exporter } from '../model/exporter';
import { print } from '../view/messages';

/*
Que el fetching de orphans sólo traiga lo necesario
Que los orphans no se traigan si ya están en el json o en parents

Que los textarea no muestren el array, solo el json

Empezar desde
Idiomas opcional (o va todo para un doc)
Idiomas y labels de idioma configurables
Config configurable: valid instances, "is", "parent" y custom (con getHigh y getAll)
Incluir/excluir los items indefinidos (no encontrados en Wikidata)

Agregar presets

Agregar otras fuentes/apis?
*/

let noWikidata = -1;

let loadingChilds = false,
	loadingOrphans = false;

let child = {};

let dd = {
	childs:{
		input: [],
		output: {},
		saveName: 'items.json'
	},
	orphans:{
		input: [],
		output: {},
		saveName: 'keymap.json'
	}
};

let ui = {
	childs:{
		play: $('#play'),
		input: $('#editor'),
		output: $('#result'),
		load: $('#load'),
		source: $('#source'),
		save: $('#save'),
		status: $('#status')
	},
	orphans:{
		play: $('#process'),
		input: $('#imports'),
		output: $('#exports'),
		load: $('#load-2'),
		source: $('#source-2'),
		save: $('#save-2'),
		status: $('#status-2')
	}
};

function loadJson(source, type){

	print('', 'hr');

	print('Loading ' + type + ': ' + source, '');

	$.ajax({
        type: 'GET',
        url: source,
        dataType: 'json',
        callback: type,
        success: function(response) {
			print(type + ' loaded', 'ok');
			loadJsonResponse(response, this.callback);
        },
        error: function(jqxhr, textStatus, error){
        	print('Loading source json failed: ' + textStatus + ' ... ' + error, 'error');
        }
    });
}

function loadJsonResponse(json, type){

	if(type == 'childs'){
		json = inputParser(json);

		dd[type].input = [];

		$.each(json, function( k, v ) {
			dd[type].input.push(v);
		});
		
		showData(dd[type].input, ui[type].input);

	} else {
		dd[type].output = json;
		showData(dd[type].output, ui[type].output);
	}

	showItemsCount(type);
}

function loadNextItem(type){

	let id = dd[type].input.shift();

	if(id){

		//$('#imports').val(dd.orphans.input.join(', '));

		print('', 'hr');

		let label = '';

		try{
			label = (id.wikidata ? id.wikidata : id.name);
		}
		catch(e){
			label = 'LOADING UNDEFINED';
			console.log(dd.childs.input[pointer]);
			console.log(e);
		}

		print('Loading ' + type + ': ' + label, '');

		if(type == 'childs'){
			fetcher(id, parser, fetcherResponse);
		} else {
			fetcher({wikidata: id}, parser, orphanResponse);
		}

	} else {

		print('', 'hr');

		print('All ' + type + ' done - ' + getTime(), '');

		ui[type].play.trigger('click');
	}

	showItemsCount(type);
}

function fetcherResponse(data){

	let newItem = merger(child, data);

	let itemKey;
	if(newItem.hasOwnProperty('wikidata') && newItem.wikidata){
		itemKey = newItem.wikidata;
	} else {
		noWikidata++;
		itemKey = 'NO-WIKI-DATA-' + noWikidata;
	}

	dd.childs.output[itemKey] = newItem;

	if(hasInstanceOf(data, validInstancesTypes) && data.hasOwnProperty('parents')){
		insertItems(data.parents, 'childs');
		showData(dd.childs.input, $('#editor'));
	}

	showData(dd.childs.output, $('#result'));

	showItemsCount('childs');
	showItemsCount('orphans');

	// ** get new orphans
	dd.orphans.input = arConcatUnique(exclude(dd.orphans.input, data.parents), extractor(data, '(Q|P)\\d+'));
	showData(dd.orphans.input.join(', '), $('#imports'), false);
	// **

	if(loadingChilds)
		loadNextItem('childs');
}

/******************************************************************/
/******************************************************************/
/******************************************************************/

function exclude(ar1, ar2){
	console.log(ar1, ar2);
	return ar1;
}

function orphanResponse(data){

	dd.orphans.output[data.wikidata] = {
		name: data.name,
		nombre: data.nombre
	};

	//showData(dd[type].output, ui[type].output);
	showData(dd.orphans.output, $('#exports'));

	showItemsCount('orphans');

	if(loadingOrphans)
		loadNextItem('orphans');
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

function insertItems(its, type){
	for(let i=0; i<its.length; i++){
		if(!isInItems(its[i], type)){
			dd[type].input.push({
				wikidata: its[i]
			});
		}
	}
}

function isInItems(id, type){
	for(let i = 0; i < dd[type].input.length; i++){
		let it = dd[type].input[i];
		if(it.hasOwnProperty('wikidata') && it.wikidata == id){
			return true;
		}
	}
	return false;
}

function showItemsCount(type){
	let text = 'Loaded: ' + Object.keys(dd[type].output).length + ' - Remaining: ' + dd[type].input.length;
	$(ui[type].status).text(text);
}

// MONITOR MESSAGES

function showData(data, container, formatted = true){

	if(data == '')
		container.val('');
	else if(!formatted)
		container.val( data );
	else
		container.val( JSON.stringify(data, null, '\t') );

	//container.stop().animate({ scrollTop: container.prop("scrollHeight")}, 200);
}

// TOOLKIT

function getTime(){
	var newDate = new Date();
	return newDate.toLocaleString();
}

function arConcatUnique(ar1, ar2){
	let ar = ar1.concat(ar2),
		unique = [];

	$.each(ar, function(i, el){
	    if($.inArray(el, unique) === -1) unique.push(el);
	});

	return unique;
}

// SETUP UI

$.each(ui, function( index, dom ) {
	dom.load.on('click', function(e){
		loadJson( dom.source.val(), index );
	});

	dom.save.on('click', function(e){
		exporter(dd[index].output, dd[index].saveName);
	});
});

$('#start').on('click', function(e){
	if(!loadingChilds){
		if(loadingOrphans)
			$('#process').trigger('click');

		$(this).text('Pause');
		loadingChilds = true;
		loadNextItem('childs');
	} else {
		$(this).text('Play');
		loadingChilds = false;
	}
});

$('#process').on('click', function(e){
	if(!loadingOrphans){
		if(loadingChilds)
			$('#start').trigger('click');

		$(this).text('Stop process');
		loadingOrphans = true;
		loadNextItem('orphans');
	} else {
		$(this).text('Process');
		loadingOrphans = false;
	}
});

// INIT

print('READY - ' + getTime(), 'ok');

$('#load').trigger('click');

setTimeout(function(){ $('#load-2').trigger('click'); }, 500);