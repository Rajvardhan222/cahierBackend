import { createClient } from 'redis';



export const client = createClient();
let connectRedis = async ()=> {
client.on('error', err => console.log('Redis Client Error', err));

await client.connect();
}

export default connectRedis;