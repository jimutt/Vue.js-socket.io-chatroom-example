'use strict';

class ChatServer {

  constructor(io, maxUsers) {

    this.io = io
    this.onlineUsers = new Map()

    this.maxUsers_ = typeof maxUsers !== 'undefined' ? maxUsers : 50
    this.displayNameMaxLen_ = 25
    this.displayNameMinLen_ = 3
  }

  start() {
    console.log('Starting socket.io chat server')

    this.io.on('connection', (socket) => {

      // Check that the chat room isn't already full.
      if (this.onlineUsers.size >= this.maxUsers_) {
        socket.emit('authError', ['The max online user count of ' + this.maxUsers_ + ' has been reached.'])
        return socket.disconnect(socket)
      }

      console.log('User connected')

      socket.on('login', (msg) => {
        this.loginUser_(socket, msg)
      })
      socket.on('disconnect', () => {
        this.broadCastUserDisconnect_(socket)
      })

      socket.on('error', (err) => {
        console.log('An error occurred!')
        console.log(err)
      })
    })
  }

  loginUser_(socket, data) {

    // Validate login information
    var loginValidation = this.validateLoginData_(data)
    if (loginValidation.err) {
      return socket.emit('authError', loginValidation.err)
    }

    console.log('Valid username!')
    socket.data = {
      displayName: data.displayName,
      gender: data.gender
    };
    this.onlineUsers.set(socket.id, socket)

    socket.emit('authSuccess', socket.id)

    // Inform the new user of all existing users
    this.sendUserList_(socket)

    // Let everyone else now about the new user
    this.broadcastNewUser_(socket)

    // Allow the new user to chat with other users
    socket.on('sendMessage', (msg) => {
      this.sendChatMessage_(socket, msg)
    })
  }

  // Remove logged in user after socket disconnect
  disconnectUser_(socket) {

    console.log('User logged out:' + socket.id);

    // Remove user from onlineUsers list if it's there
    this.onlineUsers.delete(socket.id)
  }

  // Takes care of sending a chat message between two logged in users
  sendChatMessage_(socket, msg) {

    var recipient = this.onlineUsers.get(msg.recipient)
    if(recipient) {
      msg.senderId = socket.id
      msg.senderDisplayName = socket.data.displayName
      recipient.emit('chatMessage', msg)
    }
  }

  // Sends a list of all online users to the selected socket
  sendUserList_ (socket) {
    var userList = []

    for(var user of this.onlineUsers.entries()) {
      user = user[1]
      if(user.id != socket.id) {
        userList.push({
          displayName: user.data.displayName,
          gender: user.data.gender,
          socketId: user.id
        })
      }
    }

    socket.emit('userListUpdate', userList)
  }
  
  // Notifies all users when a new user joins the chat
  broadcastNewUser_ (socket) {

    var user = {
      displayName: socket.data.displayName,
      gender: socket.data.gender,
      socketId: socket.id     
    }

    this.io.emit('addUser', user)
  }

  // Notifies all users when a user leaves the chat  
  broadCastUserDisconnect_ (socket) {

    this.io.emit('removeUser', socket.id)
    this.disconnectUser_(socket)
  }

  // Check if the chosen display name is free to use
  displayNameFree_(name) {
    console.log('Checking if display name ' + name + ' is occupied')

    for (var item of this.onlineUsers) {
      if (item.value == name) return false
    }
    return true
  }

  // Perform some very basic validation of
  // username and gender fields
  validateLoginData_(data) {

    var err = [];

    console.log('User tried to log in with displayName ' + data.displayName + ' and gender ' + data.gender)

    if (!data.gender || (data.gender != 'Male' && data.gender != 'Female' && data.gender != 'Other')) {
      err.push('Please select a valid gender.')
    }
    if (!data.displayName || data.displayName.length > this.displayNameMaxLen_ || data.displayName.length < this.displayNameMinLen_) {
      err.push('Your display name needs to be between ' + this.displayNameMinLen_ + ' and ' + this.displayNameMaxLen_ + ' characters long.')
    }

    // TODO: Check if username is free to use  

    if (err.length > 0) {
      return {
        err: err
      }
    }
    else {
      return {}
    }
  }
}

module.exports = ChatServer;