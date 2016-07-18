const { List } = require('immutable');

const Stack = () => {
  let store = List([]);

  const setState = (val) => store = val;

  const getState = () => store;

  return {
    setState,
    getState
  }
};

module.exports = Stack();