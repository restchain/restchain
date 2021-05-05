# RESTCHAIN
Experimental repository to test Restchain a prototype application.

## What is it

.....??
## Installation
**Requirements**:

* [Docker](https://www.docker.com/) 
* [Metamask](https://metamask.io)

To run the application you need to clone locally the project and then run the following commands:

```
cd restchain
docker-compose up -d 
```

Checking out logs:

```
docker-compose log -f
```

# Enviroment setting
For development and testing purposes we are using [ganache](https://github.com/trufflesuite/ganache-cli) as a local blockchain.  
Ganache is configured with the option `-d` to generate deterministic addresses based on a seed prhase (called pre-defined mnemonic):

```
# pre-defined mnemonic or seed phrase
include poem goose genuine baby flat mom token drama harsh sadness fit
```
To make the application work correctly the seed prhase must be imported into *Metamask* by the *'Import using the seed phrase'* feature to retrieve the proper accounts from the blockchain. (insert photo?)

Once the accounts have been imported and the user address (account) selected, it must be verified that metamask is correctly connected to the application.  
(ineset photo)

# Trobouleshooting
### java.nio.file.FileSystemException: upload-dir/[FILENAME_SCHEMA].bpmn: Operation not permitted
Usally occured when the permission in `upload-dir` are not proper configured.
For linux usere see https://docs.docker.com/engine/install/linux-postinstall/
