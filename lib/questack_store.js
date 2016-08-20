const Moment = require('moment');

const { List } = require('immutable');

const Stack = () => {
  let store = List([]);

  const setState = (val) => store = val;

  const getState = () => store;

  const isInQueue = (userId, stack) => stack.some(e => e.includes(userId));

  const getUserIndex = (userId, stack) => {
    return stack.reduce((a, b, i) => b.get('user_id') === userId 
      ? i 
      : a, undefined);
  };

  const makeNiceList = (stack) => {
    if (!stack.isEmpty()) {
      return stack.map((e, i) => `${i + 1}. ` 
        + `${e.get('name')}, at ` 
        + Moment.unix(e.get('timestamp')).utc().add(e.get('timezone'), 'seconds').format("h:mm a")
        + '\n').join('');
    }
    else {
      return 'The list is currently empty.';
    }
  };

  return {
    setState,
    getState,
    isInQueue,
    getUserIndex,
    makeNiceList
  }
};

module.exports = Stack();