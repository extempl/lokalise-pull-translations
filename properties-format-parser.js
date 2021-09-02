const parser = require('properties-parser');

const parseProperties = (data) => parser.parse(data);

const updatePropertiesWithValues = (data, lang, keysToUpdate, platform) => {
  data = (data || '').replace(/(\\n|\\r|\\u)/g, '\\$1')
  const dataMap = parseProperties(data);
  keysToUpdate.forEach(key => {
    const translation = key.translations.find(t => t.language_iso === lang).translation;
    dataMap[key.key_name[platform]] = translation.replace("\n", '\n');
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
