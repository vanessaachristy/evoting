var EVoting = artifacts.require('./EVoting.sol');

module.exports = function (deployer) {
	deployer.deploy(EVoting);
};
