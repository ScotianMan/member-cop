/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
const axios = require('axios')
const HTMLParser = require('node-html-parser')

module.exports = app => {

  app.on('issue_comment', async context => {

    sender = context['payload']['sender']['login']
    bot = context['payload']['sender']['type']
    // prevent infinite loop since this action is triggered even when a bot posts a comment :-P
    if (bot != 'Bot'){
      // Probably a sexier way of doing this regex
      org = context['payload']['issue']['html_url']
      var frontRegex = /https:\/\/github.com\//g
      org = org.replace(frontRegex, '')
      var backRegex = /\/.*/g
      org = org.replace(backRegex, '')
      url = 'https://api.github.com/orgs/' + org + '/members/' + sender

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
          comments_url = context['payload']['comment']['html_url']

          axios.get(comments_url)
          .then(response => {
            // Lets get clever and scrape the HTML and see if this is a private member or not
            // get the id of the comment parent div
            var comment_regex = /.+?(?=#)/g
            comment_id_str = comments_url.replace(comment_regex, '')
            // Does the page show the commenter to be a member of the repo?
            const root = HTMLParser.parse(response.data)
            comment_html = root.querySelector(comment_id_str).toString()
            owner_str = 'This user is the owner of the'
            member_str = 'You are a member of the'
            
            // TODO: Has this person posted in this comments before? if so we should only have the bot reply once
            if (!comment_html.includes(owner_str) && !comment_html.includes(member_str)){
              // Here we finally know if the person posting the comment is a member.... even private ones muahahahaha ;-)
              // TODO: abstract this message to a config file somewhere
              const issueComment = context.issue({
                body: 'Hey @' + sender + 
                ', thanks for expressing your interest. We would love your help with this issue.' + 
                ' Please follow these <a href="https://github.com/ifmeorg/ifme/wiki/Join-Our-Slack">next steps</a>' +
                ' to join our contributor community.'
              })
              return context.github.issues.createComment(issueComment)
            }
          })
          .catch(error => {
            // booo
            app.log('Somthing went wrong getting the issue page', error)
          })
        }
      })
    }
  })
}