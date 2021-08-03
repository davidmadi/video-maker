const imageDownloader = require('image-downloader')
const google = require('googleapis').google;
const customsearch = google.customsearch('v1');
const gm = require('gm').subClass({imageMagick:true});
const state = require("./state.js");
const robots = {
  state : require('./state.js')
}
const googleSearchCredentials = require('../credentials/google-search.json');
const videoshow = require("videoshow");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
let ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

async function robot(){
  const content = robots.state.load();
  //await convertAllImages(content);
  //await createAllSentenceImages(content);
  //await createYoutubeThumbnail();
  await createAfterEffectsScript(content);
  //await renderVideoWithAfterEffects();

  //console.dir(content, { depth:null});
  //process.exit(0);
}

async function convertAllImages(content){
  for(let sentenceIndex=0; sentenceIndex < content.sentences.length; sentenceIndex++){
    await convertImage(sentenceIndex);
  }
}

async function createAllSentenceImages(content){
  for(var i = 0; i < content.sentences.length; i++){
    await createSentenceImage(i, content.sentences[i].text);
  }
}

async function createSentenceImage(sentenceIndex, text){
  return new Promise((resolve,reject)=>{
    const outputFile = `./content/${sentenceIndex}-sentence.png`;
    const templateSettings = {
      0:{
        size:'1920x400',
        gravity:'center'
      },
      1:{
        size:'1920x1080',
        gravity:'center'
      },
      2:{
        size:'800x1080',
        gravity:'center'
      },
      3:{
        size:'1920x400',
        gravity:'center'
      },
      4:{
        size:'1920x1080',
        gravity:'center'
      },
      5:{
        size:'800x1080',
        gravity:'center'
      },
      6:{
        size:'1920x400',
        gravity:'center'
      },
    };

    gm()
    .out('-size', templateSettings[sentenceIndex].size)
    .out('-gravity', templateSettings[sentenceIndex].gravity)
    .out('-background', 'transparent')
    .out('-fill', 'white')
    .out('-kerning', '-1')
    .out(`caption:${text}`)
    .write(outputFile, error =>{
      if (error) return reject(error);

      console.log(`> Sentence created ${outputFile}`);
      resolve();
    })
  });
}

async function createYoutubeThumbnail(){
  return new Promise((resolve,reject)=>{
    gm()
    .in('./content/0-converted.png')
    .write('./content/youtube-thumbnail.png', (error)=>{
      if (error) return reject(error);
      console.log(`> Creating youtube thumbnail`);
      resolve();
    });
  });
}

async function createAfterEffectsScript(content) {
  await state.saveScript(content);
}

async function renderVideoWithAfterEffects() {
  return new Promise((resolve, reject) => {
    const systemPlatform=os.platform
    
    if (systemPlatform== 'darwin'){
      const aerenderFilePath = '/Applications/Adobe After Effects CC 2019/aerender'
    }else if (systemPlatform=='win32'){
      const aerenderFilePath = '%programfiles%\Adobe\Adobe After Effects CC\Arquivos de suporte\aerender.exe'
    }else{
      return reject(new Error('System not Supported'))
    }
    
    const templateFilePath = fromRoot('./templates/1/template.aep')
    const destinationFilePath = fromRoot('./content/output.mov')

    console.log('> [video-robot] Starting After Effects')

    const aerender = spawn(aerenderFilePath, [
      '-comp', 'main',
      '-project', templateFilePath,
      '-output', destinationFilePath
    ])

    aerender.stdout.on('data', (data) => {
      process.stdout.write(data)
    })

    aerender.on('close', () => {
      console.log('> [video-robot] After Effects closed')
      resolve()
    })
  })
}

module.exports = robot