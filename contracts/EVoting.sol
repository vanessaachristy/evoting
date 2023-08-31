pragma solidity ^0.5.0;

contract Evoting {
    // Model a candidate
    struct Candidate {
        uint id;
        string name;
        uint numVotes;
    }

    // All candidates by id
    mapping(uint => Candidate) public candidates;

    // Number of candidates
    uint public numCandidates;

    // Store addresses that have already voted
    mapping(address => bool) public voters;

    // Trigger this event whenever a vote is casted
    event votedEvent(uint indexed _candidateId);

    // Add a candidate by name into the mapping, and auto-increment number of candidates
    function addCandidate(string memory _name) private {
        ++numCandidates;
        candidates[numCandidates] = Candidate(numCandidates, _name, 0);
    }

    // Constructor
    constructor() public {
        addCandidate("Alice");
        addCandidate("Bob");
    }

    // Caller address cast a vote for the candidate
    function vote(uint _candidateId) public {
        // require to not casted a vote before
        require(!voters[msg.sender], "Already voted!");

        // check for valid candidate
        require(
            _candidateId > 0 && _candidateId <= numCandidates,
            "Invalid candidate!"
        );

        // record that voter already voted
        voters[msg.sender] = true;

        // update the candidate vote count
        ++candidates[_candidateId].numVotes;

        // trigger the voted event
        emit votedEvent(_candidateId);
    }
}
