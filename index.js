var app = require('./server/server.js');

var port = 3000;

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`);
});
