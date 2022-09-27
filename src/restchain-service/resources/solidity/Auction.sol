pragma solidity ^0.5.0;

contract Auction{

    address payable public owner; // controller
    address public highestBidder;
    uint    public highestBid;

    // Events that will be fired on changes.
    event HighestBidIncreased(address bidder, uint amount);
    event DiscardedBid(address bidder, uint amount);
    event LotAuctionEnded(address winner, uint amount);
    event Bidder(address bidder); //Log, rimuovere

    modifier onlyOwner {
        require(msg.sender == owner);
        _;
    }

    constructor(uint startingBid) public{
        owner      = msg.sender;
        highestBid = startingBid;  // base d'asta settato dall'Auctioneer
    }

    function offer(uint _amount, address _bidder) public onlyOwner returns (string memory message,bool failure,uint code) {
        emit Bidder(_bidder);
        return bid(_amount,_bidder);
    }

    function bidIncreased(uint _amount, address _bidder) private{
        highestBidder = _bidder;
        highestBid    = _amount;
        emit HighestBidIncreased(_bidder, _amount);
    }

    function bid(uint _amount, address _bidder) private returns (string memory message, bool failure, uint code){
        if (_amount > highestBid){
            bidIncreased(_amount, _bidder);
            return ("Highet Bid Increased",false,200);
        }else{
            emit DiscardedBid(_bidder, _amount);
            return ("Currunt bid value higher ",true,201);
        }
    }

    function close() public onlyOwner{
        emit LotAuctionEnded(highestBidder, highestBid);
        selfdestruct(owner);
    }

} // contract Auction
