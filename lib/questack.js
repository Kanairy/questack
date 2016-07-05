const Bot = require('slackbot-api');
const { List, Map } = require('immutable');

const bot = new Bot({
    token: process.env.SLACKBOT_TOKEN
});

const admin_id = 'U0JMKM2TZ';

// make a nice list output

let questionStack = List([]);

const isInQueue = (userId) => questionStack.some(e => e.includes(userId));

const findUser = (userId) => {
  var index;
  questionStack.forEach((e, i) => {
    if (e.get('user_id') === userId) {
      index = i;
    }
  })
  return index;
};

const questack = function() {

  bot.on('hello', event => {
    console.log(bot.groups);
    return;
    bot.groups.forEach(e => {
      bot.sendMessage(e.name, 'What a time to be alive');  
    });
  });

  bot.on('message', event => {
    console.log(event);
    if (event.text.includes('find') && event.text.includes('user') && event.text.includes('questack')) {
      event.reply('whoa!');
    }
  })

  bot.listen(/remove/, message => {
    if (message.user === admin_id) {
      message.reply(`${questionStack.get(0).get('real_name')} has been removed from the queue.`);
      questionStack = questionStack.delete(0);
    }
  });

  bot.listen(/list/, message => {
    if (message.user === admin_id) {
      message.reply(`${questionStack.toString()}`)
      if (questionStack.length === 0) {
        message.reply('Nobody left in queue!');
      }
    }
  });

  bot.listen(/book me/, message => {
    var byId = bot.find(message.user);
    if (!isInQueue(message.user)) {
      questionStack = questionStack.push(Map({user_id: message.user, real_name: byId.real_name, timestamp: message.ts}));
      message.reply(`Ok I've added you ${byId.real_name}, be patient! There are ${findUser(message.user)} people ahead of you.`);
    } else {
      message.reply(`Hi ${byId.real_name}! I already have you in queue, there are ${findUser(message.user)} people ahead of you.`);
    }
  });

}

bot.listen(/hey/i, questack());