<template lang="jade">
      #app
      
      //Top navigation
      .ui.fixed.menu
        .ui.container
          span.header
            i.huge.comments.icon
            |  Vue.js + Socket.io Chat example
          .right.menu
            a.item(href='https://github.com/jimutt/Vue.js-socket.io-chatroom-example')
              i.large.github.square.icon
              | Github
      
      // Main Content
      .ui.main.container
        chat
</template>

<script lang="babel">
import Chat from './components/Chat.vue'

export default {
  methods: {

  },
  components: {
      Chat
  }
}
</script>

<style>
body {
  font-family: Helvetica, sans-serif;
}
</style>
