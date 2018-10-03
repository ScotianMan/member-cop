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
    bot = context['payload']['sender']['type']
    if (bot != 'bot'){
      org = context['payload']['issue']['html_url']
      var frontRegex = /https:\/\/github.com\//g
      org = org.replace(frontRegex, '')
      var backRegex = /\/.*/g
      org = org.replace(backRegex, '')
      url = 'https://api.github.com/orgs/' + org + '/members/' + sender
      app.log('====')
      app.log(url)
      app.log('====')
      axios.get(url)
        .then(response => {
          // We dont really want to do anything when members comment 
        })
        .catch(error => {
          private_or_not_member_message = 'User does not exist or is not a public member of the organization'
          err_msg = error.response.data.message
          if (private_or_not_member_message = err_msg){
            // Here we are either sure this person is not a member or a private member. 
            // Lets make sure they are not a private member
            comments_url = context['payload']['issue']['comments_url']
            axios.get(comments_url)
            .then(response => {
              // Does the page show the commenter to be a member of the repo?
              app.log(response)
            })
            .catch(error => {
              // booo
              app.log('Somthing went wrong getting the issue page')
            })

          }
        })


      const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
      return context.github.issues.createComment(issueComment)
    }
  })

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}
