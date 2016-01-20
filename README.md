# Vue.js-socket.io-chatroom-example
This example application consists of a public chat room made with Vue.js, socket.io and Semantic UI. The backend websockets chat server is found inside the **chatServer.js** file. All Vue.js and front-end files are found inside **./vue**.

The project does by no means display "best practices" or try to showcase the most effective way of dealing with socket.io and Vue.js. It's merely an example to give people an idea of how Vue.js and socket.io can be used for interactive real time applications. I have no plans of putting this code into production, whereas I haven't put much effort into good commenting, testing and refactoring. 

##Demo
[http://chatdemo.zot.link/](http://chatdemo.zot.link/)

Log in to the chat from multiple browser tabs to test the chatting functionality with yourself if nobody else is online. 

##Features
* Customizable display name + gender
* Multiple chat sessions
* Unread message notification
* User is logged out notification

##Limitations
* It's only possible to chat with one other person in the same chat room
* No smilies or multimedia features
* No persistent chat logs
* No persistent user accounts
* Not optimized for devices with very small screens

##Known bugs
* If you add too many chat sessions the "session menu" bar will get too large and it will not be displayed correctly

##Contact
If you have any questions please use the contact details found at http://jimmyutterstrom.com/about/
