'use strict'
const path = require('path')
const webpack = require('webpack');
function resolve(dir) {
  return path.join(__dirname, dir)
}

const name = 'vue Admin Template' // page title

const port = 9528 // dev port

module.exports = {
  // 基本路径
  publicPath: "./",
  // 构建时的输出目录
  outputDir: 'dist',
   // 放置静态资源目录
  assetsDir: 'static',
  // 指定生成的 index.html 的输出路径 默认index.html
  // indexPath: "index.html",
  // 文件名哈希
  filenameHashing: true,
  // 是否在保存的时候 使用 eslint-loader 进行检查
  lintOnSave: process.env.NODE_ENV === 'development',
  // 如果你不需要生产环境的 source map，可以将其设置为 false 以加速生产环境构建。
  productionSourceMap: false,
  devServer: {
    host: '0.0.0.0',
    // proxy: {
    //   [process.env.VUE_APP_BASE_API]: {
    //     target: process.env.VUE_APP_SERVICE_URL,
    //     changeOrigin: true,
    //     pathRewrite: {
    //       [ '^' + process.env.VUE_APP_BASE_API]: ''
    //     }
    //   }
    // },
    port: port,
    open: false,
    overlay: {
      warnings: false,
      errors: true
    },// 错误在页面弹出、警告不在页面弹出
    // before: require('./mock/mock-server.js')
  },
  configureWebpack: {
    name: name,
    resolve: {
      alias: {
        '@': resolve('src')
      }
    },
    // //支持jquery
    // plugins: [
    //   new webpack.ProvidePlugin({
    //       $:"jquery",
    //       jQuery:"jquery",
    //       "windows.jQuery":"jquery"
    //   })
    // ]
  },
  chainWebpack(config) {
    config.plugins.delete('preload') // TODO: need test
    config.plugins.delete('prefetch') // TODO: need test
    // set svg-sprite-loader
    config.module
      .rule('svg')
      .exclude.add(resolve('src/icons'))
      .end()
    config.module
      .rule('icons')
      .test(/\.svg$/)
      .include.add(resolve('src/icons'))
      .end()
      .use('svg-sprite-loader')
      .loader('svg-sprite-loader')
      .options({
        symbolId: 'icon-[name]'
      })
      .end()

    // set preserveWhitespace
    config.module
      .rule('vue')
      .use('vue-loader')
      .loader('vue-loader')
      .tap(options => {
        options.compilerOptions.preserveWhitespace = true
        return options
      })
      .end()
    
    // config.module
    //   .rule('modernizr')
    //   .test(/\.modernizrrc$/)
    //   .use('webpack-modernizr-loader')
    //   .loader('webpack-modernizr-loader')
    //   .end()
    config
      .when(process.env.NODE_ENV === 'development',
        config => config.devtool('source-map')
        // config => config.devtool('cheap-source-map')
      )

    config
      .when(process.env.NODE_ENV !== 'development',
        config => {
          // 设定 runtime 代码单独抽取打包
          config
            .plugin('ScriptExtHtmlWebpackPlugin')
            .after('html')
            .use('script-ext-html-webpack-plugin', [{
            // `runtime` must same as runtimeChunk name. default is `runtime`
              inline: /runtime\..*\.js$/
            }])
            .end()

          config
          // chunks 资源分块
            .optimization.splitChunks({
              chunks: 'all',
              cacheGroups: {
                libs: {
                  name: 'chunk-libs',
                  test: /[\\/]node_modules[\\/]/,
                  priority: 10,
                  chunks: 'initial' // only package third parties that are initially dependent
                },
                elementUI: {
                  name: 'chunk-elementUI', // split elementUI into a single package
                  priority: 20, // the weight needs to be larger than libs and app or it will be packaged into libs or app
                  test: /[\\/]node_modules[\\/]_?element-ui(.*)/ // in order to adapt to cnpm
                },
                commons: {
                  name: 'chunk-commons',
                  test: resolve('src/components'), // can customize your rules
                  minChunks: 3, //  minimum common number
                  priority: 5,
                  reuseExistingChunk: true
                }
              }
            })
          config.optimization.runtimeChunk('single')
        }
      )
  },
}
