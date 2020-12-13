module.exports = {
    devOptions: {
        open: 'none',
        output: 'stream'
    },
    installOptions: {
        treeshake: true
    },
    mount: {
        public: {
            url: '/'
        }
    },
    plugins: [
        [ 'snowpack-plugin-raw-file-loader', { exts: [ '.ftl' ] } ]
    ]
};
