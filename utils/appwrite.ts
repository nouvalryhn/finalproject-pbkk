import { Client, Account, Databases, Storage } from 'appwrite';

const client = new Client();

client
    .setEndpoint('https://appwrite.nouval.dev/v1')
    .setProject('6746e0fe003dbd6e27e0');

export const account = new Account(client);
export const databases = new Databases(client); 
export const storage = new Storage(client);
