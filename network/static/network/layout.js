const compose_submit = document.querySelector('#compose-submit');

if(compose_submit){
	compose_submit.addEventListener('click', function(event) {
		event.preventDefault();

		let csrfToken = document.querySelector('[name="csrfmiddlewaretoken"]').value;
		let body = document.querySelector('#compose-body').value;
		let image = document.querySelector('.image-upload-btn').files[0];
		let post_id = document.querySelector('#post_id');

		if(image){
			let reader = new FileReader();
			reader.readAsDataURL(image);
			reader.onload = function (event) {
				let data = {
					image: reader.result,
					body: body,
				};
				if(post_id){
					post_id = post_id.innerText;
					comment(data, csrfToken, post_id);
				}
				else{
					post(data, csrfToken);
				}
			};
			reader.onerror = function (error) {
				console.log('Error: ', error);
			};
		}
		else{
			let data = {
				body: body,
			};
			if(post_id){
				post_id = post_id.innerText;
				comment(data, csrfToken, post_id);
			}
			else{
				post(data, csrfToken);
			}
		}
	});
}


function post(data, csrfToken) {
	fetch('/post', {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json',
        	'X-CSRFToken': csrfToken,
    	}
	})
	.then(response => response.json())
	.then(data => {
		document.querySelector('#compose-body').value = '';
	})
}

function comment(data, csrfToken, post_id) {
	fetch(`/post/${post_id}`, {
		method: 'POST',
		body: JSON.stringify(data),
		headers: {
			'Content-Type': 'application/json',
        	'X-CSRFToken': csrfToken,
    	}
	})
	.then(response => response.json())
	.then(data => {
		document.querySelector('#compose-body').value = '';
	})
}