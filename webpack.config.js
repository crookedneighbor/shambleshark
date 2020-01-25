var webpack = require('webpack')
var path = require('path')
var fileSystem = require('fs')
var env = require('./utils/env')
var { CleanWebpackPlugin } = require('clean-webpack-plugin')
var CopyWebpackPlugin = require('copy-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')
var WriteFilePlugin = require('write-file-webpack-plugin')

const BROWSER = env.BROWSER

const alias = {
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
        test: /\.css$/,
        loader: 'raw-loader'
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
    new WriteFilePlugin()
  ]
}

if (env.NODE_ENV === 'development') {
  options.devtool = 'cheap-module-eval-source-map'
}

module.exports = options
