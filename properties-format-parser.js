const parser = require('properties-parser');

const parseProperties = (data) => parser.parse(data);

const updatePropertiesWithValues = (data, lang, keysToUpdate, platform) => {
  data = (data || '').replace(/(\\n|\\r|\\\u0020)/g, '\\$1')
  const dataMap = parseProperties(data);
  keysToUpdate.forEach(key => {
    const translation = key.translations.find(t => t.language_iso === lang).translation;
    dataMap[key.key_name[platform]] = translation.replace("\n", '\n');
  })
  return Object.keys(dataMap)
  .sort()
  .map(key => {
    const value = dataMap[key];
    return `${key} = ${['\\', ''].includes(value) ? '\\\u0020' : value}`;
  })
  .join('\n') + '\n';
};

module.exports = {
  parseProperties,
  updatePropertiesWithValues
}
