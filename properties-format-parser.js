const parser = require('properties-parser');

const parseProperties = (data) => parser.parse(data);

const updatePropertiesWithValues = (data, lang, keysToUpdate, platform) => {
  const dataMap = parseProperties(data);
  keysToUpdate.forEach(key => {
    dataMap[key.key_name[platform]] = key.translations.find(t => t.language_iso === lang).translation;
  })
  return Object.keys(dataMap)
  .sort()
  .map(key => `${key} = ${dataMap[key]}`)
  .join('\n') + '\n';
};

module.exports = {
  parseProperties,
  updatePropertiesWithValues
}
