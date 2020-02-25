import $ from "jquery";

export function merger(original, feteched){
	return $.extend(original, feteched);
}