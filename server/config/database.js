const pg = require('pg');
const { Pool } = pg;

const mainDatabase = (dburl) => {
  return {
    connect: async () => {
      const p = new Pool({
        connectionString: dburl,
        ssl: { rejectUnauthorized: false },
      });
      return databaseQuery(p, await p.connect());
    },
  };
};

const databaseQuery = (pool, client) => {
	return {
	  init: async () => {
		const queryText = `
		  CREATE TABLE IF NOT EXISTS UserInfo (
			user_id SERIAL NOT NULL,
			first_name VARCHAR(20) NOT NULL,
			last_name VARCHAR(20) NOT NULL,
			email VARCHAR(30) NOT NULL UNIQUE,
			password TEXT NOT NULL,
			PRIMARY KEY (user_id)
		  );
        
		  CREATE TABLE IF NOT EXISTS LogIn (
			user_id INT NOT NULL,
			token VARCHAR(20) NOT NULL,
			expire DATE NOT NULL,
			FOREIGN KEY (user_id) REFERENCES UserInfo(user_id)
		  );
        
		  CREATE TABLE IF NOT EXISTS Projects (
			project_id SERIAL NOT NULL,
			name VARCHAR(20) NOT NULL,
			like_count INT NOT NULL DEFAULT 0,
			contributer_count INT NOT NULL DEFAULT 1,
			owner INT NOT NULL,
			short_desc VARCHAR(128) NOT NULL,
			long_desc TEXT NOT NULL,
			private BOOLEAN DEFAULT TRUE,
			PRIMARY KEY (project_id),
			FOREIGN KEY (owner) REFERENCES UserInfo(user_id)
		  );
	  
		  CREATE TABLE IF NOT EXISTS Contributers (
			project_id INT NOT NULL,
			user_id INT NOT NULL,
			PRIMARY KEY (project_id, user_id),
			FOREIGN KEY (project_id) REFERENCES Projects(project_id),
			FOREIGN KEY (user_id) REFERENCES UserInfo(user_id)
		  );
	  
		  CREATE TABLE IF NOT EXISTS LikesProjects (
			project_id INT NOT NULL,
			user_id INT NOT NULL,
			PRIMARY KEY (project_id, user_id),
			FOREIGN KEY (project_id) REFERENCES Projects(project_id),
			FOREIGN KEY (user_id) REFERENCES UserInfo(user_id)
		  );
    
		  CREATE TABLE IF NOT EXISTS Experiments (
			project_id INT NOT NULL,
			experiment_id SERIAL NOT NULL,
			name VARCHAR(20) NOT NULL,
			long_desc VARCHAR(128) NOT NULL,
			api_key VARCHAR(20) NOT NULL UNIQUE,
			owner INT NOT NULL,
			PRIMARY KEY (experiment_id),
			FOREIGN KEY (project_id) REFERENCES Projects(project_id)
		  );
	  
		  CREATE TABLE IF NOT EXISTS ExperimentData (
			data_id SERIAL NOT NULL,
			experiment_id INT NOT NULL,
			time BOOLEAN NOT NULL DEFAULT TRUE,
			tracker VARCHAR(20) NOT NULL,
			data TEXT NOT NULL,
			PRIMARY KEY (data_id),
			FOREIGN KEY (experiment_id) REFERENCES Experiments(experiment_id)
		  );
		`;
		const res = await client.query(queryText).catch((err)=>{console.log(err)});
		console.log("Tables created!!");
	  },
  
	  close: async () => {
		client.release();
		await pool.end();
	  },

	  createUser: async (first_name, last_name, email, password) => {
		const queryText = `
		  INSERT INTO UserInfo(first_name, last_name, email, password) VALUES($1, $2, $3, $4);
		`;
		await client.query(queryText, [first_name, last_name, email, password]);
		return null;
	  },
  
	  createToken: async (user_id, token) => {
		const queryText = `
		  INSERT INTO LogIn(user_id, token, expire) VALUES($1, $2, $3);
		`;
		let expire = new Date();
		expire.setDate(expire.getDate()+7);
		await client.query(queryText, [user_id, token, expire]);
		return null;
	  },

	  verifyToken: async (token) => {
		const queryText = `
		  SELECT user_id FROM LogIn WHERE token = $1 AND expire <= CURDATE();
		`;
		const res = await client.query(queryText, [token]);
		if(res.rows.length() == 0) {
		  return false;
		}
		return res.rows[0].user_id;
	  },
  
	  deleteToken: async (token) => {
		const queryText = `
		  DELETE FROM LogIn WHERE token = $1;
		`;
		await client.query(queryText, [token]);
		return null;
	  },

	  createProject: async (name, owner, short_desc, desc, private) => {
		const queryText = `
		  INSERT INTO Projects(name, owner, short_desc, long_desc, private) VALUES($1, $2, $3, $4, $5);
		`;
		await client.query(queryText, [name, owner, short_desc, desc, private]);
		return null;
	  },
  
	  addContributer: async (project_id, user_id) => {
		const queryText = `
		  INSERT INTO Contributers(project_id, user_id) VALUES($1, $2);
		`;
		await client.query(queryText, [project_id, user_id]);
		return null;
	  },
  
	  addLike: async (project_id, user_id) => {
		const queryText = `
		  INSERT INTO LikesProjects(project_id, user_id) VALUES($1, $2);
		`;
		await client.query(queryText, [project_id, user_id]);
		return null;
	  },

	  createExperiment: async (project_id, name, desc, api_key, owner) => {
		const queryText = `
		  INSERT INTO Experiments(project_id, name, desc, api_key, owner) VALUES($1, $2, $3, $4, $5);
		`;
		await client.query(queryText, [project_id, name, desc, api_key, owner]);
		return null;
	  },
  
	  createExperimentTracker: async (data_id, experiment_id, time, tracker) => {
		const queryText = `
		  INSERT INTO ExperimentData(data_id, experiment_id, time, tracker) VALUES($1, $2, $3, $4);
		`;
		await client.query(queryText, [data_id, experiment_id, time, tracker]);
		return null;
	  },

	  getTopProjects: async () => {
		const queryText = `
		  SELECT * FROM Projects ORDER BY like_count, contributer_count LIMIT 4;
		`
		const res = await client.query(queryText, []);
		return res.rows;
	  },
  
	  getInfoHome: async (user_id) => {
		const queryText1 = `
		  SELECT COUNT(project_id) AS A, SUM(like_count) AS B, SUM(contributer_count) AS C FROM Projects WHERE owner = $1;
		`
		const res1 = await client.query(queryText1, [user_id]);
		let row = res1.rows[0];
		let ret_data = {
		  num_proj: row.A,
		  num_exp: 0,
		  num_likes: row.B,
		  num_colabrators: row.C,
		  projects: null,
		}
  
		const queryText2 = `
		  SELECT COUNT(experiment_id) AS A FROM Experiments WHERE owner = $1;
		`
		const res2 = await client.query(queryText2, [user_id]);
		row = res2.rows[0];
		ret_data.num_exp = row.A;
  
		const queryText3 = `
		  SELECT * FROM Projects WHERE owner = $1 LIMIT 4;
		`
		const res3 = await client.query(queryText3, [user_id]);
		ret_data.projects = res3.row;
  
		return ret_data;
	  },
  
	  getAllProjects: async (user_id) => {
		const queryText = `
		  SELECT * FROM Projects WHERE owner = $1;
		`
		const res = await client.query(queryText, [user_id]);
		let projects = res.rows;
		
		const queryText1 = `
		  SELECT * FROM Projects 
		  WHERE Projects.project_id IN (SELECT Contributers.project_id WHERE Contributers WHERE Contributers.user_id = $1);
		`
		const res1 = await client.query(queryText1, [user_id]);
		let involved = res1.rows;
  
		return {projects: projects, involved: involved};
	  },

	  getExperiments: async (project_id) => {
		const queryText = `
		  SELECT * FROM Experiments WHERE project_id = $1;
		`
		const res = await client.query(queryText, [project_id]);
		return res.rows;
	  },
  
	  getExperimentData: async (expirement_id) => {
		const queryText = `
		  SELECT * FROM ExperimentData WHERE expirement_id = $1;
		`
		const res = await client.query(queryText, [expirement_id]);
		return res.rows;
	  },
  
	  updateExperimentData: async (data_id, data) => {
		const queryText = `
		  UPDATE ExperimentData SET data = $1 WHERE data_id = $2;
		`;
		await client.query(queryText, [data, data_id]);
		return null;
	  },

	  getUser: async (email) => {
		const queryText = `
		  SELECT * FROM UserInfo WHERE email = $1;
		`
		let res = await client.query(queryText, [email]);
		return res.rows[0];
	  },
  
	  tokenExists: async (token) => {
		const queryText = `
		  SELECT * FROM LogIn WHERE token = $1;
		`
		let res = await client.query(queryText, [token]);
		return res.rows.length != 0;
	  }
	  
	};
  };

const database = mainDatabase(process.env.DATABASE_URL);
module.exports = async () => await database.connect();