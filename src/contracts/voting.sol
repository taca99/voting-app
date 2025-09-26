// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.4;

contract Voting {
    struct Vote {
        address voter;
        uint256 proposalId;
        bool choice; // true = yes, false = no
    }

    // proposalId => array of votes
    mapping(uint256 => Vote[]) public votes;

    // proposalId => voter => has voted?
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event Voted(address indexed voter, uint256 indexed proposalId, bool choice);

    // Glasanje
    function vote(uint256 _proposalId, bool _choice) external {
        require(!hasVoted[_proposalId][msg.sender], "Already voted");

        votes[_proposalId].push(Vote({
            voter: msg.sender,
            proposalId: _proposalId,
            choice: _choice
        }));

        hasVoted[_proposalId][msg.sender] = true;

        emit Voted(msg.sender, _proposalId, _choice);
    }

    // Povrat glasova za proposal
    function getVotes(uint256 _proposalId) external view returns (Vote[] memory) {
        return votes[_proposalId];
    }
}