const Botkit = require('botkit');
const { List, Map } = require('immutable');
const { getState, setState, isInQueue, getUserIndex, makeNiceList } = require('./questack_store');

const token = process.env.SLACKBOT_TOKEN;

const admin_id = 'U0JMKM2TZ';

const controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
});

controller.spawn({token}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});

// controller.on('bot_channel_join', function (bot, message) {
//   bot.reply(message, "I'm here!")
// })

// controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
//   bot.reply(message, 'Hello.')
// });

controller.hears(['next'], ['direct_mention'], (bot, message) => {
  if (message.user !== admin_id) {
    bot.reply(
      message,
      `Sorry <@${message.user}>, you are not authorised!`
    );
    return;
  }
  setState(getState().shift());
  bot.reply(
    message,
    `Admin has removed <@${message.user}> from the queue.`
  );
  return;
});

controller.hears(['list'], ['direct_mention'], (bot, message) => {
  bot.reply(
    message,
    makeNiceList(getState())
  );
});

controller.hears(['book me', 'add me', 'queue me'], ['direct_mention'], (bot, message) => {

  if (!isInQueue(message.user, getState())) {
    bot.api.users.info({user: message.user},function(err,response) {
      setState(getState().push(Map({
        user_id: message.user,
        name: response.user.name, 
        timestamp: message.ts,
        timezone: response.user.tz_offset
      })));

      bot.reply(
        message,
        `Ok I've added you <@${message.user}>! There are ${getUserIndex(message.user, getState())} people ahead of you. Type \`questack list\` to see the queue.`
      );

      bot.startPrivateConversation(message, function(err,convo) {
        convo.say(`Hey <@${message.user}>, it's group project week! Be advised, your questions need to have more structure than usual, and the responses you receive will be more *advisorial* than actual implementational. 
          If you do have a technical issue, you need to *frame the question* as specifically as you can. Consider the following:
            * If you are using a third party library/api, have relevant documentation ready
            * If you have an error message, come with an explanation of how you receive/recreate it
          Good luck!`
        );
      });
      
    });

  } else {
    bot.reply(
      message,
      `Hi there <@${message.user}>! I already have you in queue, there are ${getUserIndex(message.user, getState())} people ahead of you. Type \`questack list\` to see the queue.`
    )
  }
});

controller.hears(['remove me'], ['direct_mention'], (bot, message) => {
  if (isInQueue(message.user, getState())) {
    const userIndex = getUserIndex(message.user, getState());
    setState(getState().delete(userIndex));
    bot.reply(
      message,
      `You have removed yourself from the queue, <@${message.user}>.`
    );
  } else {
    bot.reply(
      message,
      `You were not in the queue anyway :troll:`
    );
  }
});

controller.hears('.*', ['mention'], (bot, message) => {
  bot.reply(message, 'You name dropping me, eh? :heart:')
});

controller.hears('help', ['direct_message', 'direct_mention'], (bot, message) => {
  bot.reply(
    message,
    `Hey there <@${message.user}>! Here are some of my functions:
      \`book me\` - add yourself to the queue.
      \`remove me\` - remove yourself from the queue.
      \`list\` - see the current queue.`
  )
});

controller.hears('.*', ['direct_message', 'direct_mention'], (bot, message) => {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
});