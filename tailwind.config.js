module.exports = {
  purge: {
    enabled: true,
    content: [
        './public/**/*.jsx',
        './public/**/*.html'
    ]
  },
  theme: {
    fontFamily: {
        heading: [ 'Lato', 'sans-serif' ],
    }
  },
  variants: {
      extend: {
        backgroundColor: [ 'disabled' ]
      }
  }
};
