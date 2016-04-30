var path = require('path');

module.exports = {
    entry: "./entry.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
        loaders: [
            { test: /\.scss$/, loaders: ["style", "css", "sass"] },
        //     { test: /\.js$/, exclude: /node_modules/, loader: "babel", query: {
        //         presets: ['es2015']
        //     }},
        //     { test: /\.jsx$/, exclude: /node_modules/, loader: "babel", query: {
        //         presets: ['react', 'es2015']
        //     }}
        ]
    },
    resolve: {
        extensions: ['', '.jsx', '.js', '.json'],
        root: path.resolve(__dirname),
        modulesDirectories: ['node_modules']
    }
};
