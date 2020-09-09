"use strict"

const path = require("path")

const user = require("./controllers/user.js")

const publicDir = path.join(__dirname, "../client/")


module.exports = [
  {
    method: "POST",
    path: "/user",
    handler: user.create,
    config: {
      description: "Adds a new user",
      payload: {
        multipart: true,
      }
    }
  },
  {
    method: "GET",
    path: "/users",
    handler: user.list,
    config: {
      description: "List all users"
    }
  },
  {
    method: "GET",
    path: "/user/{id}",
    handler: user.get,
    config: {
      description: "Get a user by id"
    }
  },
  {
    method: "PUT",
    path: "/user/{id}",
    handler: user.update,
    config: {
      description: "Updates the selected user",
      payload: {
        multipart: true,
      }
    }
  },
  {
    method: "DELETE",
    path: "/user/{id}",
    handler: user.delete,
    config: {
      description: "Deletes the selected user"
    }
  },
  {
    method: "GET",
    path: "/",
    handler: function (request, h) {
      return h.file(path.join(publicDir, "index.html"))
    },
    config: {
      description: "Return index.html"
    }
  },
  {
    method: "GET",
    path: "/{param*}",
    handler: {
      directory: {
        path: publicDir
      }
    },
    config: {
      description: "Provides static resources"
    }
  }
]
