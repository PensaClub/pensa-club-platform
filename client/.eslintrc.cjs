module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    settings: { react: { version: '18.2' } },
    plugins: ['react-refresh'],
    rules: {
        // 🔧 Твои custom правила:
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],

        // Предупреждения вместо грешки
        'no-unused-vars': 'warn',

        // React правила
        'react/prop-types': 'off', // Изключи ако не използваш PropTypes
        'react/react-in-jsx-scope': 'off', // За React 17+

        // Стил правила
        'indent': ['warn', 2],
        'semi': ['warn', 'always'],
        'comma-dangle': ['warn', 'always-multiline'],

        // Хуки правила
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        // Други полезни правила
        'no-duplicate-imports': 'error',
        'no-console': ['error', { allow: ['warn', 'error', 'log'] }],

        'no-multiple-empty-lines': ['error', { max: 1 }],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],
    },
};