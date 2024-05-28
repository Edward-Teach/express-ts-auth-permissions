module.exports = {
  "development": {
    "username": process.env.DB_USER,
    "database": process.env.DB_NAME,
    "password": process.env.DB_PASSWORD,
    "host": process.env.DB_HOST,
    "dialect": "mysql"
  }
}