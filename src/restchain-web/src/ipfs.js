// import ipfsApi from 'ipfs-http-client'

import ipfsApiMini from 'ipfs-mini';

export const ipfsMini = new ipfsApiMini({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

// connection to local IPFS daemon
// export const IPFS  = ipfsApi('/ip4/127.0.0.1/tcp/5001');