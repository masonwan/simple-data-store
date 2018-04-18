const { expect } = require('chai')
const Database = require('../src/database')

describe('database', () => {

  let database

  beforeEach(() => {
    database = new Database()
  })

  it('should set value', () => {
    database.set('a', 1)

    expect(database.get('a')).to.eq(1)
  })

  it('should override value', () => {
    database.set('a', 1)
    database.set('a', 2)

    expect(database.get('a')).to.eq(2)
  })

  it('should delete key', () => {
    database.set('a', 1)
    database.delete('a')

    expect(database.get('a')).to.be.undefined
  })

  it('should delete non-existing key', () => {
    database.delete('non-existing')
  })

  it('should count values', () => {
    database.set('a', 1)
    database.set('b', 2)
    database.set('c', 2)

    expect(database.count(1)).to.eq(1)
    expect(database.count(2)).to.eq(2)
  })

  it('should count values after overriding', () => {
    database.set('a', 1)
    database.set('a', 2)

    expect(database.count(1)).to.eq(0)
    expect(database.count(2)).to.eq(1)
  })

  it('should rollback changes', () => {
    database.set('a', 1)
    database.begin()
    {
      database.set('a', 2)
    }
    database.rollback()

    expect(database.get('a')).to.eq(1)
    expect(database.count(1)).to.eq(1)
    expect(database.count(2)).to.eq(0)
  })

  it('should rollback nested changes', () => {
    database.set('a', 1)
    database.begin()
    {
      database.set('a', 2)

      database.begin()
      {
        database.set('a', 3)
        database.rollback()
      }
    }
    database.rollback()

    expect(database.get('a')).to.eq(1)
    expect(database.count(1)).to.eq(1)
    expect(database.count(2)).to.eq(0)
    expect(database.count(2)).to.eq(0)
  })

  it('should rollback once', () => {
    database.set('a', 1)
    database.begin()
    {
      database.set('a', 2)

      database.begin()
      {
        database.set('a', 3)
        database.rollback()
      }
    }

    expect(database.get('a')).to.eq(2)
    expect(database.count(1)).to.eq(0)
    expect(database.count(2)).to.eq(1)
  })

  it('should commit', () => {
    database.set('a', 1)
    database.begin()
    {
      database.set('a', 2)
    }
    database.commit()
    database.rollback()

    expect(database.get('a')).to.eq(2)
    expect(database.count(1)).to.eq(0)
    expect(database.count(2)).to.eq(1)
  })

  it('should commit and rollback', () => {
    database.set('a', 1)
    database.begin()
    {
      database.set('a', 2)

      database.begin()
      {
        database.set('a', 3)
      }
      database.commit()
    }
    database.rollback()

    expect(database.get('a')).to.eq(2)
    expect(database.count(1)).to.eq(0)
    expect(database.count(2)).to.eq(1)
  })
})
