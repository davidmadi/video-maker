const imageDownloader = require('image-downloader')
const google = require('googleapis').google;
const customsearch = google.customsearch('v1');
const robots = {
  state : require('./state.js')
}
const googleSearchCredentials = require('../credentials/google-search.json');

async function robot(){
  const content = robots.state.load();
  //const images = await fetchImagesForAllSentences(content);
  //robots.state.save(content);

  await downloadAllImages(content);

  //console.dir(content, { depth:null});
  process.exit(0);
}

async function fetchImagesForAllSentences(content){
  for (const sentence of content.sentences){
    const query = `${content.searchTerm} ${sentence.keywords[0]}`;
    sentence.images = await fetchGoogleAndReturnImagesLinks(query);
    sentence.googleSearchQuery = query;
  }
}

async function fetchGoogleAndReturnImagesLinks(query){
  const response = await customsearch.cse.list({
    auth: googleSearchCredentials.apiKey,
    cx : googleSearchCredentials.searchEngineId,
    q: query,
    searchType: 'image',
    imgSize:'huge',
    num: 2
  });

  return response.data.items.map(i => i.link);
}

async function downloadAllImages(content){
  const preventDuplicatedImages = {};
  //preventDuplicatedImages[content.sentences[1].images[0]] = true;
  for (var i = 0; i < content.sentences.length; i++){
    let sentence = content.sentences[i];
    const images = sentence.images;
    for(const imageUrl of images){
      try{
        if(imageUrl in preventDuplicatedImages) {
          console.log(`Image duplicated prevented: ${imageUrl}`);
          continue;
        }

        await downloadAndSave(imageUrl, `${i}-original.png`);
        preventDuplicatedImages[imageUrl] = true;
        console.log(`Image downloaded successfully: ${imageUrl}`);
        break;
      }
      catch(error){
        console.log(`Error downloading image: ${imageUrl} | ${error}`);
      }
    }
  }

  async function downloadAndSave(url, fileName){
    return  imageDownloader.image({
      url, url,
      dest: `./content/${fileName}`
    })
  }
}

module.exports = robot