const path = require('path');
const fs = require('fs');


const entries = {}
const clientDir = path.resolve(__dirname, '../src/client')
const files = fs.readdirSync(clientDir);
files.forEach(function (filename) {
  const entryDir = path.join(clientDir, filename)
  const stat = fs.lstatSync(entryDir)
  if(stat.isDirectory() && filename.endsWith('Entry')){
    const key = filename.replace('Entry', '').toLowerCase()
    const files2 = fs.readdirSync(entryDir);
    files2.forEach(function(fname){
      const filePath = path.join(entryDir, fname)
      if(fs.lstatSync(filePath).isFile() && fname==='client.js'  ){
        entries[key] = filePath
      }
    })
  }
})

module.exports = entries