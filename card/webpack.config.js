const path = require('path');

module.exports = {
    entry: './src/index.js', // Точка входа вашего приложения
    output: {
        filename: 'bundle.js', // Название выходного файла
        path: path.resolve(__dirname, 'dist'), // Директория для сохранения собранного кода
    },
    module: {
        rules: [
            {
                test: /\.js$/, // Применять правила только к файлам .js
                exclude: /node_modules/, // Исключить папку node_modules
                use: {
                    loader: 'babel-loader', // Использовать Babel для транспиляции JavaScript
                },
            },
        ],
    },
    resolve: {
        fallback: {
            assert: require.resolve('assert/'),
            util: require.resolve('util/'),
            fs: require.resolve('fs/'),
            net: require.resolve('net-browserify'), 
            crypto: require.resolve('crypto-browserify'),
        },
    },
};
