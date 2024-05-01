import { load_page } from './util.js'
const csrfToken = document.querySelector('[name="csrfmiddlewaretoken"]').value;

let page_obj = {
	cursor: null,
	prev_cursor: -1,
	is_end: false,
}

load_front_page();
window.onscroll = function() {
    if((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
    	if(!page_obj.is_end && page_obj.cursor != page_obj.prev_cursor){
    		page_obj.prev_cursor = page_obj.cursor;
    		load_front_page();
    	}
    }
};

function load_front_page(){
	load_page(`/posts?operation=all&cursor=${page_obj.cursor}`, page_obj, csrfToken, '#main-frame');
}