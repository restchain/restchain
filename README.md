# RESTCHAIN
Experimental repository to test our prototype application.

## What is it

.....??
## How to install
**Requirements**:

* [Docker](https://www.docker.com/) 
* [Metamask](https://metamask.io)

To run the application you need to clone locally the project and then run the following commands:

```
cd restchain
docker-compose up -d 
```

To check out the logs:

```
docker-compose log -f
```

# Enviroment setting
For development and testing purposes we are using [ganache](https://github.com/trufflesuite/ganache-cli) as a local blockchain.  
Ganache is configured with the option `-d` to generate deterministic addresses based on a pre-defined mnemonic:

```
# pre-defined mnemonic or seed phrase
include poem goose genuine baby flat mom token drama harsh sadness fit
```
To make the application work correctly these terms must be imported into *Metamask* by the *'Import using the seed phrase'* feature to retrieve the proper accounts from the blockchain.

Once the accounts have been imported and the user address (account) selected, it must be verified that metamask is correctly connected to the application.  
(photos??)

# Trobouleshooting
//TODO - directory permision exception  
https://docs.docker.com/engine/install/linux-postinstall/
