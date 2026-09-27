const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database/claimdesk.sqlite');
db.run('UPDATE users SET password_hash = ?', ['$2a$10$HONDr5x6i4zcU/7NoiNIbunnkLlBrK1gQpMzn4YHnquJSoRFYsmby'], () => console.log('Updated hashes!'));
