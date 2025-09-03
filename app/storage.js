const { DefaultAzureCredential } = require('@azure/identity')
const { BlobServiceClient } = require('@azure/storage-blob')
const createHash = require('./utils/create-hash')
const config = require('./config').storageConfig
const { NOT_FOUND } = require('./constants/http-status-codes')

let blobServiceClient
let containersInitialised

if (config.useConnectionStr) {
  console.log('Using connection string for BlobServiceClient')
  blobServiceClient = BlobServiceClient.fromConnectionString(config.connectionStr)
} else {
  console.log('Using DefaultAzureCredential for BlobServiceClient')
  const uri = `https://${config.storageAccount}.blob.core.windows.net`
  blobServiceClient = new BlobServiceClient(
    uri,
    new DefaultAzureCredential({ managedIdentityClientId: config.managedIdentityClientId })
  )
}

const container = blobServiceClient.getContainerClient(config.container)

const initialiseContainers = async () => {
  if (config.createContainers) {
    await container.createIfNotExists()
  }
  await initialiseFolders()
  containersInitialised = true
}

const initialiseFolders = async () => {
  const placeHolderText = 'Placeholder'
  const folders = [
    config.inboundFolder,
    config.archiveFolder,
    config.quarantineFolder,
    config.returnFolder,
    config.stagingFolder
  ].filter(Boolean)

  for (const folder of folders) {
    const client = container.getBlockBlobClient(`${folder}/default.txt`)
    await client.upload(placeHolderText, placeHolderText.length)
  }
}

const getBlob = async (folder, filename) => {
  containersInitialised ?? await initialiseContainers()
  return container.getBlockBlobClient(`${folder}/${filename}`)
}

const getInboundFileList = async () => {
  containersInitialised ?? await initialiseContainers()
  const fileList = []
  for await (const file of container.listBlobsFlat({ prefix: config.inboundFolder })) {
    fileList.push(file.name.replace(`${config.inboundFolder}/`, ''))
  }
  return fileList
}

const downloadFile = async (filename) => {
  const blob = await getBlob(config.inboundFolder, filename)
  const downloaded = await blob.downloadToBuffer()
  return downloaded.toString()
}

const downloadBuffer = async (folder, filename) => {
  const blob = await getBlob(folder, filename)

  await blob.getProperties().catch(err => {
    if (err.statusCode === NOT_FOUND) {
      throw new Error(`File '${filename}' does not exist in folder '${folder}'`)
    }
    throw err
  })

  return blob.downloadToBuffer()
}

const moveFile = async (sourceFolder, destinationFolder, filename) => {
  const sourceBlob = await getBlob(sourceFolder, filename)
  const destinationBlob = await getBlob(destinationFolder, filename)
  const copyPoller = await destinationBlob.beginCopyFromURL(sourceBlob.url)
  const copyResult = await copyPoller.pollUntilDone()

  if (copyResult.copyStatus === 'success') {
    await sourceBlob.delete()
  } else {
    throw new Error(`Copy failed with status: ${copyResult.copyStatus}`)
  }
}

const acceptFile = async (filename) => {
  return moveFile(config.stagingFolder, config.inboundFolder, filename)
}

const archiveFile = (filename) => {
  return moveFile(config.inboundFolder, config.archiveFolder, filename)
}

const quarantineFile = (filename, source = 'inbound') => {
  let sourceFolder

  switch (source) {
    case 'staging':
      sourceFolder = config.stagingFolder
      break
    case 'inbound':
      sourceFolder = config.inboundFolder
      break
    default:
      throw new Error(`Invalid source folder "${source}" for quarantineFile`)
  }

  return moveFile(sourceFolder, config.quarantineFolder, filename)
}

const deleteFile = async (filename) => {
  const sourceBlob = await getBlob(config.inboundFolder, filename)
  await sourceBlob.delete()
}

const getReturnBlobClient = async (filename) => {
  return getBlob(config.returnFolder, filename)
}

const getFileChecksum = async (filename) => {
  const buffer = await downloadBuffer(config.stagingFolder, filename)

  const checkSum = createHash(buffer)

  return checkSum
}

module.exports = {
  getInboundFileList,
  getFileChecksum,
  downloadFile,
  acceptFile,
  archiveFile,
  quarantineFile,
  deleteFile,
  getReturnBlobClient,
  blobServiceClient
}
