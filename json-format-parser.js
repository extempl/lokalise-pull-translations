const JSON_DELIMITER = '::';

function objectToKeyValuePairs (o, prefix = '') {
  const names = [];
  Object.keys(o).forEach(key => {
    if (typeof o[key] === 'object') {
      const children = objectToKeyValuePairs(o[key], prefix + key + JSON_DELIMITER);
      children.forEach(c => names.push(c));
    } else {
      names.push({ key: prefix + key, value: o[key] });
    }
  })
  return names;
}

function sortObject (obj) {
  const entries = Object.entries(obj);
  const sortedEntries = entries.sort((a, b) => a[0].toLowerCase() < b[0].toLowerCase() ? -1 : 1);
  return Object.fromEntries(sortedEntries);
}

function updateJsonWithValues (jsonString, lang, keysToUpdate, platform) {
  const json = JSON.parse(jsonString || '{}');
  keysToUpdate.forEach(key => {
    const traverse = (jsonPart, keyName, translation) => {
      const topKeyPart = keyName.shift();
      if (keyName.length) {
        if (!jsonPart[topKeyPart]) {
          jsonPart[topKeyPart] = {}
        }
        traverse(jsonPart[topKeyPart], keyName, translation);
        jsonPart[topKeyPart] = sortObject(jsonPart[topKeyPart]);
      } else {
        jsonPart[topKeyPart] = translation;
      }
    }

    const keyName = key.key_name[platform].split(JSON_DELIMITER);
    const translation = key.translations.find(t => t.language_iso === lang).translation;
    console.log('updating', key.key_name[platform], 'with', translation)

    traverse(json, keyName, translation);
  })

  return json;
}

module.exports = {
  objectToKeyValuePairs,
  updateJsonWithValues
}
