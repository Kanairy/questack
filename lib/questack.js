const Bot = require('slackbot-api');
const Immutable = require('immutable');
const secret = require('./secret')

const bot = new Bot({
    token: secret.token
});


// todo: add timestamp too
// make the question stack an array of objects
// add database
// make a nice list output
// use immutablejs
// actually commit!






// var questionStack = [];


// var questack = function() {

//   bot.on('hello', event => {
//     console.log(bot.groups);
//     bot.groups.forEach(e => {
//       bot.sendMessage(e.name, 'What a time to be alive');  
//     });
//   });

//   bot.listen(/hi/, message => {
//     message.reply('Hello! I ');
//   });

//   bot.listen(/remove/, message => {
//     if (message.user === secret.admin_id) {
//       questionStack.shift();
//       if (questionStack.length === 0) {
//         message.reply('Nobody left in queue!');
//       }
//     }
//   });

//   bot.listen(/list/, message => {
//     if (message.user === secret.admin_id) {
//       message.reply(`${questionStack.toString()}`)
//       if (questionStack.length === 0) {
//         message.reply('Nobody left in queue!');
//       }
//     }
//   });

//   bot.listen(/book me/, message => {
//     var byId = bot.find(message.user);
//     if (questionStack.indexOf(byId.real_name) === -1) {
//       questionStack.push(byId.real_name);
//       message.reply(`Ok ive added you ${byId.real_name}, be patient! There are ${questionStack.indexOf(message.user) +1} people ahead of you.`);
//     } else {
//       message.reply(`I already have '${byId.real_name}' in queue, there are ${questionStack.indexOf(message.user) +1} people ahead of you.`);
//     }
//   });

// }

// bot.listen(/hey/i, questack());