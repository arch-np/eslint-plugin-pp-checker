/**
 * @fileoverview feature sliced path checker
 * @author Archy
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/path-checker"),
  RuleTester = require("eslint").RuleTester;


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion:6,
    sourceType: "module",
  },
});
ruleTester.run("path-checker", rule, {
  valid: [
    {
      filename:"C:\\Programming\\learning\\prod-project-react\\src\\entities\\Article",
      code: "import { addCommentFormActions, addCommentFormReducer } from '../../model/slices/addCommentFormSlice'",
      errors: [],
    },
  ],

  invalid: [
    {
      filename:"C:\\Programming\\learning\\prod-project-react\\src\\entities\\Article",
      code: "import { addCommentFormActions, addCommentFormReducer } from '@/entities/Article/model/slices/addCommentFormSlice'",
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными" }],
      options:[
        {
          alias: '@',
        }
      ]
    },
    {
      filename:"C:\\Programming\\learning\\prod-project-react\\src\\entities\\Article",
      code: "import { addCommentFormActions, addCommentFormReducer } from 'entities/Article/model/slices/addCommentFormSlice'",
      errors: [{ message: "В рамках одного слайса все пути должны быть относительными" }],
    },
  ],
});
