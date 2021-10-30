# Static site builder

This project is a static site builder It's built using just HTML and CSS.
Handlebars@4.7.7 is used for parsing HTML, so Handlebars features can be used.

## Steps to build a project with ```static-sites-builder```
1. ```mkdir my-fancy-static-website```
2. ```cd my-fancy-static-website```
3. ```npm init --y```
4. ```n```
5. Create an ```html``` file you wanna use. Eg: ```index.html```
6. Create a ```scss``` file.  Eg: ```main.scss```
7. Create a json file for every language you wanna translate your site into (Eg: src/assets/en.json)
8. Create an .env file with the following environment props (see .env.example for reference):
   1. ```html```= Absolute path to your .html file (Eg: src/index.html)
   2. ```scss```= Absolute path to your .scss file (Eg: src/styles/main.scss)
   3. ```languages```= List of the languages you wanna translate your site into (Eg: ['es', 'en', 'ca']). For each of them an ```html``` file will be generated.
   4. ```translations```= Path of the translations file (Eg: src/assets/i18n)
10. Add the following script to your package.json scripts ```"build:all": "build-site"```
11. Run ```npm run build```
12. Check your the ```dist``` directorty ```at my-fancy-static-website``` directory.
