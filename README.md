# RESTCHAIN
<img src="./images/rc-logo.png"  width="200" />

Experimental repository for testing Restchain prototype application.

## Description

Restchain is a general framework that allows to use a blockchain infrastructure to constraint and certify the relevant interactions that took place among the participants of a service choreography.  

The framework automatically derives a service mediator from a choreography specification in the form of a Smart Contract for a given blockchain infrastructure. The mediator will also expose REST APIs for each participant included inthe choreography specs. This will permit the developer of software services to use a blockchain infrastructure to interact with the other choreography participants, and without the need to know any specific detail of such a technology. In its turn the mediator will check and store within the blockchain infrastructure the order and the payload of the messages exchanged by the choreography participants, making this information available for future auditing. 

The framework has been implemented and validated using the [Ethereum](https://ethereum.org/) blockchain infrastructure.

An [example](./example/Example.md) is also provided for testing the framework, here a short video [demo](https://www.youtube.com/watch?v=RrgNvYS5tAk).

## Installation
**Requirements**:

* [Docker](https://www.docker.com/) 
* [Metamask](https://metamask.io)
* [Allow CORS plugin](https://mybrowseraddon.com/access-control-allow-origin.html) (suggested) - Using the RestChain Mediator in this particular configuration generates CORS exceptions, an easy solution to solve the problem is using this plugin installed and actived in the browser. 

To run the application you need to clone locally the project and then run the following commands:

```
cd restchain
docker-compose up -d 
```

Checking out logs:

```
docker-compose log -f
```

The execution will be providing:

* 3 folders 
	* `database`: containing the database data     
	* `solidity-dir`: containing the bpmn schema artifacts
	* `upload-dir`: containing the smart contract artifacts
* 7 services
	* a *frontend* exposed on port `80`
	* a *backend*  exposed on port `8080	`
	* a *database* exposed on port `3307`
	* a *blockchain* exposed on port `8545`
	* 3 *mediators* one for each Participant 
		* a *mediator* exposed on port `81` 
 		* a *mediator* exposed on port `82`
	 	* a *mediator* exposed on port `83`

## Starting 
Open the browser at the [http://localhost](http://localhost) address and login to the RestChain manager. Each user then can access their own "local" RestChain mediator opening the link [http://localhost:81](http://localhost:81), [http://localhost:82](http://localhost:82) and [http://localhost:83](http://localhost:83).

## Enviroment settings
For development and testing purposes we are using [ganache](https://github.com/trufflesuite/ganache-cli) as a local blockchain.  
Ganache is configured with the option `-d` to generate deterministic addresses based on a seed prhase (called pre-defined mnemonic):

```
# pre-defined mnemonic or seed phrase
include poem goose genuine baby flat mom token drama harsh sadness fit
```
To make the application work correctly the seed prhase must be imported into *Metamask* by the *'Import using the seed phrase'* feature to retrieve the proper accounts from the blockchain. 

<img src="./images/Metamask1.png"  height="350" /> <img src="./images/Metamask2.png"  height="350" />

Once the accounts have been imported and the user address (account) selected, it must be verified that metamask is correctly connected to the application. 

<img src="./images/Metamask3.png"  height="350" />


# Troubleshooting
* ### Operation not permitted

	When occured this error 

	```java.nio.file.FileSystemException: [upload-dir|solidity-dir]/[FILENAME_SCHEMA].bpmn: Operation not permitted```

	it usually means that the directory permissions are not configured properly inside the project folder.  

	For linux users see how to install correctly [Docker](https://docs.docker.com/engine/install/linux-postinstall/).

* ### Black dots on the bpmn-modeler during Choreography Interaction or tools panel missing during Choreography Design [sould be solved]

	Sometimes due to problems with the style sheets, still to be solved, it may occur that black circles appear above the model during the interaction phase or that the tools panel disappears in the Bpmn Designer modeller.

	To solve this issue you need to reload the page and then go to the Choreography design page in order to reloads the style sheet correctly.

* ### Error 500 while ulpoading the designed model
	Pay attention in the creation of the BPMN model taking care to have correctly set the envelopes of the choreography task.

* ### BPMN Model which is not responding and which appears not colored during the interaction phase
	It usually means that the Metamask is not working properly due to some configuration problem. In this case it is necessary to reset the account by going to Metamask then click on the user icon `Settings> Advanced> Reset Account> Reset`.
	
	
