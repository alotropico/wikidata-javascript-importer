const wikiMap = {
	plain: [
		{'label': 'name', 'wikiId': 'labels', 'lang': 'en'},
		{'label': 'nombre', 'wikiId': 'labels', 'lang': 'es'}
	],
	claims: [
		{'label': 'is', 'wikiId': 'P31', 'action': 'getAll'}, //Q25295 - Q34770
		{'label': 'speakers', 'wikiId': 'P1098', 'action': 'getHigh'},
		{'label': 'typology', 'wikiId': 'P4132', 'action': 'getAll'},
		{'label': 'writing', 'wikiId': 'P282', 'action': 'getAll'},
		{'label': 'parents', 'wikiId': ['P279', 'P361'], 'action': 'getAll'} // Subclase de, Parte de
	]
};

 // language family, language, language group, languoid class
const validInstancesTypes = ['Q25295', 'Q34770', 'Q941501'/*, 'Q28923954'*/];

/*Speakers
P1098

Subclase de
P279\

Parte de
P361

Influenced by
P737

Linguistic typology
P4132

Has grammatical case
P2989

Has grammatical mood
P3161

Has grammatical gender
P5109

Has grammatical person
P5109

Writing system
P282

Has tense
P3103*/

export {wikiMap, validInstancesTypes};