# RESTCHAIN
Experimental repository to test Restchain prototype application.

## Description

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

To check out logs:

```
docker-compose log -f
```

The execution will provide:

* 3 folders 
	* `database`: containing the database data     
	* `solidity-dir`: containing the bpmn schema artifacts
	* `upload-dir`: containing the smart contract artifacts
* 4 services
	* a *frontend* exposed on port `80`
	* a *backend*  exposed on port `8080	`
	* a *database* exposed on port `3307`
	* a *blockchain* exposed on port `8545`

To start with the application just point your browser at the [http//localhost](http//localhost) address.	
	

## Enviroment setting
For development and testing purposes we are using [ganache](https://github.com/trufflesuite/ganache-cli) as a local blockchain.  
Ganache is configured with the option `-d` to generate deterministic addresses based on a seed prhase (called pre-defined mnemonic):

```
# pre-defined mnemonic or seed phrase
include poem goose genuine baby flat mom token drama harsh sadness fit
```
To make the application work correctly the seed prhase must be imported into *Metamask* by the *'Import using the seed phrase'* feature to retrieve the proper accounts from the blockchain. (to insert photo?)

Once the accounts have been imported and the user address (account) selected, it must be verified that metamask is correctly connected to the application.  
(to insert photo)

# Troubleshooting
### Operation not permitted

When occured this error 

```java.nio.file.FileSystemException: [upload-dir|solidity-dir]/[FILENAME_SCHEMA].bpmn: Operation not permitted```

it usually means that the directory permissions are not configured properly inside the project folder.  

For linux users see how to install correctly [Docker](https://docs.docker.com/engine/install/linux-postinstall/).

### Black dots on the bpmn-modeler during Choreography Interaction or tools panel missing during Choreography Design

Sometimes due to problems with the style sheets, still to be solved, it may occur that black circles appear above the model during the interaction phase or that the tools panel disappears in the Bpmn Designer modeller.

To solve this issue you need to reload the page and then go to the Choreography design page in order to reloads the style sheet correctly.
