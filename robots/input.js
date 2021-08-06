const readline = require('readline-sync');
const robots = {
  state : require('./state.js')
}

async function robot(){
  const content = {
    maximumSentences: 7
  }
  content.searchTerm = askAndReturnSearchTerm(content);
  content.prefix = askAndReturnPrefix(content);
  robots.state.save(content);

  function askAndReturnSearchTerm(content){
    return readline.question("Please type the term: ");
  }
  function askAndReturnPrefix(){
    const prefixes = ['Who is', 'What is', 'The history of', 'CANCEL'];
    const selected = readline.keyInSelect(prefixes, "Please choose the prefix: ");
    return prefixes[selected];
  }
}

module.exports = robot