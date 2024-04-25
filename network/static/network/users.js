import { load_page } from './util.js'

let page_obj = {
	cursor: 999999999,
	prev_cursor: -1,
	is_end: false,
}

const user = document.querySelector('#user-name').innerHTML;
const csrfToken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
const follow_button = document.querySelector('#follow-button');
const follower_count = document.querySelector('#follower-count');
const following_count = document.querySelector('#following-count');

if(follow_button){
	follow_button.addEventListener('click', follow);
}

load_user_info();
load_user_page();
window.onscroll = function() {
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight) {
    	if(!page_obj.is_end && page_obj.cursor != page_obj.prev_cursor){
    		page_obj.prev_cursor = page_obj.cursor;
    		load_user_page();
    	}
    }
};


function load_user_page(){
	load_page(`/post?cursor=${page_obj.cursor}&operation=user&username=${user}`, page_obj, csrfToken, '#main-frame');
}


function load_user_info(){
	if(localStorage.getItem(`is_following__username_${user}`)){
		let is_following = localStorage.getItem(`is_following__username_${user}`);
		if(is_following === 'true'){
			if(follow_button){
				follow_button.innerText = 'Unfollow';
			}
		}
		else{
			if(follow_button){
				follow_button.innerText = 'Follow';
			}
		}
	}
	else{
		fetch(`/is_following?username=${user}`, {
			method: "GET"
		})
		.then(response => {
			if(response.ok){
				return response.json();
			}
			else{
				console.error('Request failed with status:', response.status);
				throw new Error('Request failed');
			}
		})
		.then(data => {
			if(data.is_following){
				if(follow_button){
					follow_button.innerText = 'Unfollow';
				}
			}
			else{
				if(follow_button){
					follow_button.innerText = 'Follow';
				}
			}
			localStorage.setItem(`is_following__username_${user}`, data.is_following);
		})
		.catch(error => {
			console.error('Error:', error);
		})
	}

	get_follower_count();
	get_following_count();
}

function get_follower_count(){
	fetch(`/follower_count?username=${user}`, {
		method: "GET"
	})
	.then(response => response.json())
	.then(data => {
		follower_count.innerText = `${data.follower_count}`;
	})
}

function get_following_count(){
	fetch(`/following_count?username=${user}`, {
		method: "GET"
	})
	.then(response => response.json())
	.then(data => {
		following_count.innerText = `${data.following_count}`;
	})
}

function follow(){
	let is_following = localStorage.getItem(`is_following__username_${user}`)
	if(is_following === 'true'){
		fetch('/unfollow', {
	        method: "POST",
	        headers: {
	            'X-CSRFToken': csrfToken
	        },
	        body: JSON.stringify({
	        	username: user
	        })
	    })
	    .then(response => response.json())
	    .then(data => {
	    	follow_button.innerText = 'Follow';
	    	follower_count.innerText = Number(follower_count.innerText) - 1;
	    	localStorage.setItem(`is_following__username_${user}`, 'false');
	    })
	}
	else{
		fetch('/follow', {
	        method: "POST",
	        headers: {
	            'X-CSRFToken': csrfToken
	        },
	        body: JSON.stringify({
	        	username: user
	        })
	    })
	    .then(response => response.json())
	    .then(data => {
	    	follow_button.innerText = 'Unfollow';
	    	follower_count.innerText = Number(follower_count.innerText) + 1;
	    	localStorage.setItem(`is_following__username_${user}`, 'true');
	    })
	}
}

function show_followers(){
	window.location.href = `/users/${user}/follower`;
}

function show_followings(){
	window.location.href = `/users/${user}/following`;
}