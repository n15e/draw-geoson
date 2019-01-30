module.exports = {
    extends: [
        'react-app',
        'airbnb',
        'plugin:prettier/recommended',
    ],
    rules: {
        'arrow-parens': ['error', 'as-needed'],
        'no-console': ['error', {allow: ['warn', 'error']}],
        'object-curly-spacing': ['error', 'never'],
        'no-restricted-syntax': ['error', 'ForInStatement', 'WithStatement'],
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-indent': ['error', 4],
        'react/require-default-props': 'off',
        'react/forbid-prop-types': 'off',
        'react/jsx-filename-extension': ['error', {extensions: ['.js']}],
        'jsx-a11y/no-static-element-interactions': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'react/no-unused-prop-types': 'off', // due to a bug with destructuring props object

        //temporary
        'no-plusplus': 'off',
        'no-underscore-dangle': 'off',
        'class-methods-use-this': 'off',
        'prefer-destructuring': 'off',
        'import/prefer-default-export': 'off',
        'react/destructuring-assignment': 'off',
        'react/no-multi-comp': 'off',
        'react/sort-comp': 'off',
        'react/no-did-update-set-state': 'off',
        'react/jsx-one-expression-per-line': 'off',
    }
};
