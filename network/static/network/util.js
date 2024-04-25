export function load_page(op_string, page_obj, csrf_token, div_name){
	fetch(op_string, {
		method: "GET"
	})
	.then(response => response.json())
	.then(data => {
		if(!(data.error)){
			data.forEach((p, index) => {
				if(p.is_end !== undefined){
					if(div_name === '#child-post'){
						let blank_space = document.createElement('div');
						blank_space.setAttribute("style", "height: 700px; background-color: #fff;");
						document.querySelector("#child-post").append(blank_space);
					}
					page_obj.is_end = true;
				}
				else{
					const post_id = p.post_id;
					const user = p.user;
					const image_url = p.image_url;
					const preview_image_url = p.preview_image_url;
					let post = document.createElement('div');
					let post_header = document.createElement('div');
					let post_body = document.createElement('div');
					let post_footer = document.createElement('div');
					let user_name = document.createElement('h2');
					let user_link = document.createElement('a');
					let preview_image = document.createElement('img');
					let image = document.createElement('img');
					let body = document.createElement('p');
					let timestamp = document.createElement('span');
					let like_number = document.createElement('span');
					let like_button = document.createElement('button');
					let heart_icon = document.createElement('i');
					let message_number = document.createElement('span');
					let message_button = document.createElement('button');
					let message_icon = document.createElement('i');
					let dropdown_container = document.createElement('div');
					let dropdown_toggle_button = document.createElement('button');
					let dropdown_icon = document.createElement('i');
					let dropdown_menu = document.createElement('div');
					let dropdown_item_edit = document.createElement('p');
					let dropdown_item_delete = document.createElement('p');
					let dropdown_item_follow = document.createElement('p');

					post.setAttribute("id", `post_${post_id}`);
					post.setAttribute("class", 'post');
					post_header.setAttribute("class", "post-header");
					post_body.setAttribute("class", "post-body");
					post_footer.setAttribute("class", "post-footer");
					if(div_name === '#parent-post'){
						post_body.classList.add('large-text');
					}
					if(!(index === 0 && div_name === '#parent-post')){
						post.addEventListener('click', () => {
							window.location.href = `/status/${post_id}`;
						})
					}
					// last object in the page
					if(index === 0 && div_name != '#parent-post'){
						page_obj.cursor = p.cursor;
						return
					}
					
					user_name.setAttribute("class", "post-user-name");
					user_link.setAttribute("href", `/users/${user}`);
					user_link.setAttribute("class", "post-user-link");
					heart_icon.setAttribute("class", "fas fa-heart");
					like_button.setAttribute("class", "heart-btn");
					like_number.setAttribute("class", "post-like");
					like_number.setAttribute("id", `post-like-${post_id}`)
					message_number.setAttribute("class", "post-message");
					message_icon.setAttribute("class", "fa-regular fa-message");
					message_button.setAttribute("class", "message-btn");
					dropdown_container.setAttribute("class", "dropdown");
					dropdown_container.setAttribute("display", "inline");
					dropdown_toggle_button.setAttribute("class", "dropdown-toggle-btn");
					dropdown_toggle_button.setAttribute("type", "button");
					dropdown_toggle_button.setAttribute("data-toggle", "dropdown");
					dropdown_toggle_button.setAttribute("aria-haspopup", "true");
					dropdown_toggle_button.setAttribute("aria-expanded", "false");
					dropdown_icon.setAttribute("class", "fa-solid fa-ellipsis");
					dropdown_menu.setAttribute("class", "dropdown-menu");
					dropdown_menu.setAttribute("aria-labelledby", "dropdownMenuButton");
					dropdown_item_edit.setAttribute("class", "dropdown-item");
					dropdown_item_delete.setAttribute("class", "dropdown-item");
					dropdown_item_follow.setAttribute("class", "dropdown-item");

					user_name.innerText = user;
					timestamp.innerText = p.timestamp;
					body.innerText = p.body;
					dropdown_item_edit.innerHTML = "Edit";
					dropdown_item_delete.innerHTML = "Delete";

					user_link.append(user_name);
					like_button.append(heart_icon);
					like_button.append(like_number);
					message_button.append(message_icon);
					message_button.append(message_number);
					dropdown_toggle_button.append(dropdown_icon);
					dropdown_container.append(dropdown_toggle_button);
					dropdown_container.append(dropdown_menu);
					post_header.append(user_link);
					post_header.append(timestamp);
					post_header.append(dropdown_container);
					post_body.append(body);
					post_footer.append(like_button);
					post_footer.append(message_button);
					post.append(post_header);
					post.append(post_body);
					post.append(post_footer);

					like_button.addEventListener('click', function(event) {
						event.stopPropagation();
						fetch('/like', {
							method: "POST",
							body: JSON.stringify({
								post_id: post_id
							}),
							headers: {
								'X-CSRFToken': csrf_token
							}
						})
						.then(response => response.json())
						.then(data => {
							console.log(data);
							if(data.action === "prompt_loggin"){
								window.location.href = `/login`;
							}
							else if(data.action === "switch_to_unlike"){
								like_button.classList.add('clicked');
								localStorage.setItem(`is_liked__post_id_${post_id}`, 'true');
								document.querySelector(`#post-like-${post_id}`).innerHTML = Number(document.querySelector(`#post-like-${post_id}`).innerHTML) + 1;
							}
							else if(data.action === "switch_to_like"){
								like_button.classList.remove('clicked');
								localStorage.setItem(`is_liked__post_id_${post_id}`, 'false');
								document.querySelector(`#post-like-${post_id}`).innerHTML = Number(document.querySelector(`#post-like-${post_id}`).innerHTML) - 1;
							}
							else{
								console.log('invalid action');
							}
						})
					})

					dropdown_toggle_button.addEventListener('click', function(event) {
						event.stopPropagation();
						this.nextElementSibling.classList.toggle('show');
					});

					dropdown_item_edit.addEventListener('click', function(event) {
						event.stopPropagation();
						dropdown_toggle_button.nextElementSibling.classList.toggle('show');
						let edit_compose_popup = document.createElement('div');
						let edit_compose_form = document.createElement('form');
						let edit_compose_background = document.createElement('div');
						let edit_compose_header = document.createElement('div');
						let edit_compose_header_text = document.createElement('p');
						let edit_compose_body_block = document.createElement('div');
						let edit_compose_body = document.createElement('textarea');
						let edit_compose_submit_block = document.createElement('div');
						let edit_compose_submit = document.createElement('button');
						let close_popup_button = document.createElement('button');
						let x_icon = document.createElement('i');

						edit_compose_popup.setAttribute("class", "popup");
						edit_compose_header.setAttribute("class", "popup-header");
						edit_compose_header_text.setAttribute("class", "popup-header-text");
						edit_compose_background.setAttribute("class", "popup-background");
						edit_compose_body.setAttribute("class", "popup-compose-body");
						edit_compose_submit.setAttribute("class", "popup-submit-btn");
						x_icon.setAttribute("class", "fa-solid fa-xmark");
						close_popup_button.setAttribute("class", "popup-close-btn");

						edit_compose_header_text.innerHTML = 'Edit post';
						edit_compose_body.innerHTML = p.body;
						edit_compose_submit.innerHTML = "Save";

						close_popup_button.append(x_icon);
						edit_compose_body_block.append(edit_compose_body);
						edit_compose_submit_block.append(edit_compose_submit);
						edit_compose_form.append(edit_compose_body_block);
						edit_compose_form.append(edit_compose_submit_block);
						edit_compose_header.append(edit_compose_header_text);
						edit_compose_header.append(close_popup_button);
						edit_compose_background.append(edit_compose_header);
						edit_compose_background.append(edit_compose_form);
						edit_compose_popup.append(edit_compose_background);

						edit_compose_form.addEventListener("submit", function(event){
							event.preventDefault();
						});

						edit_compose_submit.addEventListener('click', function() {
							fetch(`/post?post_id=${post_id}`, {
								method: "PUT",
								body: JSON.stringify({
									body: edit_compose_body.value
								}),
								headers: {
									'X-CSRFToken': csrf_token
								}
							})
							.then(response => response.json())
							.then(message => {
								console.log(message);
								edit_compose_popup.classList.remove("open");
								body.innerText = edit_compose_body.value;
							});
						});

						close_popup_button.addEventListener('click', function() {
							edit_compose_popup.remove();
						});

						edit_compose_popup.classList.add("open");
						document.querySelector(".body").append(edit_compose_popup);
					});

					dropdown_item_delete.addEventListener('click', function(event) {
						event.stopPropagation();
						dropdown_toggle_button.nextElementSibling.classList.toggle('show');
						fetch(`/post?post_id=${post_id}`, {
							method: "DELETE",
							headers: {
								'X-CSRFToken': csrf_token
							}
						})
						.then(response => response.json())
						.then(message => {
							post.remove();
							console.log(message);
						});
					})

					dropdown_item_follow.addEventListener('click', function(event) {
						event.stopPropagation();
						dropdown_toggle_button.nextElementSibling.classList.toggle('show');
						if(localStorage.getItem(`is_following__username_${user}`)){
							let is_following = localStorage.getItem(`is_following__username_${user}`);
							if(is_following === 'true'){
								fetch(`/unfollow`, {
									method: "POST",
									headers: {
										'X-CSRFToken': csrf_token
									},
									body: JSON.stringify({
							        	username: user
							        })
								})
								.then(response => response.json())
								.then(message => {
									//console.log(message);
									dropdown_item_follow.innerHTML = `Follow ${user}`;
									let follow_button = document.querySelector('#follow-button');
									let follower_count = document.querySelector('#follower-count');
									if(follow_button){
										follow_button.innerHTML = 'Follow';
									}
									if(follower_count){
										follower_count.innerHTML = Number(follower_count.innerHTML) - 1;
									}
									localStorage.setItem(`is_following__username_${user}`, 'false');
								});
							}
							else{
								fetch(`/follow`, {
									method: "POST",
									headers: {
										'X-CSRFToken': csrf_token
									},
									body: JSON.stringify({
							        	username: user
							        })
								})
								.then(response => response.json())
								.then(message => {
									//console.log(message);
									dropdown_item_follow.innerHTML = `Unfollow ${user}`;
									let follow_button = document.querySelector('#follow-button');
									let follower_count = document.querySelector('#follower-count');
									if(follow_button){
										follow_button.innerHTML = 'Unfollow';
									}
									if(follower_count){
										follower_count.innerHTML = Number(follower_count.innerHTML) + 1;
									}
									localStorage.setItem(`is_following__username_${user}`, 'true');
								});
							}
						}
						else{
							fetch(`/is_following?username=${user}`, {
								method: "GET",
							})
							.then(response => response.json())
							.then(data => {
								if(data.is_following){
									fetch(`/unfollow`, {
										method: "POST",
										headers: {
											'X-CSRFToken': csrf_token
										},
										body: JSON.stringify({
								        	username: user
								        })
									})
									.then(response => response.json())
									.then(message => {
										console.log(message);
										dropdown_item_follow.innerHTML = `Follow ${user}`;
										let follow_button = document.querySelector('#follow-button');
										let follower_count = document.querySelector('#follower-count');
										if(follow_button){
											follow_button.innerHTML = 'Follow';
										}
										if(follower_count){
											follower_count.innerHTML = Number(follower_count.innerHTML) - 1;
										}
									});
								}
								else{
									fetch(`/follow`, {
										method: "POST",
										headers: {
											'X-CSRFToken': csrf_token
										},
										body: JSON.stringify({
								        	username: user
								        })
									})
									.then(response => response.json())
									.then(message => {
										console.log(message);
										dropdown_item_follow.innerHTML = `Unfollow ${user}`;
										let follow_button = document.querySelector('#follow-button');
										let follower_count = document.querySelector('#follower-count');
										if(follow_button){
											follow_button.innerHTML = 'Unfollow';
										}
										if(follower_count){
											follower_count.innerHTML = Number(follower_count.innerHTML) + 1;
										}
									});
								}
							});
							localStorage.setItem(`is_following__username_${user}`, data.is_following);
						}
					})

					const urls = [
						`/like_number?post_id=${post_id}`,
						`/message_number?post_id=${post_id}`,
					]

					if(localStorage.getItem(`is_liked__post_id_${post_id}`)){
						let is_liked = localStorage.getItem(`is_liked__post_id_${post_id}`);
						if(is_liked === 'true'){
							like_button.classList.add('clicked');
						}
						else{
							like_button.classList.remove('clicked');
						}
					}
					else{
						urls.push(`/is_liked?post_id=${post_id}`);
					}

					if(localStorage.getItem(`is_original_poster__post_id_${post_id}`)){
						let is_original_poster = localStorage.getItem(`is_original_poster__post_id_${post_id}`);
						if(is_original_poster === 'true'){
							dropdown_menu.append(dropdown_item_edit);
							dropdown_menu.append(dropdown_item_delete);
						}
						else{
							dropdown_menu.append(dropdown_item_follow);
						}
					}
					else{
						urls.push(`/is_original_poster?post_id=${post_id}`);
					}

					if(localStorage.getItem(`is_following__username_${user}`)){
						let is_following = localStorage.getItem(`is_following__username_${user}`);
						if(is_following === 'true'){
							dropdown_item_follow.innerHTML = `Unfollow ${user}`;
						}
						else{
							dropdown_item_follow.innerHTML = `Follow ${user}`;
						}
					}
					else{
						urls.push(`/is_following?username=${user}`);
					}

					async function fetchMultipleUrls(urls) {
						const fetchPromises = urls.map(url => fetch(url));
						const responses = await Promise.all(fetchPromises);
						const dataPromises = responses.map(response => response.json());
						Promise.all(dataPromises).then(datas => {
							datas.forEach((data, index) => {
								if(data.like_number !== undefined){
									like_number.innerText = data.like_number;
								}
								else if(data.message_number !== undefined){
									message_number.innerText = data.message_number;
								}
								else if(data.is_liked !== undefined){
									if(data.is_liked){
										like_button.classList.add('clicked');
									}
									else{
										like_button.classList.remove('clicked');
									}
									localStorage.setItem(`is_liked__post_id_${post_id}`, data.is_liked);
								}
								else if(data.is_original_poster !== undefined){
									if(data.is_original_poster){
										dropdown_menu.append(dropdown_item_edit);
										dropdown_menu.append(dropdown_item_delete);
									}
									else{
										dropdown_menu.append(dropdown_item_follow);
									}
									localStorage.setItem(`is_original_poster__post_id_${post_id}`, data.is_original_poster);
								}
								else if(data.is_following !== undefined){
									if(data.is_following){
										dropdown_item_follow.innerHTML = `Unfollow ${user}`;
									}
									else{
										dropdown_item_follow.innerHTML = `Follow ${user}`;
									}
									localStorage.setItem(`is_following__username_${user}`, data.is_following);
								}
							})
						})
						.then(foo => {
							if(preview_image_url){
								preview_image.setAttribute("src", preview_image_url);
								preview_image.setAttribute("class", "preview-img");
								preview_image.addEventListener('click', function(event) {
									event.stopPropagation();
									let img_popup = document.createElement('div');
									let img_popup_background = document.createElement('div');
									let image = document.createElement('img');
									let close_popup_button = document.createElement('button');
									let x_icon = document.createElement('i');

									img_popup.setAttribute("class", "popup");
									x_icon.setAttribute("class", "fa-solid fa-xmark");
									close_popup_button.setAttribute("class", "popup-close-image-btn");
									image.setAttribute("src", image_url);

									img_popup.addEventListener('click', function(event) {
										img_popup.remove();
									})

									image.addEventListener('click', function(event) {
										event.stopPropagation();
									})

									close_popup_button.addEventListener('click', function() {
										img_popup.remove();
									});

									close_popup_button.append(x_icon);
									img_popup_background.append(close_popup_button);
									img_popup_background.append(image);
									img_popup.append(img_popup_background);

									img_popup.classList.add("open");
									document.querySelector(".body").append(img_popup);
								})
								post_body.append(preview_image);
							}

							if(div_name === '#parent-post'){
								let parent_dom = document.querySelector(div_name);
								let post_id = op_string.split("=")[2];
								let target_post = document.querySelector(`#post_${post_id}`);

								if(index === 0){
									parent_dom.appendChild(post);
									post.setAttribute("name", "target-post");
								}
								else{
									parent_dom.insertBefore(post, parent_dom.children[0]);
								}

								if(target_post) {
									let rect = target_post.getBoundingClientRect();
									let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
									let target_position = rect.top + scrollTop;
									window.scrollTo({
										top: target_position,
										behavior: 'instant'
									});
								}
							}
							else{
								if(div_name === '#child-post' && index === data.length - 1){
									let blank_space = document.createElement('div');
									blank_space.setAttribute("style", "height: 700px; background-color: #fff;");
									document.querySelector("#child-post").appendChild(blank_space);
								}
							}
						})
					}

					fetchMultipleUrls(urls);
					document.querySelector(div_name).append(post);
				}
			});
		}
		else{
			console.log("error");
		}
	})
	window.addEventListener('click', function(event) {
		if(!(event.target.matches('.dropdown-toggle-btn') || event.target.matches('.fa-solid'))){
			let element_list = document.querySelectorAll('.dropdown-menu');
			element_list.forEach((elem, index) => {
				if(elem.classList.contains('show')){
					elem.classList.remove('show');
				}
			})
		}
	});
}
