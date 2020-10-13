// aws.js
const app = require("./lib/server.js")
const { transformRequest, transformResponse } = require('hapi-lambda');

// cache the server for better peformance
let server;

exports.handler = async event => {
  if (!server) {
    server = await app.init();
  }

  const request = transformRequest(event);

  // handle cors here if needed
  request.headers['Access-Control-Allow-Origin'] = '*';
  request.headers['Access-Control-Allow-Credentials'] = true;

  const response = await server.inject(request);

  return transformResponse(response);
};
