const path = require("path")

require("dotenv").config()


module.exports = {
  aws: {
    region: 'us-west-2',
    fromAddress: 'help@eternalsharing.com',
    accessKeyId: process.env.AWSAccessKeyId,
    secretAccessKey: process.env.AWSSecretKey
  },
  dateFormat: "MMMM Do, YYYY",
  port: process.env.PORT || 8000,
  env: process.env.NODE_ENV || "development",
  jwt_key: process.env.JWT_KEY || 'hello',
  development: {
    db: {
      dialect: 'postgres',
      database: 'money-share',
      username: 'postgres',
      password: 'postgres'
    }
    // db: {
    //   dialect: "sqlite",
    //   storage: path.join(__dirname, "db", "db.sqlite"),
    //   logging: false
    // }
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
      dialect: 'postgres'
    }
  }
};
