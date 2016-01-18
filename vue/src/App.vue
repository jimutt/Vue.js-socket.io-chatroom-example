<template lang="jade">
      #app
      
      //Top navigation
      .ui.fixed.menu
        .ui.container
          span.header
            i.huge.comments.icon
            |  Vue.js + Socket.io Chat example
          a.item(href='#')
            i.home.icon
            | Home
          a.item(href='#') About
          .right.menu
            a.item(href='#')
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
