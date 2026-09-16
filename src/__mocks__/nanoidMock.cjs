// Deterministic counter-based nanoid mock for tests
let _counter = 0;
module.exports = {
  nanoid: () => `test-id-${++_counter}`,
  customAlphabet: () => () => `test-id-${++_counter}`,
};
