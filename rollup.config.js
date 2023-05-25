import babel from 'rollup-plugin-babel'
import serve from 'rollup-plugin-serve'

export default {
    input: './src/core/instance/index.js',
    output: {
        file: 'dist/vue',
        format: 'umd', // 在window上创建Vue属性
        name: 'Vue',
        sourcemap: true
    },
    plugins: [
        babel({
            exclude: 'node_modules/**'
        }),
        serve({
            port: 3000,
            contentBase: '', // 当前目录为基准
            open: '/index.html'
        })
    ]
}