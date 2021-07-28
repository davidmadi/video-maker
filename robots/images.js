const google = require('googleapis').google;
const customsearch = google.customsearch('v1');
const robots = {
  state : require('./state.js')
}
const googleSearchCredentials = require('../credentials/google-search.json');

async function robot(){
  const content = robots.state.load();
  const images = await fetchImagesForAllSentences(content);

  robots.state.save(content);

  console.dir(content, { depth:null});
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

module.exports = robot