const Bot = require('slackbot-api');
const { List, Map } = require('immutable');
const Moment = require('moment');

const bristol = require('bristol');
bristol.addTarget('console').withFormatter('human');

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

const store = () => {
    var intStore = List([]);
    return {
      store: intStore
    }
}

const isInQueue = (userId) => questionStack.store.some(e => e.includes(userId));

const isAdmin = (userId) => questionStack.store.some(e => e.includes(userId));

const findUser = (userId) => {
  var index;
  questionStack.store.forEach((e, i) => {
    if (e.get('user_id') === userId) {
      index = i;
    }
  });
  return index;
};

const makeNiceList = (stack) => {
  if (!stack.isEmpty()) {
    return stack.map((e, i) => `${i + 1}. ` + (e.get('real_name') + ', at ' + Moment.unix(e.get('timestamp')).format("h:mm:ss a") + '\n')).join('');
  }
  else {
    return 'The list is currently empty.';
  }
};

let questionStack = store();


var questack = function() {

  bot.on('hello', event => {
    bristol.info("It's alive! It's alive!", {'event-type': event.type});
    //TODO: find out why this event spams
    // bot.groups.forEach(e => {
    //   bot.sendMessage(e.name, 'What a time to be alive');
    // });
  });

  bot.on('message', event => {
    bristol.info("message event fired", {'whole-event': event});
    // if (event.text.includes('find') && event.text.includes('user') && event.text.includes('questack')) {
    //   event.reply('whoa!');
    // }
  });

  bot.listen(/next/, message => {
    if (message.user === admin_id) {
      // var nextPerson = bot.find(questionStack.store.get(1).get('user_id'));
      // bot.sendMessage(`@${nextPerson.name}`, `Hi ${nextPerson.real_name}, it's your turn!`);
      message.reply(`${questionStack.store.get(0).get('real_name')} has been removed from the queue.`);
      questionStack = questionStack.store.delete(0);
      message.reply(`${questionStack.store.get(0).get('real_name')}, it's your turn!`);
    }
  });

  bot.listen(/remove me/, message => {
    if (isInQueue(message.user)) {
      questionStack.store = questionStack.store.delete(findUser(message.user));
      message.reply(`You have removed yourself from the list, ${bot.find(message.user).real_name}.`);
    } else {
      message.reply(`You were not in the list anyway...`);

    }
  });

  bot.listen(/list/, message => {
    message.reply(makeNiceList(questionStack.store));
  });

  bot.listen(/roll the dice/, message => {
    var loser = students[Math.floor(Math.random() * students.length)];
    bristol.info("rolled the dice!", loser);
    message.reply(`you lose, ${loser}`);
  });

  bot.listen(/help/, message => {
    message.reply(
      `Hey! here are some of my functions:
        \`book me\` - add yourself to the queue.
        \`remove me\` - remove yourself from the queue.
        \`list\` - see the current queue.
      `
      )
  });

  bot.listen(/book me/, message => {
    var byId = bot.find(message.user);
    if (!isInQueue(message.user)) {
      questionStack.store = questionStack.store.push(Map({user_id: message.user, real_name: byId.real_name, timestamp: message.ts}));
      message.reply(`Ok I've added you ${byId.real_name}! There are ${findUser(message.user)} people ahead of you. Type \`questack list\` to see the queue.`);
    } else {
      message.reply(`Hi there ${byId.real_name}! I already have you in queue, there are ${findUser(message.user)} people ahead of you. Type \`questack list\` to see the queue.`);
    }
  });

};

bot.listen(/hey/i, questack());
