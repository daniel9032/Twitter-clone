import { load_page } from './util.js'
const csrfToken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
const user = document.querySelector('h2').innerHTML;

let page_obj = {
	cursor: null,
	prev_cursor: -1,
	is_end: false,
}

load_front_page();
window.onscroll = function() {
    if(!page_obj.is_end && page_obj.cursor != page_obj.prev_cursor){
		page_obj.prev_cursor = page_obj.cursor;
		load_front_page();
	}
};

function load_front_page(){
	load_page(`/posts?operation=following&username=${user}&cursor=${page_obj.cursor}`, page_obj, csrfToken, '#main-frame');
}