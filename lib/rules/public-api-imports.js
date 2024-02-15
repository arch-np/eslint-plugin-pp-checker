"use strict";

const {isPathRelative} = require("../helpers");

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
        },
        additionalProperties: false,
      }
    ]
  },

  create(context) {
    const alias = context.options[0]?.alias||'';

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

        const layer=segments[0];

        if (!allowedLayers[layer]) {
          return;
        }

        if (isImportNotFromPublicApi) {
          context.report(node, 'Абсолютный импорт разрешен только из Public Api(index.ts)');
        }
      }
    };
  },
};
