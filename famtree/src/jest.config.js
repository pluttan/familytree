export default {
    testEnvironment: 'node',
    transformIgnorePatterns: ['node_modules/(?!(sucrase)/)'],
    transform: {
        '^.+\\.(js|jsx|ts|tsx|mjs)$': 'babel-jest',
    },
    extensionsToTreatAsEsm: ['.js', '.jsx'],
};