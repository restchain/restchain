pragma solidity ^0.5.0;

import "./Auction.sol";

contract Registry{

    //all constants here
    uint public startingBidValue=4;
    uint public maxAuctions=2;         // max contemporary auctions for each registrar per batch
    uint public maxBidValue=100;       // per batch
    uint public currentBatchId=0;
    uint public auctionDuration = 360; // seconds

    /* IMPLEMENTATION */
    function initAuction(bytes32[] memory _itemsList) public returns (uint) {
        _prepareAuctions(_itemsList);
        for(uint i = 0; i <_itemsList.length; i++){
            bytes32 _item = _itemsList[i];
            _createAuction(_item);
        }

        return currentBatchId;

    }
    function startAuction(uint _durationTime) public returns (uint endTime){
        setAuctionDuration(_durationTime);
        _startAuctions(currentBatch.domains);

        return currentBatch.currentBatchEndTime;
    }

    function isParticipantExists(address _participant) public returns (bool){
        return getRegistrarsExists(_participant);
    }

    function addParticipant(address _participant) public{
        _addRegistrar(_participant);
    }

    function domainOffer(uint _amount, bytes32 _item,address _participant)  external returns (uint code,bool failure,string memory message) // ritorna (messaggio, fallimento {T|F} , codice di ritorno)
    {
        bytes32 domain ;
        uint amount;
        (message,failure,code,amount,domain) =  offer(_amount,_item,_participant);
        return (code,failure,message);
    }

    function getCurrentBids() public{
        for(uint i = 0; i <currentBatch.domains.length; i++){
            bytes32 _item = currentBatch.domains[i];
            _createAuction(_item);
        }

    }

    function close() public{
        closeAuctions();
    }

    function getSummary() public returns ( uint[] memory amounts,bytes32[] memory itemsList,address[] memory participants){

        address[] memory bidder = new address[](currentBatch.domains.length);
        bytes32[] memory domains = new bytes32[](currentBatch.domains.length);
        uint[] memory bids = new uint[](currentBatch.domains.length);

        for(uint i = 0; i <currentBatch.domains.length; i++){
            bytes32 _item = currentBatch.domains[i];
            bidder[i]=getAuctionsAHighestBidder(_item);
            bids[i]= getAuctionsAHighestBid(_item);
        }
        return (bids, currentBatch.domains,bidder );
    }


    function subscribe(address _participant) public{}

    function checkAuctionIsOver() public returns (bool){
        return _isOver();
    }
    /*****************************************************/
    /* END IMPLEMENTATION */

    function setMaxAuctions(uint val)      public onlyOwner{ maxAuctions=val; }
    function setAuctionDuration(uint val)  public onlyOwner{ auctionDuration=val; }
    function setStartingBidValue(uint val) public onlyOwner{ startingBidValue=val; }
    function setMaxBidValue(uint val)      public onlyOwner{ maxBidValue=val; }

    struct auctionsBatch{
        bytes32[] domains;           // domain names : usiamo bytes32 per ogni dominio
        uint currentBatchEndTime;    // epoch time
        uint currentStartBlock;    //block number
    }

    //PRE: possiamo avere un solo batch/slot di aste attivo allo stesso tempo.
    //In questo caso posso avere tempo globale e info locali sui limitatori
    //dentro il map registrar (perché non possono esistere collisioni).
    auctionsBatch public currentBatch;
    //getter methods
    function getCurrentBatchEndTime() public view returns(uint)             {return currentBatch.currentBatchEndTime;}
    function getCurrentStartBlock() public view returns(uint)             {return currentBatch.currentStartBlock;}
    function getCurrentBatchDomains() public view returns(bytes32[] memory) {return currentBatch.domains;}

    //link al contratto
    struct auctionInfos{
        bytes32 domain; //usato come proof of existence
        Auction a;
    }
    mapping(bytes32 => auctionInfos) public auctions;

    //getter methods
    function getAuctionExists(         bytes32 domain) public view returns(bool)    {return auctions[domain].domain!=0;}
    function getAuctionsDomain(        bytes32 domain) public view returns(bytes32) {return auctions[domain].domain;}
    function getAuctionsA(             bytes32 domain) public view returns(Auction) {return auctions[domain].a;}
    function getAuctionsAHighestBidder(bytes32 domain) public view returns(address) {return Auction(auctions[domain].a).highestBidder();}
    function getAuctionsAHighestBid(   bytes32 domain) public view returns(uint)    {return Auction(auctions[domain].a).highestBid();}

    //registrar contiene info:
    struct participantInfos{
        uint idx;                                  // id registrar
        bytes32[] currentAuctions;                 // ci mettiamo dentro i nomi a dominio a cui sta concorrendo
        mapping(bytes32 => uint) auctionsListBids; // Offerta fatta per ogni dominio
        uint currentCumulativeBiddedValue;         // somma corrente delle offerte
        bool exists;                               // viene impostato a true da addRegistrar
    }
    mapping(address => participantInfos) public registrars;

    //getter methods
    function getRegistrarsIdx(address registrarAddr) public view returns(uint) {return registrars[registrarAddr].idx;}
    function getRegistrarsCurrentAuctions(address registrarAddr) public view returns(bytes32[] memory) {return registrars[registrarAddr].currentAuctions;}
    function getRegistrarsAuctionsListAuction(address registrarAddr,bytes32 auct) public view returns(uint) {return registrars[registrarAddr].auctionsListBids[auct];}
    function getRegistrarsCurrentCumulativeBiddedValue(address registrarAddr) public view returns(uint) {return registrars[registrarAddr].currentCumulativeBiddedValue;}
    function getRegistrarsExists(address registrarAddr) public view returns(bool) {return registrars[registrarAddr].exists;}

    address[] public registrarsList;  // Lista di indirizzi dei registrar abilitati
    uint      public numVoid=0;       // Numero di registrar abilitati che sono stati rimossi

    address payable public owner;

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    modifier onlyRegistrar(address r) {
        require(registrars[r].exists==true);
        _;
    }

    event AuctionsStarted(uint idBatch, uint timeEnd,  uint startBlock,bytes32[] domains);
    event AuctionsClosed(uint idBatch, uint timeEnd);
    event NewRegistrar(uint time, address registrarAddr);

    event FailedOffer(uint time, address registrarAddr,uint amount,bytes32 domain,uint reason);
    //reason==0 if offer not accepted by auction (time elapsed)
    //reason==1 if offer not accepted by limitatori max number auctions bidded on
    //reason==2 if offer not accepted by limitatori max bidded value exceeded

    constructor() public{
        owner = msg.sender;
    }

    // invocata dal registrar per notificare al registro che vuole essere abilitato
    function notifyNewRegistrar() public{
        if(registrars[msg.sender].exists==false) emit NewRegistrar(now, msg.sender);
    }

    // invocata dal registro per abilitare un registrar
    function _addRegistrar(address r) private onlyOwner{
        require(registrars[r].exists==false);

        registrars[r].idx    = registrarsList.length; // Posizione nella lista dei registrar
        registrars[r].exists = true;

        registrarsList.push(r);
    }

    function removeRegistrar(address r) public onlyOwner onlyRegistrar(r) {
        delete registrarsList[registrars[r].idx];
        delete registrars[r];
        numVoid = numVoid+1;
        if(numVoid>(registrarsList.length/10)) defrag();
    }

    // Utilizzata da removeRegistrar per compattare registrarList
    address[] arrayTemp;
    function defrag() private{
        uint current=0;
        for (uint i = 0; i<registrarsList.length; i++){
            if(registrarsList[i]!=address(0)){
                arrayTemp.push(registrarsList[i]);
                registrars[registrarsList[i]].idx=current;
                current=current+1;
            }
        }
        registrarsList=arrayTemp;
    }

    // sets batch level informations
    // Invocato dal registro con manageNewBatch con una lista di domini
    function _prepareAuctions(bytes32[] memory _domainsList) private onlyOwner{
        //auctions map has been emptied (done by closeAuctions)
        //conviene fare un test se auctions è vuoto? Serve un auctionsLenght ???
        currentBatch.domains=_domainsList;
        currentBatch.currentBatchEndTime=0;
        currentBatch.currentStartBlock=block.number;
        resetAllLimits();
    }

    // Invocato dal registro per ogni dominio
    function _createAuction(bytes32 _domain) private onlyOwner{
        //1)create auction contract
        Auction a=new Auction(startingBidValue);
        //2)update auctions mapping
        auctions[_domain] = auctionInfos(_domain,a);
        /*
        auctionInfos storage temp = auctions[_domain]; // in questo modo creo un nuovo elemento
        temp.domain = _domain;
        temp.a      = a;
        */
    }

    /* Cancella tutti i dati dei registrar relativi al precedente batch:
       - aste a cui hanno partecipato
       - le relative offerte massime
       - il totale delle offerte */
    function resetAllLimits() private{
        for (uint i = 0; i<registrarsList.length; i++){
            if(registrarsList[i]!=address (0)){
                for(uint j = 0; j < registrars[registrarsList[i]].currentAuctions.length ; j++){
                    if(registrars[registrarsList[i]].currentAuctions[j]!=0){
                        //azzero la map
                        delete registrars[registrarsList[i]].auctionsListBids[registrars[registrarsList[i]].currentAuctions[j]];
                        //azzero vettore
                        //delete registrars[registrarsList[i]].currentAuctions[j];
                    }
                }//assegna nuovo vettore per evitare buchi
                delete registrars[registrarsList[i]].currentAuctions;
                registrars[registrarsList[i]].currentCumulativeBiddedValue=0;
            }
        }
    }

    /* Invocato dal registro
       Fa partire tutte le aste create */
    function _startAuctions(bytes32[] memory _domainsList) private onlyOwner{
        //1)per ogni asta vecchia controllo se è attivata ora o no : VERIFICARE se superfluo
        for(uint i = 0; i<currentBatch.domains.length; i++){
            if(!checkIfBelongs(_domainsList, currentBatch.domains[i])) closeAuction(i);
        }

        //2)setto tempo, che è la flag per poter iniziare ad accettare offerte.
        currentBatch.currentBatchEndTime=now + auctionDuration;
        //        currentBatch.currentStartBlock=block.number;
        emit AuctionsStarted(currentBatchId, currentBatch.currentBatchEndTime, currentBatch.currentStartBlock, _domainsList);
        currentBatchId = currentBatchId + 1;
    }

    function checkIfBelongs(bytes32[] memory _domainsList, bytes32 _domain) private pure returns(bool){
        for(uint j = 0; j<_domainsList.length; j++) if(_domainsList[j]==_domain) return true;
        return false;
    }

    /* Funzione invocata dai registrar */
    function offer(uint _amount, bytes32 _domain, address _participant) public onlyRegistrar(_participant) returns (string memory message,bool failure,uint code,uint amount, bytes32 item){
        if((now>=currentBatch.currentBatchEndTime)||(auctions[_domain].domain==0)){

            emit FailedOffer(now, _participant, _amount, _domain, 0);
            return ("Auction is Over",true,401,_amount,_domain);
        } else{
            if(registrars[_participant].auctionsListBids[_domain]==0){ // se non ha mai fatto offerte per _domain
                if(registrars[_participant].currentAuctions.length < maxAuctions){
                    if(registrars[_participant].currentCumulativeBiddedValue + _amount<=maxBidValue){
                        registrars[_participant].currentAuctions.push(_domain);
                        registrars[_participant].auctionsListBids[_domain]=_amount;
                        registrars[_participant].currentCumulativeBiddedValue=registrars[_participant].currentCumulativeBiddedValue+_amount;
                        Auction(auctions[_domain].a).offer(_amount,_participant);
                    } else {
                        emit FailedOffer(now,_participant,_amount,_domain,2);
                        return ("Bid value too low",true,402,_amount,_domain);
                    }
                } else {
                    emit FailedOffer(now,_participant,_amount,_domain,1);
                    return ("Domain limit reached",true,111,_amount,_domain);
                }
            } else { // Ha fatto già offerte su questo _domain
                if(registrars[_participant].currentCumulativeBiddedValue - registrars[_participant].auctionsListBids[_domain] + _amount <= maxBidValue){ // verifica di non superare il limite max di offerte
                    if(registrars[_participant].auctionsListBids[_domain]<_amount){
                        //need to update current highest offer for an auction only if it is actually higher
                        registrars[_participant].currentCumulativeBiddedValue=registrars[_participant].currentCumulativeBiddedValue-registrars[_participant].auctionsListBids[_domain]+_amount;
                        registrars[_participant].auctionsListBids[_domain]=_amount;
                    }
                    (message,failure,code) = Auction(auctions[_domain].a).offer(_amount,_participant);
                    return (message,failure,code,_amount,_domain);
                }else {
                    emit FailedOffer(now,_participant,_amount,_domain,2);
                    return ("XXX",true,111,_amount,_domain);
                }
            }

        }
    }

    /* Invocata dal registro */
    function closeAuctions() public onlyOwner{
        require(now>currentBatch.currentBatchEndTime);
        for(uint i = 0; i<currentBatch.domains.length; i++){
            if(currentBatch.domains[i] != 0)
                closeAuction(i);
        }
        emit AuctionsClosed(currentBatchId, currentBatch.currentBatchEndTime);
        currentBatch.currentBatchEndTime=0;
        currentBatch.domains=new bytes32[](0);
    }

    function closeAuction(uint i) private onlyOwner{
        //elimina da current batch
        Auction(auctions[currentBatch.domains[i]].a).close();
        delete auctions[currentBatch.domains[i]];
        delete currentBatch.domains[i];
    }

    // Non controlla che sia passato il tempo. Utile in fase di test e se chiudo il controller
    function closeAuctionsBrute() public onlyOwner{
        //require(now>currentBatch.currentBatchEndTime);
        for(uint i = 0; i<currentBatch.domains.length; i++){
            if(currentBatch.domains[i] != 0)
                closeAuction(i);
        }
        emit AuctionsClosed(currentBatchId, currentBatch.currentBatchEndTime);
        currentBatch.currentBatchEndTime=0;
        currentBatch.domains=new bytes32[](0);
    }

    function _close() public onlyOwner{
        closeAuctionsBrute();
        selfdestruct(owner);
    }

    function getRegistrarsList() public view returns (address[] memory) {
        return registrarsList;
    }

    function _isOver() private  returns (bool){
        return now < currentBatch.currentBatchEndTime;
    }
}
