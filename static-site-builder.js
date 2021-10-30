#!/usr/bin/env node

const fs = require('fs');
const Handlebars = require('handlebars');
const buildDateTime = new Date().getTime();
const jsdom = require("jsdom");
const {JSDOM} = jsdom;
const mkdirp = require('mkdirp');
const minifyHtml = require("@minify-html/js");
let sourceHTML;
let dom;
let sourceSCSS
const sass = require('node-sass');
const dotenv = require('dotenv');
const outputDir = 'dist';
let languages = ['en'];
let translationsPath;


build();

function build() {
  dotenv.config();
  if (!process.env.html) {
    console.info('*********************');
    console.info('I need to know which is the HTML source file you wanna use. I am using the default one: "src/index.html"');
    console.info('\nIn order to let me now another one, I need an environment variable called html with the relative path to it.');
    console.info('Eg: html=src/map.html');
    console.info('*********************\n\n');
    sourceHTML = fs.readFileSync('src/index.html').toString();
  } else {
    sourceHTML = fs.readFileSync(process.env.html).toString();
  }

  dom = new JSDOM(sourceHTML, {runScripts: "dangerously"});


  if (!process.env.scss) {
    console.info('*********************');
    console.info('I need to know which is the SCSS source file you wanna use. I am using the default one: "src/styles/main.scss"');
    console.info('\nIn order to let me now another one, I need an environment variable called scss with the relative path to it.');
    console.info('Eg: scss=src/styles/main.scss');
    console.info('*********************\n\n');
    sourceSCSS = fs.readFileSync("src/styles/main.scss");
  } else {
    sourceSCSS = fs.readFileSync(process.env.scss);
  }

  if (!process.env.languages) {
    console.info('*********************');
    console.info('I need to know in which languages you want to translate your app');
    console.info('\nI\'m using English, by default.');
    console.info('\nIn order to let me now your desired ones, I need an environment variable called languages with a list of languages codes');
    console.info('Eg: languages=["ca", "es"]');
    console.info('*********************\n\n');
  } else {
    languages = JSON.parse(process.env.languages);
  }

  if (!process.env.translations) {
    console.info('*********************');
    console.info('I need to know where to find translations files');
    console.info('\nI\'m using \'src/assets/i18n\' by default');
    console.info('\nIn order to let me now your desired ones, I need an environment variable called languages with a list of languages codes');
    console.info('Eg: translations=src/assets/my-translations/');
    console.info('*********************\n\n');
    translationsPath = 'src/assets/i18n';
  } else {
    translationsPath = process.env.translations;
  }


  try {
    fs.rmSync(outputDir, {recursive: true, force: true});

    mkdirp(outputDir).then(() => {
      languages.forEach((lang) => {
        const translations = JSON.parse(fs.readFileSync(`${translationsPath}/${lang}.json`));
        const withCssLinkTag = addHeadTags(translations);

        fs.writeFileSync(`${outputDir}/${lang}.html`, `<!DOCTYPE html>${getMinifiedHTML(getTranslatedHTML(withCssLinkTag, translations))}`);
      });

      comeSassToCSS();
      renameCssFile();
      finalMessage();

    });
  } catch (e) {
    console.info('****')
    console.error('Ooops! Something went wrong. Please, check the path of the environment variables you provided.')
    console.error(e)
    console.info('****')
  }
}

function comeSassToCSS() {
  const compiledCss = sass.renderSync({
    file: process.env.scss,
    outFile: `${outputDir}/styles.css`,
    outputStyle: 'compressed',
  }).css;

  fs.writeFileSync(`${outputDir}/styles.css`, compiledCss);
}

function getTranslatedHTML(file, translations) {
  const template = Handlebars.compile(file);
  return template(translations);
}

function getMinifiedHTML(file) {
  const cfg = minifyHtml.createConfiguration({keep_closing_tags: true, remove_bangs: false});
  return minifyHtml.minify(file, cfg);
}

function addHeadTags(translations) {
  dom.window.document.head.appendChild(getLinkTag());
  dom.window.document.head.appendChild(getMetaDescriptionTag(translations));
  dom.window.document.head.appendChild(getPageTitle(translations));


  return dom.window.document.documentElement.outerHTML;
}

function renameCssFile() {
  fs.rename(`${outputDir}/styles.css`, `${outputDir}/styles.${buildDateTime}.css`, function (err) {
    if (err) console.log('ERROR: ' + err);
  });
}

function getLinkTag() {
  const linkEl = dom.window.document.createElement('link');
  linkEl.setAttribute('rel', 'stylesheet');
  linkEl.setAttribute('href', `./css/styles.${buildDateTime}.css`);

  return linkEl;
}

function getMetaDescriptionTag(translations) {
  const metaDescriptionElement = dom.window.document.createElement('meta');
  metaDescriptionElement.setAttribute('name', 'description');
  metaDescriptionElement.setAttribute('content', translations.meta_description);

  return metaDescriptionElement;
}

function getPageTitle(translations) {
  const titleElement = dom.window.document.createElement('title');
  titleElement.text = translations.title;

  return titleElement;
}

function finalMessage() {
  console.info('** CONGRATULATIONS! **')
  console.info('Your fancy static website is built!');
  console.info('Check dist/ directory.');
}
