const path = require("path")

require("dotenv").config()


module.exports = {
  dateFormat: "MMMM Do, YYYY",
  port: process.env.PORT || 8000,
  env: process.env.NODE_ENV || "development",
  jwt_key: process.env.JWT_KEY || 'hello',
  development: {
    db: {
      dialect: "sqlite",
      storage: "db/db.sqlite",
      logging: false
    }
  },
  test: {
    db: {
      dialect: "sqlite",
      storage: ":memory:",
      logging: false
    },
    baseURL: 'http://localhost:8000'
  },
  production: {
    db: {
      url: process.env.DATABASE_URL,
      dialect: "postgres",
    }
  }
};
