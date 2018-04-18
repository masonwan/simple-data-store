const debug = require('debug')('box:database')

module.exports = class Database {
  constructor() {
    this.valueCountMap = {}
    this.map = {}

    /**
     * A stack of records used for nested transactions
     * @type {Array}
     */
    this.recordsList = []
    /**
     * A list of staged commands
     * @type {null}
     */
    this.records = null
  }

  dump() {
    debug(`this.map:`, this.map)
    debug(`this.valueCountMap:`, this.valueCountMap)
    debug(`this.recordsList:`, JSON.stringify(this.recordsList, null, 2))
    debug(`this.records:`, JSON.stringify(this.records, null, 2))
  }

  set(key, value) {
    debug(`Setting ${value} to ${key}`)

    let oldValue = this.map[key]
    this.map[key] = value

    if (oldValue) {
      this.valueCountMap[oldValue]--
    }

    let count = this.valueCountMap[value]
    if (count) {
      this.valueCountMap[value]++
    } else {
      this.valueCountMap[value] = 1
    }

    if (this.records) {
      if (typeof oldValue === 'undefined') {
        this.records.unshift({
          command: 'delete',
          args: [key],
        })
      } else {
        this.records.unshift({
          command: 'set',
          args: [key, oldValue],
        })
      }
    }

    this.dump()
  }

  get(key) {
    debug(`Getting ${key}`)

    return this.map[key]
  }

  delete(key) {
    debug(`Deleting ${key}`)

    let value = this.map[key]
    if (typeof value === 'undefined') {
      return
    }

    delete this.map[key]
    this.valueCountMap[value]--

    if (this.records) {
      this.records.unshift({
        command: 'set',
        args: [key, value],
      })
    }

    this.dump()
  }

  count(value) {
    debug(`Counting keys with value "${value}"`)

    let count = this.valueCountMap[value]
    if (count) {
      return count
    }

    return 0
  }

  begin() {
    if (this.records) {
      this.recordsList.push(this.records)
    }
    this.records = []

    this.dump()
  }

  rollback() {
    if (!this.records) {
      debug(`Ignored since it has no records`)
      return
    }

    let records = this.records
    delete this.records // Prevent from creating records while rolling back.

    records.forEach((record) => {
      this[record.command](...record.args)
    })

    this.records = this.recordsList.pop()
    debug(`records is reset to ${JSON.stringify(this.records, null, 2)}`)

    this.dump()
  }

  commit() {
    this.records = null
    this.records = this.recordsList.pop()

    this.dump()
  }
}