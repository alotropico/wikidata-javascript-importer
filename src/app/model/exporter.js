export function exporter(payload, saveName){
	var a = document.createElement('a');
	a.id = 'downloadAnchorElem';
	document.getElementsByTagName('body')[0].appendChild(a);
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(payload, null, '\t'));
	var dlAnchorElem = document.getElementById('downloadAnchorElem');
	dlAnchorElem.setAttribute("href", dataStr);
	dlAnchorElem.setAttribute("download", saveName);
	dlAnchorElem.click();
}