var evoting = artifacts.require('./EVoting.sol');

contract('evoting', function (accounts) {
	var evotingInstance, electionInstance;

	it('initializes with two candidates', function () {
		return evoting
			.deployed()
			.then((instance) => {
				return instance.numCandidates();
			})
			.then((count) => {
				assert.equal(
					count,
					2,
					`Wrong candidates initialized, expected 2, got ${count} instead`
				);
			});
	});

	it('initializes candidate with correct values', () => {
		return evoting
			.deployed()
			.then((instance) => {
				evotingInstance = instance;

				return evotingInstance.candidates(1);
			})
			.then((candidate) => {
				assert.equal(candidate[0], 1, 'Correct ID');
				assert.equal(candidate[1], 'Alice', 'Correct name');
				assert.equal(candidate[2], 0, 'Correct number of votes');

				return evotingInstance.candidates(2);
			})
			.then((candidate) => {
				assert.equal(candidate[0], 2, 'Correct ID');
				assert.equal(candidate[1], 'Bob', 'Correct name');
				assert.equal(candidate[2], 0, 'Correct number of votes');
			});
	});

	it('allows a voter to cast a vote', () => {
		return evoting
			.deployed()
			.then((instance) => {
				electionInstance = instance;
				candidateId = 1;

				return electionInstance.vote(candidateId, { from: accounts[0] });
			})
			.then((receipt) => {
				assert.equal(receipt.logs.length, 1, 'an event was triggered');
				assert.equal(
					receipt.logs[0].event,
					'votedEvent',
					'the event type is correct'
				);
				assert.equal(
					receipt.logs[0].args._candidateId.toNumber(),
					candidateId,
					'Candidate ID is correct'
				);

				return electionInstance.voters(accounts[0]);
			})
			.then((voted) => {
				assert(voted, 'voter was marked as voted');

				return electionInstance.candidates(candidateId);
			})
			.then((candidate) => {
				var numVotes = candidate[2];
				assert.equal(numVotes, 1, "increments the candidate's vote count");
			});
	});

	it('throws exception for invalid candidates', () => {
		return evoting
			.deployed()
			.then((instance) => {
				evotingInstance = instance;

				return evotingInstance.vote(99, { from: accounts[1] });
			})
			.then(assert.fail)
			.catch((error) => {
				assert(
					error.message.indexOf('revert'),
					0,
					'error message must contain revert'
				);

				return evotingInstance.candidates(1);
			})
			.then((candidate1) => {
				var numVotes = candidate1[2];
				assert.equal(numVotes, 1, 'Alice did not receive any votes');

				return evotingInstance.candidates(2);
			})
			.then((candidate2) => {
				var numVotes = candidate2[2];
				assert.equal(numVotes, 0, 'Bob did not receive any votes');
			});
	});

	it('throws an exception for double voting', function () {
		return evoting
			.deployed()
			.then(function (instance) {
				evotingInstance = instance;
				evotingInstance.vote(2, { from: accounts[1] });
				return evotingInstance.candidates(candidateId);
			})
			.then(function (candidate) {
				var numVotes = candidate[2];
				assert.equal(numVotes, 1, 'accepts first vote');
			})
			.then(() => {
				// Try to vote again
				return evotingInstance.vote(candidateId, { from: accounts[1] });
			})
			.then(assert.fail)
			.catch((error) => {
				assert(
					error.message.indexOf('revert'),
					0,
					'error message must contain revert'
				);

				return evotingInstance.candidates(1);
			})
			.then(function (candidate1) {
				var numVotes = candidate1[2];
				assert.equal(numVotes, 1, 'Alice did not receive any votes');
				return evotingInstance.candidates(2);
			})
			.then(function (candidate2) {
				var numVotes = candidate2[2];
				assert.equal(numVotes, 1, 'Bob did not receive any votes');
			});
	});
});
