const { expect } = require('chai')
const Database = require('../src/database')

describe('database', () => {

  let database

  beforeEach(() => {
    database = new Database()
  })

  it('should get non-existing key', () => {
    expect(database.get('non-existing')).to.undefined
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

  it('should rollback a serial of delete and set', () => {
    database.set('a', 1)
    database.set('a', 2)
    database.begin()
    {
      database.set('a', 3)
      database.set('a', 4)
      database.delete('a')
      database.delete('a')
      database.set('a', 5)
    }
    database.rollback()

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

  it('should commit nothing', () => {
    let isOkay = database.commit()

    expect(isOkay).to.be.false
  })

  it('should ignore rollback if commit first', () => {
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
    let isOkay = database.rollback()

    expect(isOkay).to.be.false
    expect(database.get('a')).to.eq(3)
    expect(database.count(1)).to.eq(0)
    expect(database.count(2)).to.eq(0)
    expect(database.count(3)).to.eq(1)
  })
})
