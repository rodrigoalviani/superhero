module.exports = {
  development: {
    url: 'mongodb://localhost/superhero_dev',
    options: {
      server: {poolSize: 5}
    }
  },
  staging: {
    url: 'mongodb://localhost/superhero_staging',
    options: {
      server: {poolSize: 5}
    }
  },
  test: {
    url: 'mongodb://localhost/superhero_test',
    options: {
      server: {poolSize: 5}
    }
  },
  production: {
    url: 'mongodb://localhost/superhero',
    options: {
      server: {poolSize: 5}
    }
  }
}