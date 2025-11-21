const config = require('../../app/config')

jest.mock('../../app/processing')
jest.mock('../../app/server')

const { start: mockStartProcessing } = require('../../app/processing')
const { start: mockStartServer } = require('../../app/server')
const startApp = require('../../app')

describe('startApp', () => {
  beforeEach(() => jest.clearAllMocks())

  test.each([
    [true, 1, 1, false],
    [false, 0, 1, true]
  ])(
    'processingActive=%p => startProcessing called %i times, startServer called %i times, console.info called=%p',
    async (processingActive, processingCalls, serverCalls, logInfo) => {
      config.processingActive = processingActive
      const consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => {})

      await startApp()

      expect(mockStartProcessing).toHaveBeenCalledTimes(processingCalls)
      expect(mockStartServer).toHaveBeenCalledTimes(serverCalls)

      if (logInfo) {
        expect(consoleInfoSpy).toHaveBeenCalledWith(
          expect.stringContaining(
            'Processing capabilities are currently not enabled in this environment'
          )
        )
      } else {
        expect(consoleInfoSpy).not.toHaveBeenCalled()
      }

      consoleInfoSpy.mockRestore()
    }
  )
})
