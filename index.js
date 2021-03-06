/**
 * This is the entry point for your Probot App.
 * @param {import('probot').Application} app - Probot's Application class.
 */
const axios = require('axios')
var http = require("http");
const HTMLParser = require('node-html-parser')

module.exports = app => {

  // pesky heroku app going to sleep
  setInterval(function() {
      http.get("http://still-bastion-87015.herokuapp.com/");
  }, 300000);

  app.on('issue_comment', async context => {
    const config = await context.config('config.yml')
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
        app.log('====')
        app.log('Public member comment')
        app.log('====')
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
            app.log('====')
            app.log(comments_url)
            app.log('====')
            app.log(comment_id_str)
            app.log('====')
            app.log(context)
            app.log('====')
            comment_html = root.querySelector(comment_id_str).toString()
            owner_str = 'This user is the owner of the'
            member_str = 'This user is a member of the'
            contributor_str = 'This user has previously committed to the'
            
            // TODO: Has this person posted in this comments before? if so we should only have the bot reply once
            if (!comment_html.includes(owner_str) && !comment_html.includes(member_str) && !comment_html.includes(contributor_str)){
              app.log('----')
              app.log(root.querySelector(comment_id_str).toString())
              app.log('----')
              app.log('----')
              app.log(comment_html)
              app.log('----')
              // Here we finally know if the person posting the comment is a member.... even private ones muahahahaha ;-)
              // TODO: abstract this message to a config file somewhere
              const issueComment = context.issue({
                body: 'Hey @' + sender + 
                ', thanks for expressing your interest. We would love your help with this issue.' + 
                ' Please follow these <a href="' + config.howToJoinLink + '">next steps</a>' +
                ' to join our contributor community.'
              })
              return context.github.issues.createComment(issueComment)
            } else {
              app.log('====')
              app.log(sender)
              app.log('====')
              app.log('Private member comment or possible someone who doesnt exist lol')
              context.github.orgs.checkMembership({org: 'ifmeorg', username: sender}).then(
                result => {
                  if (result.status == 204){
                    app.log("Winner Winner, member of repo")

                  } else if (result.status == 404){
                    app.log("Not a member of the repo")

                  }
                }
              )
              
              app.log('====')
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