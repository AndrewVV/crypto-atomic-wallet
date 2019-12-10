const merge = require('webpack-merge');
const common = require('./webpack.config.babel.js');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = merge(common, {
    mode: 'production',
    optimization: {
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    keep_fnames: true,
                    comments: false,
                    compress: {
                        warnings: false,
                        drop_console: true
                    }
                }
            })
        ]
    },
    devtool: 'source-map'
});