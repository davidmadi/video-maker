const readline = require('readline-sync');
const robots = {
  text: require('./robots/text.js'),
  state : require('./robots/state.js'),
  input : require('./robots/input.js'),
  images : require('./robots/images.js'),
  video : require('./robots/video.js')
}

async function start(){
  //robots.input()
  //await robots.text()
  //await robots.images()
  await robots.video();

  const content = robots.state.load();
  //console.log(JSON.stringify(content));
}


start();