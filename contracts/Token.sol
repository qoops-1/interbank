pragma solidity ^0.4.8;

import "./ERC20Token.sol";

contract Token is ERC20Token {
    mapping(address => uint) balances;
    mapping (address => mapping (address => uint)) allowed;
    uint256 supply;

    function Token(uint _supply) {
        totalSupply = _supply;
    }

    function transfer(address _to, uint _value) returns (bool success) {
        if (balances[msg.sender] < _value) {
            return false;
        }
        balances[msg.sender] = balances[msg.sender] - _value;
        balances[_to] = balances[_to] + _value;
        Transfer(msg.sender, _to, _value);
        return true;
    }

    function transferFrom(address _from, address _to, uint _value) returns (bool success) {
        var _allowance = allowed[_from][msg.sender];
        if (_value > _allowance || _value > balances[_from]) {
            return false;
        }
        balances[_to] = balances[_to] + _value;
        balances[_from] = balances[_from] - _value;
        allowed[_from][msg.sender] = _allowance - _value;
        Transfer(_from, _to, _value);
        return true;
    }

    function balanceOf(address _owner) constant returns (uint balance) {
        return balances[_owner];
    }

    function approve(address _spender, uint _value) returns (bool success) {
        allowed[msg.sender][_spender] = _value;
        Approval(msg.sender, _spender, _value);
        return true;
    }

    function allowance(address _owner, address _spender) constant returns (uint remaining) {
        return allowed[_owner][_spender];
    }
}