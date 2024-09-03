const path = require('path');

client_path = path.join(__dirname, '/../../client');

module.exports = function(app, express, query){
	app.get('/', (req, res) => {
		res.sendFile(path.join(client_path, '/index.html'));
	});
  
	app.get('/homepage', (req, res) => {
		res.sendFile(path.join(client_path, '/homepage.html'));
  	});
  
	app.get('/projects-home', (req, res) => {
		res.sendFile(path.join(client_path, '/project_home.html'));
	});
  
	app.get('/project/:id', (req, res) => {
		res.sendFile(path.join(client_path, '/project.html'));
	});
	
	app.get('/login', (req, res) => {
		res.sendFile(path.join(client_path, '/login.html'));
	});

	app.post('/login', async (req, res) => {
		let form = req.body;
		let user = await query.getUser(form.email);
		if(form.password !== user.password){
			return;
		}
		let new_token = "";
		while(true) {
			new_token = generate_token(20);
			let exists = await query.tokenExists(new_token);
			if (!exists) break;
		}
		query.createToken(user.user_id, new_token);
		
		res.json({token: new_token, url: '/homepage'});
	});

	app.post('/signup', (req, res) => {
		let form = req.body;
		query.createUser(form.first_name, form.last_name, form.email, form.password);
		res.redirect('/login');
	});
	
	app.get('/signup', (req, res) => {
		res.sendFile(path.join(client_path, '/signup.html'));
	});

};