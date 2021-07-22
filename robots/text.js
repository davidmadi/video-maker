const algorithmia = require("algorithmia");
const algorithmiaCredentials = require("../credentials/algorithmia.json")
const sentenceBoundaryDetection = require("sbd");

async function robot(content){
  await fetcContentFromWikipedia(content);
  sanitizeContent(content);
  breakContentIntoSentences(content);

  async function fetcContentFromWikipedia(content){
    const algorithmiaAuthenticated = algorithmia.client(algorithmiaCredentials.apiKey);
    const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2?timeout=300"); // timeout is optional
    const input = `{ "search": "Michael Jackson" "lang": "en" };`
    let wikipediaResponse = await wikipediaAlgorithm.pipe(input);
    let wikipediaContent = wikipediaResponse.get();
    content.sourceContentOriginal = wikipediaContent.content;
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
}
module.exports = robot;