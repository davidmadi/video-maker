const fs = require('fs');
const contentFilePath = "./content.json";

function save(content){
  const contentString = JSON.stringify(content);
  fsSaved = fs.writeFileSync(contentFilePath, contentString);
  console.log("content saved");
  return fsSaved;
}
function load(){
  const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8');
  const contentJson = JSON.parse(fileBuffer);
  return contentJson;
}

module.exports = {
  save, load
}