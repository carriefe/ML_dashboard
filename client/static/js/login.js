const email_field = document.getElementById('email');
const password = document.getElementById('password');

const submit_form = document.getElementById('submitButton');

submit_form.addEventListener('click', async (e) => {
	e.preventDefault();

	let form = {
		email: email_field.value,
		password: password.value
	}

	await fetch('/login', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(form)
	})
	.then(response => response.json())
	.then(response => {
		localStorage.setItem('token', response.token);
		window.location.href = response.url;
	});

	return false;
})