const readline = require('readline')
const Database = require('./src/database')

console.log(`SET, GET, DELETE, COUNT, BEGIN, ROLLBACK, COMMIT, END`)

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
  delete: function(command, key, value) {
    database.delete(key)
  },
  count: function(command, key, value) {
    console.log(database.count(key))
  },
  begin: function(command, key, value) {
    database.begin()
  },
  rollback: function(command, key, value) {
    database.rollback()
  },
  commit: function(command, key, value) {
    database.commit()
  },
  end: function(command, key, value) {
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