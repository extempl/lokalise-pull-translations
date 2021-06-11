const path = require('path');
const { updatePropertiesWithValues } = require("./properties-format-parser");
const { updateJsonWithValues } = require("./json-format-parser");

const LANG_ISO_PLACEHOLDER = '%LANG_ISO%';

let _context;
let _lokalise;
let _fs;

module.exports = async (context, { LokaliseApi, fs }) => {
  _context = context;
  _lokalise = new LokaliseApi({ apiKey: context.apiKey });
  _fs = fs;

  const languageCodes = await getLanguageISOCodes();

  const remoteKeys = await getRemoteKeys({filter_tags: context.ref, include_translations: 1});
  const allRequiredI18nAreDone = checkRequiredTranslations(remoteKeys, context.requiredLangs);

  console.log(`${remoteKeys.length} remote keys.`);

  const localKeys = await getLocalKeys(languageCodes);

  const updatedKeys = await getUpdatedKeys(localKeys, remoteKeys, languageCodes);

  await updateKeys(updatedKeys, languageCodes);

  return {
    updatedKeys: remoteKeys.length,
    allRequiredI18nAreDone
  }
}

function checkRequiredTranslations(keys, requiredLangs) {
  return requiredLangs.split(',').every(lang => {
    return keys.every(key => {
        return (key.translations.find(t => t.language_iso === lang) || {}).translation
    })
  })
}

async function getLocalKeys (languageCodes) {
  const languageKeys = {};
  const readFilePromises = languageCodes.map(async (lang) => {
    try {
      languageKeys[lang] = await readLanguageFile(lang);
    } catch (error) {
      console.error(`Error reading language file ${lang}: ${error.message}`)
    }
  })

  await Promise.all(readFilePromises);
  return languageKeys;
}

async function getRemoteKeys (config) {
  const {
    projectId,
    platform,
  } = _context;

  const loadMore = async (page = 1) => await _lokalise.keys.list({
    ...config,
    project_id: projectId,
    filter_platforms: platform,
    page,
    limit: 5000
  });

  let keys = [];

  let newKeys;

  for (let page = 1; !newKeys || newKeys.hasNextPage(); page++) {
    newKeys = await loadMore(page);
    keys = keys.concat(newKeys.items);
  }

  return keys;
}

async function getUpdatedKeys (localKeys, remoteKeys, languageCodes) {
  const languageKeys = {};
  languageCodes.forEach((lang) => {
    switch (_context.format) {
      case 'json':
        languageKeys[lang] = updateJsonWithValues(localKeys[lang], lang, remoteKeys, _context.platform);
        break;
      case 'properties':
        languageKeys[lang] = updatePropertiesWithValues(localKeys[lang], lang, remoteKeys, _context.platform);
        break;
      default:
        throw new Error('No parser found for format');
    }
  });

  return languageKeys;
}

async function updateKeys(updatedKeys, languageCodes) {
  const writeFilePromises = languageCodes.map(async (lang) => {
    try {
      await writeLanguageFile(lang, updatedKeys[lang]);

    } catch (error) {
      console.error(`Error writing language file ${lang}: ${error.message}`)
    }
  });
  return await Promise.all(writeFilePromises);
}

function buildLanguageFilePath (languageCode) {
  return path.join(_context.directory, _context.filename.replace(LANG_ISO_PLACEHOLDER, languageCode))
}

async function getLanguageISOCodes () {
  const languages = await _lokalise.languages.list({
    project_id: _context.projectId
  });
  const languageCodes = languages.items.map(x => x.lang_iso);
  console.log('Project language codes', languageCodes);
  return languageCodes;
}

function readLanguageFile (lang) {
  const path = buildLanguageFilePath(lang);
  return new Promise((resolve, reject) => {
    _fs.readFile(path, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Read language file ' + path);
      resolve(data);
    });
  })
}

function writeLanguageFile (lang, content) {
  const path = buildLanguageFilePath(lang);
  return new Promise((resolve, reject) => {
    _fs.writeFile(path, content, 'utf8', (err) => {
      if (err) {
        reject(err);
        return;
      }
      console.log('Write language file ' + path)
      resolve();
    });
  })
}
