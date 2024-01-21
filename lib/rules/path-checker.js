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

       context.report(node, 'Ругань в импорте!!!');
     }
    };
  },
};


