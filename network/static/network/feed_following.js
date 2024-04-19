import { load_page } from './util.js'
const csrfToken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
const user = document.querySelector('h2').innerHTML;

let page_obj = {
	cursor: 999999999,
}

load_front_page();
window.onscroll = function() {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
	    load_front_page();
    }
};

function load_front_page(){
	load_page(`/post?operation=following&username=${user}&cursor=${page_obj.cursor}`, page_obj, csrfToken, '#main-frame');
}