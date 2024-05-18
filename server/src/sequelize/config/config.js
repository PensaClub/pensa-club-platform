const { db_url, db_name, db_user, db_password } = process.env;

module.exports = {
  development: {
    username: db_user,
    password: db_password,
    database: db_name,
    host: db_url,
    dialect: "postgres",
  },

  production: {
    username: "postgres",
    password: "pensaclub24",
    database: "pensaclub_db",
    host: "",
    dialect: "postgres",
  },
};
