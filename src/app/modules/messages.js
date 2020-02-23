import $ from "jquery";

export function print(msg, type){
	$('#monitor').append('<div class="msg ' + type + '">' + msg + '</div>');
	$("#monitor").animate({ scrollTop: $('#monitor').prop("scrollHeight")}, 400);
}