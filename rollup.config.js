import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
  input: './src/index.js',
  output: {
    format: 'umd', // 模块化
    file: 'dist/vue.js',
    name: 'Vue', // 打包后全局变量的名字
    sourceMap: true
  },
  plugins: [
    babel({
      exclude: 'node_modules/**'
    }),
    process.env.ENV === 'development'
      ? serve({
        open: false,
        openPage: '/public/index.html',
        port: 3000,
        contentBase: ''
      })
      : null
  ]
}