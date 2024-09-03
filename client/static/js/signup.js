const form = document.getElementById('signupform');
const fname_field = document.getElementById('first-name');
const lname_field = document.getElementById('last-name');
const email_field = document.getElementById('email');
const password = document.getElementById('password');
const conf_password = document.getElementById('conf-password');

const submit_form = document.getElementById('submitButton');

submit_form.addEventListener('click', async (e) => {
	e.preventDefault();
	if (!(fname_field.value.length < 20 && fname_field.value.length > 0)) {
		return;
	} else if (!(lname_field.value.length < 20 && lname_field.value.length > 0)) {
		return;
	} else if (!(password.value === conf_password.value)) {
		return;
	}

	let form = {
		first_name: fname_field.value,
		last_name: lname_field.value,
		email: email_field.value,
		password: password.value
	}

	await fetch('/signup', {
		method: 'POST',
		headers: {
			'Accept': 'application/json',
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(form)
	}).then((res) => window.location.href = res.url);

	return false;
})