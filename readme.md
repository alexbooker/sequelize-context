# Sequelize Context


## Usage

```javascript
context.connect('./models/*.js', 'washing_machine_schema', 'root', '', {
  force: true
}).then(function onConnected () {
  console.log('connected')
}).catch(err => {
  console.error(`An error occured: ${err}`)
})
```

**Note:** I highly recommend that you attach an error-handling function using `catch`. This is because Sequelize Context detects common errors and throws meaningful and helpful errors to make our lives easier 🌞.
