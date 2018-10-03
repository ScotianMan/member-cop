/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
const axios = require('axios');

module.exports = app => {
  // Your code here
  app.log('Yay, the app was loaded!')

  app.on('issue_comment', async context => {
    app.log(context.payload)

    sender = context['payload']['sender']['login']
    if (sender != 'member-cop[bot]'){
      org = context['payload']['issue']['html_url']
      var frontRegex = /https:\/\/github.com\//gi;
      org.replace(frontRegex, '')
      var backRegex = /\/.*/gi;
      org.replace(backRegex, '')
      app.log(org)
      // axios.get('https://api.github.com/orgs/' + org + '/members/' + sender)
      // .then(response => {
      //   console.log(response.data.url);
      //   console.log(response.data.explanation);
      // })
      // .catch(error => {
      //   console.log(error);
      // });


      const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
      return context.github.issues.createComment(issueComment)
    }
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
