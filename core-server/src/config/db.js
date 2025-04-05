import pg from "pg";
import conf from "./config.js";

const {Pool} = pg;

const pool = new Pool({
  host: conf.dbHost,
  port: conf.dbPort,
  database: conf.dbName,
  user: conf.dbUser,
  password: conf.dbPassword,
  max: conf.dbConnectionLimit, 
  idleTimeoutMillis: conf.dbIdleTimeout,
  connectionTimeoutMillis: conf.dbAcquireTimeout,
  statement_timeout: conf.queryTimeout,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export default pool;
