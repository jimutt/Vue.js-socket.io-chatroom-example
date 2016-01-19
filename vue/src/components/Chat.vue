<template lang="jade">

    // Modal with login form
    .ui.modal(id="auth-modal")
      .header
        | Select display name
      .content
        form.ui.form(id="login-form", v-el:login-form)
          .field
            label Chat display name
            input(name="displayname" type="text" v-model="user.displayName")
          .field
            label Gender
            select(name="gender" v-model="user.gender")
              option Male
              option Female
              option Other
        .ui.error.message(v-if="authErrors.length > 0")
          ul
            li(v-for="error in authErrors")
              | {{error}}
      .actions
        .ui.button.primary(@click="submitLoginForm()") Join chat!
  
    // Chat container
    .ui.fluid.card
    
      // Header
      .content
        .header Chat
          span.float-right(v-if="user.authenticated") Logged on as:
            i {{user.displayName}}
        
      // Content
      .content
        .ui.divided.grid
          .row
            
            // Sidebar heading
            .four.wide.column
              h2#chat-sidebar-header Online users
              
            // Active chat sessions menu
            .twelve.wide.column
              div(class="ui {{sessionMenuClass}} item menu")
                a.item(v-for="s in chatSessions", v-bind:class="{ 'active': activeChatSession.socketId == s.socketId }", @click="setActiveChatSession(s.socketId)") {{s.displayName}}
                  .offline(v-if="!s.online")
                  i.comment.icon.unread-notification(v-if="s.unread")
                  i.remove.icon.close-session(@click="closeChatSession(s.socketId, $event)")
                a.item.active(v-if="chatSessions.length < 1") No active chat session
              
            // User list sidebar
            .four.wide.column.chat-sidebar
              .span(v-if="onlineUsers.length < 1") No online users
              .ui.left.aligned.green.segment(id="chatUser" v-for="user in onlineUsers" @click="startChat(user)")
                | {{user.displayName}}
                i.right.floated(class="{{user.genderClass}} icon")
                
            // Main chat window
            .twelve.wide.column
              
              .row.message-window(v-el:chat-msg-window)
                .div.message-window-content(v-el:chat-msg-window-content)
                
                  .chat-message(v-for="message in activeChatSession.messages")
                    .ui.raised.segment(v-bind:class="{'contact': message.senderId != user.socketId, 'you': message.senderId == user.socketId}")
                      span {{message.content}}
                
              .row.chat-textarea(v-if="activeChatSession.socketId")
                .ui.form
                  .field
                    textarea(id="message-input", rows="4", placeholder="Write something...", @keydown.enter="sendMessage($event)", v-model="messageContent")

</template>

<script>
/* eslint-disable eqeqeq */

export default {

  data () {
    return {

      io: {},

      user: {
        authenticated: false,
        socketId: null,
        // sessionPassword: null,
        name: '',
        gender: 'Male'
      },

      chatSessions: [],

      activeChatSession: {
        socketId: null,
        messages: []
      },

      onlineUsers: [],
      messageContent: '',

      authModalEl: null,
      authErrors: []

    }
  },

  compiled () {

    this.io = io()
    this.initChat()
    console.log('Chat compiled')
  },

  ready () {
    $('#auth-modal').modal()
    this.authModalEl = $('#auth-modal')
    this.authModalEl.modal('show')
  },

  methods: {

    initChat () {

      this.io.on('authError', (errors) => {

        for (let error of errors) {
          this.authErrors.push(error)
        }
      })

      this.io.on('authSuccess', (socketId) => {

        console.log('Logged in successfully')
        this.user.authenticated = true
        this.user.socketId = socketId
        this.authModalEl.modal('hide')
      })

      this.io.on('userListUpdate', (userList) => {

        this.onlineUsers = userList
        for (var user of this.onlineUsers) {
          user.genderClass = this.getGenderClass(user.gender)
        }
      })

      this.io.on('addUser', (user) => {

        user.genderClass = this.getGenderClass(user.gender)
        if (this.user.socketId != user.socketId) this.onlineUsers.push(user)
      })

      this.io.on('removeUser', (socketId) => {

        var userIndex = this.onlineUsers.findIndex(u => u.socketId == socketId)
        if (userIndex != -1) this.onlineUsers.splice(userIndex, 1)

        var activeSession = this.chatSessions.find(cs => cs.socketId == socketId)
        if (activeSession) activeSession.online = false
      })

      this.io.on('chatMessage', (msg) => {

        console.log('Received new chat message: ')
        console.log(JSON.stringify(msg))

        // Check if we have an active chat session with the sender
        var activeSession = this.chatSessions.find(cs => cs.socketId == msg.senderId)
        if (!activeSession) {
          this.addChatSession(msg.senderId, msg.senderDisplayName)
          activeSession = this.chatSessions[this.chatSessions.length - 1]
          if (!this.activeChatSession.socketId) {
            this.activeChatSession = activeSession
          }
        }

        if (this.activeChatSession.socketId != msg.senderId) {
          activeSession.unread = true
          activeSession.messages.push(msg)
        } else {
          this.addMsgToActiveChat(msg)
        }

      })
    },

    submitLoginForm () {

      console.log('Trying to log in user')
      this.authErrors = []
      this.io.emit('login', { displayName: this.user.displayName, gender: this.user.gender })
    },

    // Open chat session with user
    startChat (user) {

      var session = this.chatSessions.find(cs => cs.socketId == user.socketId)
      if (!session) {

        console.log('Starting new chat session with ' + user.displayName)
        this.addChatSession(user.socketId, user.displayName)
        session = this.chatSessions[this.chatSessions.length - 1]
      }

      this.activeChatSession = session
    },

    /** Send chat message from the textarea to the recipient **/
    sendMessage (e, socketId) {

      e.preventDefault()

      var msg = {
        content: this.messageContent,
        recipient: this.activeChatSession.socketId,
        senderId: this.user.socketId
      }

      this.addMsgToActiveChat(msg)
      this.messageContent = ''

      this.io.emit('sendMessage', msg)
    },

    addChatSession (socketId, displayName) {

      this.chatSessions.push({
        socketId: socketId,
        displayName: displayName,
        online: true,
        unread: false,
        messages: []
      })
    },

    setActiveChatSession (socketId) {
      console.log('Setting active session to ' + socketId)
      console.log(this.chatSessions[socketId])
      this.activeChatSession = this.chatSessions.find(cs => cs.socketId == socketId)
      this.activeChatSession.socketId = socketId
      this.activeChatSession.unread = false
      this.autoScroll()
    },

    closeChatSession (socketId, e) {

      e.stopPropagation()

      var sessionIndex = this.chatSessions.findIndex(cs => cs.socketId == socketId)
      if (this.activeChatSession.socketId == socketId) {
        this.activeChatSession = {
          socketId: null,
          messages: []
        }
      }
      if (sessionIndex != -1) this.chatSessions.splice(sessionIndex, 1)
      this.activeChatSession.socketId = null
    },

    addMsgToActiveChat (msg) {

      this.activeChatSession.messages.push(msg)
      this.autoScroll()
    },

    autoScroll () {

      // Not that pretty fix to allow the DOM to update before we autoscroll
      setTimeout(() => {
        this.$els.chatMsgWindow.scrollTop = this.$els.chatMsgWindowContent.scrollHeight
      }, 100)
    },

    getGenderClass (gender) {

      switch (gender) {
        case 'Male':
          return 'man'
        case 'Female':
          return 'woman'
        case 'Other':
          return 'other gender'
      }
    }
  },

  computed: {

    sessionMenuClass: function () {

      switch (this.chatSessions.length) {
        case 0:
        case 1:
          return 'one'
        case 2:
          return 'two'
        case 3:
          return 'three'
        case 4:
          return 'four'
        case 5:
          return 'five'
        case 6:
          return 'six'
      }
    }
  }
}
</script>

<style>
body {
  font-family: Helvetica, sans-serif;
}
</style>


<style>
  .chat-sidebar {
      -webkit-box-shadow: initial !important;
      box-shadow: initial !important;
  }
  
  #chat-sidebar-header {
      padding-bottom: 10px;
  }
  
  .message-window {
      height: 450px;
      overflow-y: scroll;
      overflow-x: auto;
  }
  
  .message-window-content {
    overflow: hidden;
  }

  .chat-message {
      width: 100%;
      margin: 5px 0;
      float: left;
  }
  
  .chat-message > .ui.raised.segment {
    max-width: 90%;
    overflow-wrap: break-word;
  }
  
  .ui.raised.segment.contact, .ui.raised.segment.you {
      width: auto;
  }
  
  .ui.raised.segment.you {
      background-color: #CCDDE3;
      float: right;
      margin-right: 10px;
  }
  
  .ui.raised.segment.contact {
      float: left;
  }
  #chatUser:hover {
    cursor: pointer;
  }
  
  .offline {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background-color: #ff0000;
    margin-left: 5px;
  }
  
  .unread-notification {
    margin-left: 5px;
  }
  
  .close-session {
    top: 2px;
    right: 0;
    position: absolute;
  }
  
  .float-right {
    float: right;
  }

</style>