var path = require('path');
module.exports = {
    watch: true,
    mode: "development",
    devtool: 'source-map',
    entry: './src/main.ts',
    module: {
        rules: [
            {
                test: /\.ts?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
    },
};
//# sourceMappingURL=webpack.config.js.map