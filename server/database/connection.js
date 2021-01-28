const mysql = require("mysql2");
const {
  NODE_ENV,
  SQL_HOST,
  INSTANCE_CONNECTION_NAME,
  SQL_USER,
  SQL_PASSWORD,
  SQL_DATABASE,
} = process.env;

let connectionType = "",
  connectionValue = "";

if (NODE_ENV === "production") {
  connectionType = "socketPath";
  connectionValue = `/cloudsql/${INSTANCE_CONNECTION_NAME}`;
} else {
  connectionType = "host";
  connectionValue = SQL_HOST;
}

module.exports = mysql.createPool({
  [connectionType]: connectionValue,
  user: SQL_USER,
  password: SQL_PASSWORD,
  database: SQL_DATABASE,
});

// const pool = require("./database/connection.js");

// async function main() {
//   const promisePool = pool.promise();
//   // query database using promises
//   const [rows,fields] = await promisePool.query("SELECT 1");
//   console.log({ rows });
// }

// main();
