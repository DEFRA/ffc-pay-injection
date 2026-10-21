const chainableMethods = [
  'select',
  'where',
  'whereIn',
  'whereBetween',
  'whereNot',
  'whereNull',
  'whereNotNull',
  'whereRaw',
  'orWhere',
  'andWhere',
  'orWhereNull',
  'orWhereRaw',
  'insert',
  'update',
  'del',
  'returning',
  'limit',
  'orderBy',
  'first',
  'forUpdate',
  'skipLocked',
  'transacting',
  'onConflict',
  'ignore',
  'merge',
  'count',
  'increment'
]

const createQueryBuilder = () => {
  const builder = {}
  let pending = Promise.resolve(undefined)

  for (const method of chainableMethods) {
    builder[method] = jest.fn(() => builder)
  }

  for (const method of ['where', 'orWhere', 'andWhere']) {
    builder[method] = jest.fn((...args) => {
      if (typeof args[0] === 'function') args[0].call(builder)
      return builder
    })
  }

  builder.resolves = (value) => {
    pending = Promise.resolve(value)
    return builder
  }

  builder.rejects = (error) => {
    pending = Promise.reject(error)

    pending.catch(() => {})
    return builder
  }

  builder.then = (onFulfilled, onRejected) => pending.then(onFulfilled, onRejected)
  builder.catch = (onRejected) => pending.catch(onRejected)
  builder.finally = (onFinally) => pending.finally(onFinally)

  return builder
}

const createKnexMock = (tableNames = []) => {
  const builder = createQueryBuilder()
  const knex = jest.fn(() => builder)

  knex.raw = jest.fn()
  knex.destroy = jest.fn()

  const trx = jest.fn(() => builder)
  trx.commit = jest.fn()
  trx.rollback = jest.fn()
  const transaction = jest.fn(async (callback) => (callback ? callback(trx) : trx))

  const tables = Object.fromEntries(
    tableNames.map(name => [name, jest.fn(() => builder)])
  )

  return {
    knex,
    builder,
    trx,
    transaction,
    close: knex.destroy,
    tables
  }
}

module.exports = {
  createKnexMock,
  createQueryBuilder
}
