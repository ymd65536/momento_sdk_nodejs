// Declare the Momento SDK library
const { CacheGet, CacheSet, Configurations, ListCaches, CreateCache,
    CacheClient, CredentialProvider } = require('@gomomento/sdk');
  
  // Declate the dotenv library
  const dotenv = require('dotenv');
  
  // Defines name of cache to use.
  const CACHE_NAME = 'default-cache';
  
  // Run the config function to bring in the .env file
  dotenv.config();
  
  // Creates the Momento cache client object
  async function createCacheClient() {
    return new CacheClient({
      configuration: Configurations.Laptop.v1(),
      credentialProvider: CredentialProvider.fromEnvironmentVariable({
        environmentVariableName: 'MOMENTO_AUTH_TOKEN',
      }),
      defaultTtlSeconds: 600,
    });
  }
  
  // Create a new cache
  async function createCache(client) {
    const createCacheResponse = await client.createCache(CACHE_NAME);
    if (createCacheResponse instanceof CreateCache.Success) {
      console.log('Cache created.');
    } else if (createCacheResponse instanceof CreateCache.AlreadyExists) {
      console.log('Cache already exists');
    } else if (createCacheResponse instanceof CreateCache.Error) {
      throw createCacheResponse.innerException();
    }
  }
  
  // List all caches in Momento for this account.
  async function listCaches(client) {
    const listResponse = await client.listCaches(client);
    if (listResponse instanceof ListCaches.Error) {
      console.log('Error listing caches: ', listResponse.message());
    } else if (listResponse instanceof ListCaches.Success) {
      console.log('Found caches:');
      listResponse.getCaches().forEach(cacheInfo => {
        console.log(' -',cacheInfo.getName());
      });
    } else {
      throw new Error('Unrecognized response: ', listResponse.toString());
    }
  }
  
  // A function to write to the cache
  async function writeToCache(client, cacheName, key, data) {
    const setResponse = await client.set(cacheName, key, data);
    if (setResponse instanceof CacheSet.Success) {
      console.log('Key stored successfully!');
    } else if (setResponse instanceof CacheSet.Error) {
      console.log('Error setting key: ', setResponse.toString());
    } else {
      console.log('Some other error: ', setResponse.toString());
    }
  }
  
  // A function to read scalar items from the cache
  async function readFromCache(client, cacheName, key) {
    const readResponse = await client.get(cacheName, key);
    if (readResponse instanceof CacheGet.Hit) {
      console.log('Cache hit: ', readResponse.valueString());
    } else if (readResponse instanceof CacheGet.Miss) {
      console.log('Cache miss');
    } else if (readResponse instanceof CacheGet.Error) {
      console.log('Error: ', readResponse.message());
    }
  }
  
  // A simple function that calls all functions in order. You probably want more error handling.
  async function run() {
    const cacheClient = await createCacheClient();
  
    await createCache(cacheClient);
  
    await listCaches(cacheClient);
  
    await writeToCache(cacheClient, CACHE_NAME, "code", "12345");
    await readFromCache(cacheClient, CACHE_NAME, "code");
  }
  
  run();