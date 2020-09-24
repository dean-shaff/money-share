const path = require("path");
const webpack = require("webpack");

const mode = process.env.NODE_ENV === 'production' ? 'production': 'development'

module.exports = {
  entry: "./client/src/index.js",
  mode: mode,
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel-loader",
        options: { presets: ["@babel/env"] }
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"]
      }
    ]
  },
  resolve: { extensions: ["*", ".js", ".jsx"] },
  output: {
    path: path.resolve(__dirname, "client", "dist"),
    publicPath: "/dist/",
    filename: "bundle.js"
  },
};
