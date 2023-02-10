# IPFS SERVICE

The project make use of a self IPFS service necessary for the creation of  IPFS resources.

The `Dockerfile` is used for building a Docker image containing a customized IPFS Kubo installation. The created image will provide a Kubo ipfs service that allows CORS to affected IP addresses and the designed HTTP methods.
Check the `ipfs-config.sh` file to know which  ip  addresses and HTTP methods are affected.



