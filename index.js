const readline = require('readline-sync');
function start(){
  const content = {}
  content.searchTerm = askAndReturnSearchTerm();
  content.prefix = askAndReturnPrefix();

  function askAndReturnSearchTerm(){
    return readline.question("Please type the term: ");
  }
  function askAndReturnPrefix(){
    const prefixes = ['Who is', 'What is', 'The history of', 'CANCEL'];
    const selected = readline.keyInSelect(prefixes, "Please choose the prefix: ");
    return prefixes[selected];
  }

  console.log(content);
}

start();