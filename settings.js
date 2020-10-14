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
  staging: {
    db: {
      url: process.env.DATABASE_URL,
      dialect: "postgres",
    }
  },
  production: {
    db: {
      host: process.env.RDS_HOSTNAME,
      username: process.env.RDS_USERNAME,
      password: process.env.RDS_PASSWORD,
      port: process.env.RDS_PORT,
      // database: process.env.RDS_DB_NAME,
      dialect: 'postgres'
    }
  }
};
