/* eslint-disable @typescript-eslint/no-var-requires */
const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  entry: "./src/js/index.ts",
  output: {
    filename: "bundle.js",
    path: path.resolve(__dirname, "dist"),
  },
  performance: {
    hints: false,
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      inject: true,
      template: "./src/templates/index.html",
    }),
    new CopyWebpackPlugin({
      patterns: [{ from: "./src/assets" }],
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: "ts-loader",
      },
      {
        enforce: "pre",
        test: /\.js$/,
        exclude: /(node_modules|dist)/,
        loader: "eslint-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
