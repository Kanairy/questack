const Bot = require('slackbot-api');
const { List, Map } = require('immutable');
const Moment = require('moment');
const { getState, setState } = require('./questack_store');

const admin_id = 'U0JMKM2TZ';

const bot = new Bot({
  token: process.env.SLACKBOT_TOKEN
});

const students = [
  'Andrew Pratley',
  'Anthony Melouney',
  'Dean Cooper',
  'Denis Ng',
  'Jordan Etzler',
  'Magdalena Bialon',
  'Maggie McCain',
  'Rui Xu',
  'Sam West-Sooby',
  'Tad Davis'
];

const isInQueue = (userId, stack) => stack.some(e => e.includes(userId));

const getUserIndex = (userId, stack) => {
  return stack.reduce((a, b, i) => b.get('user_id') === userId 
      ? i 
      : a, undefined)
};

const makeNiceList = (stack) => {
  if (!stack.isEmpty()) {
    return stack.map((e, i) => `${i + 1}. ` 
      + e.get('name') + ', at ' 
      + Moment.unix(e.get('timestamp')).local().format("h:mm a")
      + '\n').join('');
  }
  else {
    return 'The list is currently empty.';
  }
};

const questack = () => {

  bot.on('hello', (event) => {
    //TODO: find out why this event spams
    // bot.groups.forEach(e => {
    //   bot.sendMessage(e.name, 'What a time to be alive');
    // });
  });

  bot.on('message', (event) => {
    // if (event.text.includes('find') && event.text.includes('user') && event.text.includes('questack')) {
    //   event.reply('whoa!');
    // }
  });

  bot.listen(/next/, (message) => {
    if (message.user === admin_id) {
      const person = getState().first();
      setState(getState().shift());
      message.reply(
        `Admin has removed ${person.get('name')} from the queue.`
      );
    }
  });

  bot.listen(/remove me/, (message) => {
    if (isInQueue(message.user, getState())) {
      const byId = bot.find(message.user);
      const personId = getUserIndex(message.user, getState());
      const person = getState().get(personId).full_name;
      setState(getState().delete(personId));
      message.reply(
        `You have removed yourself from the queue, ${byId.name}.`
      );
    } else {
      message.reply(`You were not in the queue anyway :troll:`);
    }
  });

  bot.listen(/list/, (message) => {
    message.reply(makeNiceList(getState()));
  });

  bot.listen(/roll the dice/, message => {
    const loser = students[Math.floor(Math.random() * students.length)];
    message.reply(`come on down, ${loser}!`);
  });

  bot.listen(/help/, (message) => {
    message.reply(
      `Hey! here are some of my functions:
        \`book me\` - add yourself to the queue.
        \`remove me\` - remove yourself from the queue.
        \`list\` - see the current queue.`
    );
  });

  bot.listen(/book me/, (message) => {
    const byId = bot.find(message.user);

    if (!isInQueue(message.user, getState())) {
      setState(getState().push(Map({
        user_id: message.user, 
        name: byId.name, 
        timestamp: message.ts
      })));

      message.reply(
        `Ok I've added you ${byId.name}! There are ${getUserIndex(message.user, getState())} people ahead of you. Type \`questack list\` to see the queue.`
      );
    } else {
      message.reply(
        `Hi there ${byId.name}! I already have you in queue, there are ${getUserIndex(message.user, getState())} people ahead of you. Type \`questack list\` to see the queue.`
      );
    }
  });

};

bot.listen(/hey/i, questack());
