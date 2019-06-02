const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin");
const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const autoprefixer = require("autoprefixer");

module.exports = {
    mode: "production",
    entry: {
        main: "./src/index.js"
    },
    output: {
        filename: "[name].[hash:8].js",
        path: path.join(__dirname, "./build")
    },
    resolve: {
        extensions: [".js", ".jsx", ".tsx", ".ts"],
        alias: {
            "@assets": path.join(__dirname, "./src/assets")
        }
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "./src/index.html"),
            filename: "index.html",
            minify: { collapseWhitespace: true }
        }),
        //   minify: {
        //     removeComments: true,
        //     collapseWhitespace: true,
        //     removeRedundantAttributes: true,
        //     useShortDoctype: true,
        //     removeEmptyAttributes: true,
        //     removeStyleLinkTypeAttributes: true,
        //     keepClosingSlash: true,
        //     minifyJS: true,
        //     minifyCSS: true,
        //     minifyURLs: true
        // }
        new ExtractCssChunks({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: "styles/[name].css",
            chunkFilename: "[id].css",
            orderWarning: true // Disable to remove warnings about conflicting order between imports
        })
    ],
    optimization: {
        // minimize: isProduction,
        splitChunks: {
            chunks: "all",
            name: false
        },
        minimizer: [
            new UglifyJsPlugin({
                cache: true,
                parallel: true,
                sourceMap: true
            }),
            new OptimizeCssAssetsPlugin()
        ],
        runtimeChunk: true
    },
    module: {
        rules: [
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                use: "eslint-loader",
                enforce: "pre",
                exclude: /node_modules/
            },
            {
                test: /\.(js|mjs|jsx|ts|tsx)$/,
                use: [{ loader: "babel-loader" }],
                exclude: /node_modules/
            },
            {
                test: /\.(less|css)$/,
                use: [
                    // "style-loader",
                    {
                        loader: ExtractCssChunks.loader,
                        options: {
                            // if you want HMR - we try to automatically inject hot reloading but if it's not working, add it to the config
                            hot: true,
                            reloadAll: true, // when desperation kicks in - this is a brute force HMR flag
                            publicPath: "../"
                        }
                    },
                    "css-loader",
                    {
                        loader: "postcss-loader",
                        options: {
                            plugins: [autoprefixer]
                        }
                    },
                    "less-loader"
                ]
            },
            {
                test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                loader: "url-loader",
                options: {
                    limit: 10000,
                    name: "images/[name].[hash:8].[ext]"
                }
            }
            // {
            //   test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            //   loader: 'file-loader',
            //   options: {
            //     name: 'images/[name].[hash:8].[ext]',
            //   },
            // },
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
        ]
    },
    devServer: {
        port: 5733
    }
};
