const path = require('path');
const webpack = require('webpack');

module.exports = {
    context: __dirname + '/src',
    entry: {
        background: ['@babel/polyfill', './background/background.js'],
        content: ['@babel/polyfill', './content/content.js'],
        popup: ['@babel/polyfill', './popup/popup.js']
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: '[name].js',
        library: '[name]'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: 'babel-loader',
                exclude: /(node_modules|bower_components)/,
                query: {
                    presets: ['@babel/preset-env']
                }
            },
        ]
    },
    plugins: [
        new webpack.ProvidePlugin({
            $: 'jquery',
            jQuery: 'jquery',
        })
      
    ],
    stats: {
        colors: true
    }
};