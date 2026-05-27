module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
<<<<<<< HEAD:frontend/babel.config.js
      ["babel-preset-expo", { jsxImportSource: "nativewind" }]
    ]
=======
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
>>>>>>> origin/auth:babel.config.js
  };
};
