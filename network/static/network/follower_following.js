const csrfToken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
const user = document.querySelector('#user-name').innerHTML;
const request_user = document.querySelector('#request_user').innerText;
const follower_following = document.querySelector('#follower_following').innerText;
const follower_button = document.querySelector('#follower-btn');
const following_button = document.querySelector('#following-btn');

fetch_follower();
fetch_following();

follower_button.addEventListener('click', function() {
	document.querySelector('.list-follower').style.display = 'block';
	document.querySelector('.list-following').style.display = 'none';
})

following_button.addEventListener('click', function() {
	document.querySelector('.list-follower').style.display = 'none';
	document.querySelector('.list-following').style.display = 'block';
})

if(follower_following === 'follower'){
	document.querySelector('.list-follower').style.display = 'block';
	document.querySelector('.list-following').style.display = 'none';
}
else if(follower_following === 'following'){
	document.querySelector('.list-follower').style.display = 'none';
	document.querySelector('.list-following').style.display = 'block';
}

function fetch_follower(){
	fetch(`/followers/${user}`, {
		method: "GET"
	})
	.then(response => response.json())
	.then(data => {
		if(data.length === 0){
			let message = document.createElement('p');
			if(user == request_user){
				message.innerText = "You don’t have any followers yet";
			}
			else{
				message.innerText = "It's empty here";
			}
			document.querySelector('.list-follower').append(message);
		}
		else{
			data.forEach((follower, index) => {
				let follower_block = document.createElement('div');
				let follower_name = document.createElement('a');
				let follow_button = document.createElement('button');
				let follow_button_wrapper = document.createElement('span');

				follower_block.setAttribute("class", "follower-block");
				follow_button.setAttribute("class", "follow-btn");
				follower_name.setAttribute("class", "follow-name");
				follower_name.setAttribute("href", `/users/${follower}`);
				follow_button_wrapper.setAttribute("class", "follow-btn-wrapper");

				if(localStorage.getItem(`is_following__username_${follower}`)){
					let is_following = localStorage.getItem(`is_following__username_${follower}`);
					if(is_following === 'true'){
						follow_button.innerText = "Unfollow";
					}
					else{
						follow_button.innerText = "Follow";
					}
				}
				else{
					fetch(`/is_following/${follower}`, {
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
							follow_button.innerText = "Unfollow";
						}
						else{
							follow_button.innerText = "Follow";
						}
						localStorage.setItem(`is_following__username_${follower}`, data.is_following);
					})
				}

				follow_button.addEventListener('click', function(e) {
					let is_following = localStorage.getItem(`is_following__username_${follower}`);
					if(is_following === 'true'){
						fetch(`/unfollow/${follower}`, {
					        method: "POST",
					        headers: {
					            'X-CSRFToken': csrfToken
					        }
					    })
					    .then(response => response.json())
					    .then(message => {
					    	console.log(message);
					    	follow_button.innerText = 'Follow';
					    	localStorage.setItem(`is_following__username_${follower}`, 'false');
					    })
					}
					else{
					    fetch(`/follow/${follower}`, {
					        method: "POST",
					        headers: {
					            'X-CSRFToken': csrfToken
					        }
					    })
					    .then(response => response.json())
					    .then(message => {
					    	console.log(message);
					    	follow_button.innerText = 'Unfollow';
					    	localStorage.setItem(`is_following__username_${follower}`, 'true');
					    })
					}
				})

				follower_name.innerText = follower;
				if(follower != request_user){
					follow_button_wrapper.append(follow_button);
				}
				follower_block.append(follower_name);
				follower_block.append(follow_button_wrapper);
				document.querySelector('.list-follower').append(follower_block);
			})
		}
	})
}

function fetch_following(){
	fetch(`/followings/${user}`, {
		method: "GET"
	})
	.then(response => response.json())
	.then(data => {
		if(data.length === 0){
			let message = document.createElement('p');
			if(user == request_user){
				message.innerText = "You aren't following anyone";
			}
			else{
				message.innerText = "It's empty here";
			}
			document.querySelector('.list-following').append(message);
		}
		else{
			data.forEach((following, index) => {
				let follower_block = document.createElement('div');
				let follower_name = document.createElement('a');
				let follow_button = document.createElement('button');
				let follow_button_wrapper = document.createElement('span');

				follower_block.setAttribute("class", "follower-block");
				follow_button.setAttribute("class", "follow-btn");
				follower_name.setAttribute("class", "follow-name");
				follower_name.setAttribute("href", `/users/${following}`);
				follow_button_wrapper.setAttribute("class", "follow-btn-wrapper");

				if(localStorage.getItem(`is_following__username_${following}`)){
					let is_following = localStorage.getItem(`is_following__username_${following}`);
					if(is_following === 'true'){
						follow_button.innerText = "Unfollow";
					}
					else{
						follow_button.innerText = "Follow";
					}
				}
				else{
					fetch(`/is_following/${following}`, {
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
							follow_button.innerText = "Unfollow";
						}
						else{
							follow_button.innerText = "Follow";
						}
						localStorage.setItem(`is_following__username_${following}`, data.is_following);
					})
				}

				follow_button.addEventListener('click', function(e) {
					let is_following = localStorage.getItem(`is_following__username_${following}`);
					if(is_following === 'true'){
						fetch(`/unfollow/${following}`, {
					        method: "POST",
					        headers: {
					            'X-CSRFToken': csrfToken
					        }
					    })
					    .then(response => response.json())
					    .then(message => {
					    	console.log(message);
					    	follow_button.innerText = 'Follow';
					    	localStorage.setItem(`is_following__username_${following}`, 'false');
					    })
					}
					else{
						fetch(`/follow/${following}`, {
					        method: "POST",
					        headers: {
					            'X-CSRFToken': csrfToken
					        }
					    })
					    .then(response => response.json())
					    .then(message => {
					    	console.log(message);
					    	follow_button.innerText = 'Unfollow';
					    	localStorage.setItem(`is_following__username_${following}`, 'true');
					    })
					}
				})

				follower_name.innerText = following;
				if(following != request_user){
					follow_button_wrapper.append(follow_button);
				}
				follower_block.append(follower_name);
				follower_block.append(follow_button_wrapper);
				document.querySelector('.list-following').append(follower_block);
			})
		}
	})
}