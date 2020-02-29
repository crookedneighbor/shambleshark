const webpack = require('webpack')
const path = require('path')
const fileSystem = require('fs')
const env = require('./utils/env')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const WriteFilePlugin = require('write-file-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')

const BROWSER = env.BROWSER

const alias = {
  Feature: path.resolve(__dirname, 'src/js/features/feature.js'),
  Features: path.resolve(__dirname, 'src/js/features/'),
  Lib: path.resolve(__dirname, 'src/js/lib/'),
  Ui: path.resolve(__dirname, 'src/js/lib/ui-elements/')
}

if (BROWSER === 'GOOGLE_CHROME') {
  alias.Browser = path.resolve(__dirname, 'src/js/lib/chrome/')
} else if (BROWSER === 'FIREFOX') {
  alias.Browser = path.resolve(__dirname, 'src/js/lib/firefox/')
}

var secretsPath = path.join(__dirname, ('secrets.' + env.NODE_ENV + '.js'))

var fileExtensions = ['jpg', 'jpeg', 'png', 'gif', 'eot', 'otf', 'svg', 'ttf', 'woff', 'woff2']

if (fileSystem.existsSync(secretsPath)) {
  alias.secrets = secretsPath
}

var options = {
  mode: env.NODE_ENV,
  optimization: {
    // extensions don't receive a performance boost by doing this
    // and Firefox requires extension code to be unminified
    minimize: false
  },
  entry: {
    popup: path.join(__dirname, 'src', 'js', 'popup.js'),
    options: path.join(__dirname, 'src', 'js', 'options.js'),
    background: path.join(__dirname, 'src', 'js', 'background.js'),
    scryfallEmbed: path.join(__dirname, 'src', 'js', 'scryfall-embed', 'index.js'),
    scryfall: path.join(__dirname, 'src', 'js', 'scryfall/index.js'),
    edhrec: path.join(__dirname, 'src', 'js', 'edhrec/index.js')
  },
  output: {
    path: path.join(__dirname, 'build', BROWSER.toLowerCase()),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [{
          loader: MiniCssExtractPlugin.loader,
          options: {
            publicPath: '../',
            hmr: process.env.NODE_ENV !== 'production'
          }
        }, 'css-loader']
      },
      {
        test: new RegExp('\.(' + fileExtensions.join('|') + ')$'), // eslint-disable-line
        loader: 'file-loader?name=[name].[ext]',
        exclude: /node_modules/
      },
      {
        test: /\.html$/,
        loader: 'html-loader',
        exclude: /node_modules/
      },
      {
        enforce: 'post',
        loader: 'string-replace-loader',
        options: {
          search: 'new Function("return this")()',
          replace: 'null'
        },
        test: /\.js$/
      }
    ]
  },
  resolve: {
    alias: alias
  },
  plugins: [
    // clean the build folder
    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        '!*manifest.json'
      ],
      cleanAfterEveryBuildPatterns: [
        '!*manifest.json'
      ]
    }),
    // expose and write the allowed env vars on the compiled bundle
    new webpack.EnvironmentPlugin(['NODE_ENV']),
    new CopyWebpackPlugin([{
      from: 'src/manifest.json',
      transform: function (content, path) {
        const json = {
          // generates the manifest file using the package.json informations
          description: process.env.npm_package_description,
          version: process.env.npm_package_version,
          content_security_policy: 'script-src \'self\'; object-src \'self\'',
          ...JSON.parse(content.toString())
        }
        if (BROWSER === 'FIREFOX') {
          json.browser_specific_settings = {
            gecko: {
              id: 'blade@crookedneighbor.com',
              strict_min_version: '69.0'
            }
          }
        }

        if (env.NODE_ENV !== 'production') {
          // so the background script can hot-reload
          json.content_security_policy = 'script-src \'self\' \'unsafe-eval\'; object-src \'self\''
        }

        return Buffer.from(JSON.stringify(json))
      }
    }]),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'popup.html'),
      filename: 'popup.html',
      chunks: ['popup']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'options.html'),
      filename: 'options.html',
      chunks: ['options']
    }),
    new HtmlWebpackPlugin({
      template: path.join(__dirname, 'src', 'background.html'),
      filename: 'background.html',
      chunks: ['background']
    }),
    new MiniCssExtractPlugin(),
    new WriteFilePlugin()
  ]
}

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-eval-source-map'
}

module.exports = options
