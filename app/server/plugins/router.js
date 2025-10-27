const routes = [].concat(
  require('../routes/healthy'),
  require('../routes/healthz'),
  require('../routes/manual-upload'),
  require('../routes/manual-upload-audit')
)

module.exports = {
  plugin: {
    name: 'router',
    register: (server) => {
      server.route(routes)
    }
  }
}
