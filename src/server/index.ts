import register from "@babel/register";

register({
  presets: ["@babel/preset-env"],
  ignore: ["node_modules"],
});

// Import the rest of our application.
module.exports = require("./server");
