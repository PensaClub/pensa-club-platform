module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react/jsx-runtime',
        'plugin:react-hooks/recommended',
        'plugin:import/recommended', // ⬅️ ДОБАВИ
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs'],
    parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
    settings: { 
        react: { version: '18.2' },
        'import/resolver': { // ⬅️ ДОБАВИ
            node: {
                extensions: ['.js', '.jsx', '.ts', '.tsx']
            }
        }
    },
    plugins: ['react-refresh', 'import'], // ⬅️ ДОБАВИ import
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
        'react/react-in-jsx-scope': 'off', 

        // Стил правила
        // 'indent': ['warn', 2],
        'semi': ['warn', 'always'],
        // 'comma-dangle': ['warn', 'always-multiline'],

        // Хуки правила
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'warn',

        // Други полезни правила
        'no-duplicate-imports': 'error',
        'no-console': ['error', { allow: ['warn', 'error', 'log'] }],

        // ⬅️ ОБНОВЕНО: Максимум 2 празни реда, повече = грешка
        'no-multiple-empty-lines': ['error', { max: 2, maxEOF: 1, maxBOF: 0 }],
        'object-curly-spacing': ['error', 'always'],
        'array-bracket-spacing': ['error', 'never'],

        // ⬅️ НОВО: Import правила
        'import/no-unresolved': 'error', // Грешка за липсващи импорти
        'import/named': 'error', // Проверка за named imports
        'import/default': 'error', // Проверка за default imports
        'import/namespace': 'error', // Проверка за namespace imports
        'import/no-duplicates': 'error', // Забрана за дублирани импорти
        'import/order': ['warn', { // Подреждане на импортите
            'groups': [
                'builtin',
                'external',
                'internal',
                'parent',
                'sibling',
                'index'
            ],
            'newlines-between': 'never'
        }],
        'import/newline-after-import': 'warn', // Нов ред след импортите
        'import/no-unused-modules': 'warn', // Предупреждение за неизползвани модули
    },
};