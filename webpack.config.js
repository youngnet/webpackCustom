const path = require("path");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ExtractCssChunks = require("extract-css-chunks-webpack-plugin");
// const UglifyJsPlugin = require("uglifyjs-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const OptimizeCssAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const autoprefixer = require("autoprefixer");
const isWsl = require("./is-wsl");

const env = process.env.NODE_ENV;
module.exports = {
    mode: env,
    devtool: env === "production" ? false : "cheap-module-source-map",
    entry: {
        polyfill: "@babel/polyfill",
        main: path.resolve(__dirname, "./src/index.js")
    },
    output: {
        filename: "[name].[hash:8].js",
        path: path.join(__dirname, "./build")
    },
    resolve: {
        extensions: [".js", ".jsx", ".tsx", ".ts", ".json"],
        alias: {
            "@assets": path.join(__dirname, "./src/assets")
        }
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(__dirname, "./src/index.html"),
            inject: true,
            filename: "index.html",
            minify:
                env === "production"
                    ? {
                          removeComments: true,
                          collapseWhitespace: true,
                          removeRedundantAttributes: true,
                          useShortDoctype: true,
                          removeEmptyAttributes: true,
                          removeStyleLinkTypeAttributes: true,
                          keepClosingSlash: true,
                          minifyJS: true,
                          minifyCSS: true,
                          minifyURLs: true
                      }
                    : {}
        }),

        new ExtractCssChunks({
            // Options similar to the same options in webpackOptions.output
            filename: "styles/[name].css",
            orderWarning: true // Disable to remove warnings about conflicting order between imports
        })
    ],
    optimization: {
        minimize: env === "production",
        splitChunks: {
            chunks: "all",
            minSize: 20000,
            minChunks: 1,
            maxAsyncRequests: 5,
            maxInitialRequests: 3
            // name: false
        },
        runtimeChunk: true,
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    parse: {
                        // we want terser to parse ecma 8 code. However, we don't want it
                        // to apply any minfication steps that turns valid ecma 5 code
                        // into invalid ecma 5 code. This is why the 'compress' and 'output'
                        // sections only apply transformations that are ecma 5 safe
                        // https://github.com/facebook/create-react-app/pull/4234
                        ecma: 8
                    },
                    compress: {
                        ecma: 5,
                        warnings: false,
                        // Disabled because of an issue with Uglify breaking seemingly valid code:
                        // https://github.com/facebook/create-react-app/issues/2376
                        // https://github.com/mishoo/UglifyJS2/issues/2011
                        comparisons: false,
                        // Disabled because of an issue with Terser breaking valid code:
                        // https://github.com/facebook/create-react-app/issues/5250
                        // https://github.com/terser-js/terser/issues/120
                        inline: 2
                    },
                    mangle: {
                        safari10: true
                    },
                    output: {
                        ecma: 5,
                        comments: false,
                        // Turned on because emoji and regex is not minified properly using default
                        ascii_only: true
                    }
                },
                // Use multi-process parallel running to improve the build speed
                // Default number of concurrent runs: os.cpus().length - 1
                // Disabled on WSL (Windows Subsystem for Linux) due to an issue with Terser
                // https://github.com/webpack-contrib/terser-webpack-plugin/issues/21
                parallel: !isWsl,
                // Enable file caching
                cache: true,
                sourceMap: true
            }),
            new OptimizeCssAssetsPlugin()
        ]
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
                loader: "babel-loader",
                exclude: /node_modules/,
                options: {}
            },
            // style
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
            //     test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            //     loader: "file-loader",
            //     options: {
            //         name: "images/[name].[hash:8].[ext]"
            //     }
            // }
            // ** STOP ** Are you adding a new loader?
            // Make sure to add the new loader(s) before the "file" loader.
        ]
    },
    devServer: {
        port: 5733,
        hot: true,
        open: true,
        overlay: false,
        historyApiFallback: {
            // Paths with dots should still use the history fallback.
            // See https://github.com/facebook/create-react-app/issues/387.
            disableDotRule: true
        },
        watchContentBase: true
        // proxy: [
        //     {
        //         context: ["/api"],
        //         target: ""
        //     }
        // ],
        // before(app, server) {
        //     if (fs.existsSync(paths.proxySetup)) {
        //         // This registers user provided middleware for proxy reasons
        //         require(paths.proxySetup)(app);
        //     }

        //     // This lets us fetch source contents from webpack for the error overlay
        //     app.use(evalSourceMapMiddleware(server));
        //     // This lets us open files from the runtime error overlay.
        //     app.use(errorOverlayMiddleware());

        //     // This service worker file is effectively a 'no-op' that will reset any
        //     // previous service worker registered for the same host:port combination.
        //     // We do this in development to avoid hitting the production cache if
        //     // it used the same host and port.
        //     // https://github.com/facebook/create-react-app/issues/2272#issuecomment-302832432
        //     app.use(noopServiceWorkerMiddleware());
        // }
    }
};
