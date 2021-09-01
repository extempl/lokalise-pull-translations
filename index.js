const core = require('@actions/core');
// const wait = require('./wait');
const { LokaliseApi } = require('@lokalise/node-api');
const fs = require('fs');
const main = require('./main');

// most @actions toolkit packages have async methods
const apiKey = core.getInput('api-token');
const ref = core.getInput('ref');
const requiredLangs = core.getInput('requiredLangs');
const filename = core.getInput('filename');
const directory = core.getInput('directory');
const projectId = core.getInput('project-id');
const format = core.getInput('format');
const platform = core.getInput('platform');
const useFilepath = core.getInput('use-filepath');

main({
  apiKey,
  ref,
  requiredLangs,
  filename,
  useFilepath,
  directory,
  projectId,
  format,
  platform
}, {
  LokaliseApi, fs
})
.then(data => Object.keys(data).forEach(k => core.setOutput(k, data[k])))
.catch((error) => core.setFailed(error.message))
