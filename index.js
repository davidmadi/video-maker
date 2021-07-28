const readline = require('readline-sync');
const robots = {
  text: require('./robots/text.js'),
  state : require('./robots/state.js'),
  input : require('./robots/input.js'),
  images : require('./robots/images.js')
}

async function start(){
  //robots.input()
  //await robots.text()
  await robots.images()

  const content = robots.state.load();
  console.log(JSON.stringify(content));
}

start();