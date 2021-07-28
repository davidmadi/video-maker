const robots = {
  state : require('./state.js')
}

async function robot(){
  const content = robots.state.load();
}

module.exports = robot