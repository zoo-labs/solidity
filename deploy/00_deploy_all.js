// deploy/00_deploy_all.js
// Deploy all Zoo contracts to Lux devnet

const INITIAL_ERC20_SUPPLY = "1000000000000000000000000"; // 1 million tokens (18 decimals)

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log("======================================");
  log("Deploying Zoo contracts to Lux devnet");
  log(`Deployer: ${deployer}`);
  log("======================================");

  // 1. MockERC20 - ERC20 token
  const mockERC20 = await deploy("MockERC20", {
    from: deployer,
    args: [INITIAL_ERC20_SUPPLY],
    log: true,
  });
  log(`MockERC20 deployed at: ${mockERC20.address}`);

  // 2. BoringFactory - Clone factory for master contracts
  const boringFactory = await deploy("BoringFactory", {
    from: deployer,
    args: [],
    log: true,
  });
  log(`BoringFactory deployed at: ${boringFactory.address}`);

  // 3. MockBoringSingleNFT - ERC721 single NFT
  const boringSingleNFT = await deploy("MockBoringSingleNFT", {
    from: deployer,
    args: [],
    log: true,
  });
  log(`MockBoringSingleNFT deployed at: ${boringSingleNFT.address}`);

  // 4. MockBoringMultipleNFT - ERC721 with multiple tokens
  const boringMultipleNFT = await deploy("MockBoringMultipleNFT", {
    from: deployer,
    args: [],
    log: true,
  });
  log(`MockBoringMultipleNFT deployed at: ${boringMultipleNFT.address}`);

  log("======================================");
  log("Deployment Summary:");
  log("======================================");
  log(`MockERC20:           ${mockERC20.address}`);
  log(`BoringFactory:       ${boringFactory.address}`);
  log(`MockBoringSingleNFT: ${boringSingleNFT.address}`);
  log(`MockBoringMultipleNFT: ${boringMultipleNFT.address}`);
  log("======================================");
};

module.exports.tags = ["Zoo", "All"];
