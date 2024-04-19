import { load_page } from './util.js'

const csrfToken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
const post_id = document.querySelector('#post_id').innerText;
let page_obj = {
	cursor: 999999999,
	prev_cursor: -1,
	is_end: false,
}

load_parent_posts(post_id);
load_child_posts(post_id);

window.onscroll = function() {
    if((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
    	if(!page_obj.is_end && page_obj.cursor != page_obj.prev_cursor){
    		page_obj.prev_cursor = page_obj.cursor;
    		load_child_posts(post_id);
    	}
    }
};


function load_parent_posts(post_id){
	load_page(`/post?operation=parent&post_id=${post_id}`, page_obj, csrfToken, '#parent-post');
}

function load_child_posts(post_id){
	load_page(`/post?operation=child&post_id=${post_id}&cursor=${page_obj.cursor}`, page_obj, csrfToken, '#child-post');
}