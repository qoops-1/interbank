pragma solidity ^0.4.8;

contract Ownable {
  address public owner;

  function Ownable() {
    owner = msg.sender;
  }

  modifier onlyOwner() {
    if (msg.sender != owner) {
      throw;
    }
    _;
  }

}
contract Token is Ownable {
    mapping(address => uint) balances;
    mapping (address => mapping (address => uint)) allowed;

    event Transfer(address indexed from, address indexed to, uint value);

    function transfer(address _to, uint _value) onlyOwner {
        balances[_to] = balances[_to] + _value;
        Transfer(msg.sender, _to, _value);
    }

    function balanceOf(address _owner) constant returns (uint balance) {
        return balances[_owner];
    }
}