pragma solidity ^0.4.2;

contract Owned {
    address owner;

    function Owned () {
        owner = msg.sender;
    }
}

contract Mortal is Owned {
    function kill() {
        if (msg.sender == owner) selfdestruct(owner);
    }
}

contract KycStorage is Mortal {

	struct Entry {
		bytes32 rights;
		bytes32 checksum;
	}

	mapping (address => Entry) entries;

	event DidAdd(address indexed id, bytes32 rights, bytes32 checksum);

	function add(bytes32 rights, bytes32 checksum) {
		var entry = Entry(rights, checksum);
		entries[msg.sender] = entry;

		DidAdd(msg.sender, rights, checksum);
	}

	function get(address id) constant returns (bytes32, bytes32) {
		var entry = entries[id];
		return (entry.rights, entry.checksum);
	}
}
