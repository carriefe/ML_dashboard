
async function setUpDB() {
    const sqlite3 = require('sqlite3').verbose();
    const bcrypt = require('bcrypt');

    let db = new sqlite3.Database('../db/sample.db');

    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT)`
    );

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        project_ids TEXT,
            CONSTRAINT project_fk
            FOREIGN KEY (project_ids)
            REFERENCES projects (id))`
    );
}

async function createUser() {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const hashedPassword = bcrypt.hash(password, 10);
    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.run(query, [name, email, hashedPassword], function (err) {
        if (err) {
            console.log('Error creating user:', err.message);
        } else {
            console.log(`User ${name} created successfully`);
        }
    });
}

async function updatePassword(newName, email) {
    const newPassword = document.getElementById('newPassword');
    const emailToQuery = document.getElementById('emailToQuery');
    const hashedPassword = bcrypt.hash(newPassword, 10);

    const query = `UPDATE users SET password = ? WHERE email = ?`;
    db.run(query, [hashedPassword, emailToQuery], function (err) {
        if (err) {
            console.log('Error updating user:', err.message);
        } else {
            console.log(`User with email ${email} updated successfully`);
        }
    });
}

async function createProject() {
    const projectName = document.getElementById('name');
    const email = document.getElementById('email');
    const query = `UPDATE users SET project_ids = ? WHERE email = ?`;
    db.run(query, [projectName, email], function (err) {
        if (err) {
            console.log('Error creating user:', err.message);
        } else {
            console.log(`created successfully`);
        }
    });
}

async function setUpDB() {
    const sqlite3 = require('sqlite3').verbose();
    const bcrypt = require('bcrypt');

    let db = new sqlite3.Database('../db/sample.db');

    db.run(`CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        description TEXT)`
    );

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        project_ids TEXT,
            CONSTRAINT project_fk
            FOREIGN KEY (project_ids)
            REFERENCES projects (id))`
    );
}

async function createUser() {
    const name = document.getElementById('name');
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const hashedPassword = bcrypt.hash(password, 10);
    const query = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
    db.run(query, [name, email, hashedPassword], function (err) {
        if (err) {
            console.log('Error creating user:', err.message);
        } else {
            console.log(`User ${name} created successfully`);
        }
    });
}

async function updatePassword(newName, email) {
    const newPassword = document.getElementById('newPassword');
    const emailToQuery = document.getElementById('emailToQuery');
    const hashedPassword = bcrypt.hash(newPassword, 10);

    const query = `UPDATE users SET password = ? WHERE email = ?`;
    db.run(query, [hashedPassword, emailToQuery], function (err) {
        if (err) {
            console.log('Error updating user:', err.message);
        } else {
            console.log(`User with email ${email} updated successfully`);
        }
    });
}

async function createProject() {
    const projectName = document.getElementById('name');
    const email = document.getElementById('email');
    const query = `UPDATE users SET project_ids = ? WHERE email = ?`;
    db.run(query, [projectName, email], function (err) {
        if (err) {
            console.log('Error creating user:', err.message);
        } else {
            console.log(`created successfully`);
        }
    });
}
