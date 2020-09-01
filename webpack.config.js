module.exports = {
  entry: {
    //入口
    main: "./main.js",
  },
  mode: "development",
  optimization: {
    minimize: false,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
            plugins: [
              [
                "@babel/plugin-transform-react-jsx",//用来转换我自己的jsx
                {
                  pragma: "createElement",
                },
              ],
            ],
          },
        },
      },
    ],
  },
}
