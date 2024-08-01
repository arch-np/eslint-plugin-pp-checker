"use strict";

const {isPathRelative} = require("../helpers");
const micromatch = require('micromatch');
const path = require('path');

const PUBLIC_ERROR = 'PUBLIC_ERROR';
const TESTING_PUBLIC_ERROR = 'TESTING_PUBLIC_ERROR';

module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "public api import checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: 'code', // Or `code` or `whitespace`
    messages:{
      [PUBLIC_ERROR]: 'Абсолютный импорт разрешен только из Public Api(index.ts)',
      [TESTING_PUBLIC_ERROR]: 'Тестовые файлы необходимо импортировать только из Public Api(testing.ts)'
    },
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
        const slice=segments[1];

        if (!allowedLayers[layer]) {
          return;
        }

        if (isImportNotFromPublicApi && !isTestingPublicApi) {
          context.report({
                node,
                messageId: PUBLIC_ERROR,
                fix(fixer) {
                  return fixer.replaceText(node.source, `'${alias}/${layer}/${slice}'`);
                }
              });
        }

        if(isTestingPublicApi){
          const currentFilePath = context.getFilename();
          const normalizedPath = path.toNamespacedPath(currentFilePath);

          const isCurrentFileTest=testFilesPatterns.some(
              pattern => micromatch.isMatch(normalizedPath, pattern));

          if(!isCurrentFileTest){
            context.report({
              node, messageId: TESTING_PUBLIC_ERROR
            });
          }
        }
      }
    };
  },
};
