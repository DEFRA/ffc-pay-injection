const defaultErrorHandler = (err) => {
  console.error('Error processing message:', err)
}

const subscribeReceiver = (receiver, action, errorHandler, config) => {
  const wrappedAction = async (message) => {
    await action(message, receiver)
  }

  receiver.subscribe({
    processMessage: wrappedAction,
    processError: errorHandler ?? defaultErrorHandler
  }, {
    autoCompleteMessages: config?.autoCompleteMessages ?? false,
    maxConcurrentCalls: config?.maxConcurrentCalls ?? 1
  })
}

module.exports = { subscribeReceiver }
