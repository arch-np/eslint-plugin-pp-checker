"use strict";

const path = require("path");
const {isPathRelative} = require("../helpers");

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature sliced path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: 'code', // Or `code` or `whitespace`
    schema: [
      {
        type: "object",
        properties: {
          alias: {
              type: "string",
          },
        },
        additionalProperties: false,
      }
    ], // Add a schema if the rule has options
  },
//https://astexplorer.net/
  create(context) {
    const alias = context.options[0]?.alias||'';

    return {
     ImportDeclaration(node) {

       // app/entities/
       const value=node.source.value;
       const importTo = alias ? value.replace(`${alias}/`, '') : value;
       const fromFilename = context.getFilename();

       if (shouldBeRelative(fromFilename, importTo)) {
         context.report({
           node,
           message:'В рамках одного слайса все пути должны быть относительными',
           fix(fixer) {
             const normalizedPath = getNormalizedPath(fromFilename)
                 .split('/')
                 .slice(0, -1)
                 .join('/');

             let relativePath=path.relative(normalizedPath,'/' + importTo)
                 .split('\\')
                 .join('/');

             if (!relativePath.startsWith('.')) {
               relativePath = './' + relativePath;
             }
             return fixer.replaceText(node.source, `'${relativePath}'`);
           }
         });
       }
     }
    };
  },
};

const layers={
  'entities': 'entities',
  'features': 'features',
  'pages': 'pages',
  'widgets': 'widgets',
  'shared': 'shared',
}

function getNormalizedPath(filePath) {
  const normalizedPath = path.toNamespacedPath(filePath);
  const projectFrom = normalizedPath.split('src')[1]; //C:/Programming/learning/eslint-plugin-pp-checker-[0]/src-[1]/app
  return projectFrom.split('\\').join('/');
}

function shouldBeRelative(from,to){
  if(isPathRelative(to)){
    return false;
  }

  // example entities/User
  const toAsArray = to.split('/');
  const toLayer = toAsArray[0]; // entities
  const toSlice = toAsArray[1]; // User

  if(!toSlice || !toLayer || !layers[toLayer]) {
    return false;
  }

  const projectFrom = getNormalizedPath(from); //C:/Programming/learning/eslint-plugin-pp-checker-[0]/src-[1]/app
  const fromArray = projectFrom.split('/');

  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if(!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return toLayer === fromLayer && toSlice === fromSlice;
}

// console.log(shouldBeRelative('C:\\Users\\src\\entities\\Article', 'entities/Article/fasfasfas'))
// console.log(shouldBeRelative('C:\\Users\\src\\entities\\Article', 'features/Article/fasfasfas'))
// console.log(shouldBeRelative('C:/Users/src/entities/Article', 'features/Article/asfasf/asfasf'))