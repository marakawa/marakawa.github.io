import path from 'path'
import packageJson from './package.json'
const NODE_ENV = process.env.NODE_ENV || '?'
const assetsDirPath = './assets'

export default {
    entry: path.join(__dirname, './src/index.tsx'),
    builtins: {
        html: [
            {
                title: packageJson.name,
                filename: 'index.html',
                minify: true,
                // favicon: `./favicon.png`,
                meta: {
                    viewport: 'width=device-width, initial-scale=1.0',
                    description: packageJson.description,
                    'og:description': packageJson.description,
                    'og:title': packageJson.name,
                    'og:type': 'website',
                    // 'og:image': 'https://',
                    // 'twitter:card': 'summary_large_image',
                },
            },
        ],
        copy: {
            patterns: [{ from: 'src/static', to: './' }],
        },
    },
    module: {
        rules: [
            {
                test: /\.(png|gltf)$/i,
                use: 'file-loader',
                options: {
                    outputPath: `${assetsDirPath}/`,
                },
            },
            {
                test: /\.(md|txt|xml)$/i,
                use: 'raw-loader',
            },
            {
                test: /\.svg$/,
                use: '@svgr/webpack',
            },
            {
                test: /\.s?[ac]ss$/i,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: {
                                localIdentName: '[local]_[hash:base64:5]',
                            },
                        },
                    },
                    'sass-loader',
                ],
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.jsx', '.js'],
    },
    optimization: {
        splitChunks: {
            cacheGroups: {
                models: {
                    test: /\.gltf/,
                    name: `${assetsDirPath}/models`,
                    chunks: 'initial',
                    enforce: true,
                    priority: 20,
                },
                three: {
                    test: /(react-)?three/,
                    name: `${assetsDirPath}/three`,
                    chunks: 'initial',
                    enforce: true,
                    priority: 10,
                },
                react: {
                    test: /react(-\w)*|i18next/,
                    name: `${assetsDirPath}/react`,
                    chunks: 'initial',
                    enforce: true,
                    priority: 5,
                },
                tone: {
                    test: /tone/,
                    name: `${assetsDirPath}/tone`,
                    chunks: 'initial',
                    enforce: true,
                    priority: 5,
                },
                modules: {
                    test: /[/]node_modules[/]/,
                    name: `${assetsDirPath}/modules`,
                    chunks: 'initial',
                    enforce: true,
                    priority: 1,
                },
                app: {
                    test: /[/]src[/]/,
                    name: `${assetsDirPath}/app`,
                    chunks: 'initial',
                    enforce: true,
                    priority: 0,
                },
            },
        },
    },
    devtool: NODE_ENV.indexOf('dev') >= 0 ? 'source-map' : false,
    output: {
        path: path.resolve(__dirname, 'www'),
        filename: '[name]-[fullhash].js',
        publicPath: NODE_ENV.indexOf('dev') >= 0 ? '/' : './',
        clean: true,
    },
}
