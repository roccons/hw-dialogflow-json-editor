# HW Dialogflow JSON editor

Editor to modify the _speeches_, _suggestions_ and _redirect_to_blocks_
(used for [Janis](https://www.janis.ai) + [Chatfuel](https://chatfuel.com) integrations)
of the Dialogflow intents json files exported

This is a frontend app + bakend api

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Run backend api for development 
```
node server.js
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```
---
### Run both servers
If you don't need to run backend and frontend servers independently (development mode),
you can run both.

You have to install `serve` first
```
npm install -g serve
```
Then run

```
npm start
```

And go to http://localhost:5000

_Note_: this will not compile any file