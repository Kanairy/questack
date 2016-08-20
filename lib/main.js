const Botkit = require('botkit');
const { List, Map } = require('immutable');
const { getState, setState, isInQueue, getUserIndex, makeNiceList } = require('./questack_store');

const token = process.env.SLACKBOT_TOKEN

const admin_id = 'U0JMKM2TZ';

const controller = Botkit.slackbot({
  // reconnect to Slack RTM when connection goes bad
  retry: Infinity,
  debug: false
})

controller.spawn({
  token: token
}).startRTM(function(err) {
  if (err) {
    throw new Error(err);
  }
});

// controller.on('bot_channel_join', function (bot, message) {
//   bot.reply(message, "I'm here!")
// })

controller.hears(['hello', 'hi'], ['direct_mention'], function (bot, message) {
  bot.reply(message, 'Hello.')
});

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
    const personId = getUserIndex(message.user, getState());
    setState(getState().delete(personId));
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

controller.hears(['hello', 'hi'], ['direct_message'], function (bot, message) {
  bot.reply(message, 'Hello.')
  bot.reply(message, 'It\'s nice to talk to you directly.')
});

controller.hears('.*', ['mention'], function (bot, message) {
  bot.reply(message, 'You name dropping me, eh?. :heart:')
});

controller.hears('help', ['direct_message', 'direct_mention'], (bot, message) => {

  const help = `Hey there <@${message.user}>! Here are some of my functions:
        \`book me\` - add yourself to the queue.
        \`remove me\` - remove yourself from the queue.
        \`list\` - see the current queue.`
  bot.reply(message, help)
});

controller.hears(['attachment'], ['direct_message', 'direct_mention'], function (bot, message) {
  var text = 'Beep Beep Boop is a ridiculously simple hosting platform for your Slackbots.'
  var attachments = [{
    fallback: text,
    pretext: 'We bring bots to life. :sunglasses: :thumbsup:',
    title: 'Host, deploy and share your bot in seconds.',
    image_url: 'https://storage.googleapis.com/beepboophq/_assets/bot-1.22f6fb.png',
    title_link: 'https://beepboophq.com/',
    text: text,
    color: '#7CD197'
  }]

  bot.reply(message, {
    attachments: attachments
  }, function (err, resp) {
    console.log(err, resp)
  })
});

controller.hears('.*', ['direct_message', 'direct_mention'], function (bot, message) {
  bot.reply(message, 'Sorry <@' + message.user + '>, I don\'t understand. \n')
});