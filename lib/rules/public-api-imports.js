"use strict";

const {isPathRelative} = require("../helpers");
const micromatch = require('micromatch');

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "public api import checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [
      {
        type: "object",
        properties: {
          alias: {
            type: "string",
          },
          testFilesPatterns: {
            type: "array",
          },
        },
        additionalProperties: false,
      }
    ]
  },

  create(context) {
    const {alias='',testFilesPatterns=[]} = context.options[0]??{};

    const allowedLayers={
      'entities': 'entities',
      'features': 'features',
      'pages': 'pages',
      'widgets': 'widgets'
    }

    return {
      ImportDeclaration(node) {
        const value=node.source.value;
        const importTo = alias ? value.replace(`${alias}/`, '') : value;

        if (isPathRelative(importTo)) {
         return;
        }

        // [entities, ratingCard, model,types]
        const segments=importTo.split('/')
        const isImportNotFromPublicApi=segments.length>2;
        const isTestingPublicApi = segments[2]==='testing'&& segments.length<4;

        const layer=segments[0];

        if (!allowedLayers[layer]) {
          return;
        }

        if (isImportNotFromPublicApi && !isTestingPublicApi) {
          context.report(node, 'Абсолютный импорт разрешен только из Public Api(index.ts)');
        }

        if(isTestingPublicApi){
          const currentFilePath = context.getFilename();

          const isCurrentFileTest=testFilesPatterns.some(
              pattern => micromatch.isMatch(currentFilePath, pattern));

          if(!isCurrentFileTest){
            context.report(node, 'Тестовые файлы необходимо импортировать только из Public Api(testing.ts)');
          }
        }
      }
    };
  },
};
