const readline = require('readline')
const Database = require('./src/database')

console.log(`Available commands: SET, GET, DELETE, COUNT, BEGIN, ROLLBACK, COMMIT, END`)

let rl = readline.createInterface({
  input: process.stdin,
})

let database = new Database()
let commandMap = {
  set: function(command, key, value) {
    database.set(key, value)
  },
  get: function(command, key) {
    let value = database.get(key)
    if (typeof value === 'undefined') {
      return console.log(`NULL`)
    }
    console.log(`${value}`)
  },
  delete: function(command, key) {
    database.delete(key)
  },
  count: function(command, key) {
    console.log(database.count(key))
  },
  begin: function() {
    database.begin()
  },
  rollback: function() {
    database.rollback()
  },
  commit: function() {
    database.commit()
  },
  end: function() {
    rl.close()
    // process.exit(0)
  },
  dump: function() {
    database.dump()
  },
}

rl
  .on('line', (line) => {
    let inputs = line.split(' ')
    let [command] = inputs
    let func = commandMap[command.toLowerCase()]
    if (!func) {
      return console.warn(`Command "${command}" not found`)
    }
    commandMap[command.toLowerCase()](...inputs)
  })
  .on('close', () => {
    console.log(`Good bye`)
  })
  .on('error', (err) => {
    console.error(err)
    process.exit(1)
  })