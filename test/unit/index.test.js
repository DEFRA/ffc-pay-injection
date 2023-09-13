jest.mock('../../app/processing')
const { start } = require('../../app/processing')

describe('app', () => {
  beforeEach(() => {
    require('../../app')
  })

  test('starts processing', async () => {
    expect(start).toHaveBeenCalled()
  })
})
