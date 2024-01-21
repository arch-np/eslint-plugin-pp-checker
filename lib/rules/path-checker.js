"use strict";

const path = require("path");

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature sliced path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },
//https://astexplorer.net/
  create(context) {
    return {
     ImportDeclaration(node) {

       // app/entities/Article
       const importTo = node.source.value;
       const fromFilename = context.getFilename();

       if (shouldBeRelative(fromFilename, importTo)) {
         context.report(node, 'В рамках одного слайса все пути должны быть относительными');
       }
     }
    };
  },
};

function isPathRelative(path){
  return path==='.'||path.startsWith('./')||path.startsWith('../');
}

const layers={
  'entities': 'entities',
  'features': 'features',
  'pages': 'pages',
  'widgets': 'widgets',
  'shared': 'shared',
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

  const normalizedPath = path.toNamespacedPath(from);
  const projectFrom = normalizedPath.split('src')[1]; //C:/Programming/learning/eslint-plugin-pp-checker-[0]/src-[1]/app
  const fromArray = projectFrom.split('\\');

  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if(!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return toLayer === fromLayer && toSlice === fromSlice;
}