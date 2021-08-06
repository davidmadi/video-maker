const algorithmia = require("algorithmia");
const sentenceBoundaryDetection = require("sbd");
const algorithmiaCredentials = require("../credentials/algorithmia.json")
const watsonCredentials = require('../credentials/watson.json');
const robots = {
  state : require('./state.js')
}

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const naturalLanguageUnderstanding = new NaturalLanguageUnderstandingV1({
  version: '2021-03-25',
  authenticator: new IamAuthenticator({
    apikey: watsonCredentials.apiKey,
  }),
  serviceUrl: watsonCredentials.url,
});


async function robot(){
  const content = robots.state.load();

  await fetchContentFromWikipedia(content);
  sanitizeContent(content);
  breakContentIntoSentences(content);
  limitMaximumSentences(content);
  await fetchKeywordOfAllSentences(content);
  robots.state.save(content);

  async function fetchContentFromWikipedia(content){
    const algorithmiaAuthenticated = algorithmia.client(algorithmiaCredentials.apiKey);
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2?timeout=300"); // timeout is optional
    const input = `{ "search": ${content.searchTerm} "lang": "en" };`
    let wikipediaResponse = await wikipediaAlgorithm.pipe(input);
    let wikipediaContent = wikipediaResponse.get();
    content.sourceContentOriginal = wikipediaContent.content;
  }

  function limitMaximumSentences(content){
    content.sentences = content.sentences.slice(0, content.maximumSentences);
  }

  function sanitizeContent(content){
    const cleanedLines = removeBlankLinesAndMarkDowns(content.sourceContentOriginal);
    content.sourceContentSanitized = cleanedLines.join(' ');

    function removeBlankLinesAndMarkDowns(text){
      const allLines = text.split("\n");
      const withoutBlankLines = allLines.filter((line)=>{
        if (line.trim().length === 0 || line.trim().startsWith("=")){
          return false;
        }
        return true;
      })
      return withoutBlankLines;
    }
  }

  function breakContentIntoSentences(content){
    content.sentences = [];
    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);
    sentences.forEach((sentence)=>{
      content.sentences.push({
        text: sentence,
        keywords:[],
        images:[]
      })
    })
  }

  async function fetchKeywordOfAllSentences(content){
    for(const sentence of content.sentences){
      sentence.keywords = await fetchNLASentenceKeyWords(sentence.text);
    }
  }

  function fetchNLASentenceKeyWords(sentence){
    return new Promise(async (resolve, reject) =>{
      const analyzeParams = {
        'text': sentence,
        'features': {
          'keywords': {}
        }
      };
      
      try
      {
        const analysisResults = await naturalLanguageUnderstanding.analyze(analyzeParams);
        resolve(analysisResults.result.keywords.map(k => k.text));
      }
      catch(err){
        reject(err)
      }
    });
  }  
}
module.exports = robot;