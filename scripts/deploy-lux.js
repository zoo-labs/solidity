// scripts/deploy-lux.js
// Deploy Zoo contracts to Lux devnet
//
// Usage: node scripts/deploy-lux.js
//
// Environment:
//   PRIVATE_KEY - Private key for deployment (required if no funded account)
//   RPC_URL - RPC endpoint (default: http://127.0.0.1:9640/ext/bc/C/rpc)

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Configuration
const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:9640/ext/bc/C/rpc";
const CHAIN_ID = 96368; // Lux Testnet

// Initial supply for ERC20 (1 million tokens with 18 decimals)
const INITIAL_ERC20_SUPPLY = ethers.BigNumber.from("1000000000000000000000000");

// Contracts to deploy
const CONTRACTS = [
  { name: "MockERC20", args: [INITIAL_ERC20_SUPPLY] },
  { name: "BoringFactory", args: [] },
  { name: "MockBoringSingleNFT", args: [] },
  { name: "MockBoringMultipleNFT", args: [] },
];

async function loadArtifact(contractName) {
  const artifactPath = path.join(
    __dirname,
    "..",
    "artifacts",
    "contracts",
    contractName.includes("Mock") ? "mocks" : "",
    `${contractName}.sol`,
    `${contractName}.json`
  );

  // Try multiple paths
  const paths = [
    artifactPath,
    path.join(__dirname, "..", "artifacts", "contracts", `${contractName}.sol`, `${contractName}.json`),
    path.join(__dirname, "..", "artifacts", "contracts", "mocks", `${contractName}.sol`, `${contractName}.json`),
  ];

  for (const p of paths) {
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf8"));
    }
  }

  throw new Error(`Artifact not found for ${contractName}. Paths tried: ${paths.join(", ")}`);
}

async function main() {
  console.log("============================================");
  console.log("Zoo Contracts Deployment to Lux Devnet");
  console.log("============================================");
  console.log(`RPC URL: ${RPC_URL}`);
  console.log(`Chain ID: ${CHAIN_ID}`);
  console.log("");

  // Connect to network
  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);

  // Check network
  const network = await provider.getNetwork();
  console.log(`Connected to network: ${network.name} (chainId: ${network.chainId})`);

  if (network.chainId !== CHAIN_ID) {
    console.warn(`Warning: Expected chain ID ${CHAIN_ID}, got ${network.chainId}`);
  }

  // Get signer
  let wallet;
  if (process.env.PRIVATE_KEY) {
    wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  } else {
    // Try using the test mnemonic
    const mnemonic = "test test test test test test test test test test test junk";
    wallet = ethers.Wallet.fromMnemonic(mnemonic).connect(provider);
  }

  const balance = await wallet.getBalance();
  console.log(`Deployer: ${wallet.address}`);
  console.log(`Balance: ${ethers.utils.formatEther(balance)} LUX`);
  console.log("");

  if (balance.eq(0)) {
    console.error("Error: Deployer account has no funds!");
    console.error("Please fund the account or provide a funded PRIVATE_KEY");
    console.error("");
    console.error("Treasury address with funds: 0x9011E888251AB053B7bD1cdB598Db4f9DEd94714");
    process.exit(1);
  }

  // Deploy contracts
  const deployed = {};
  const gasPrice = ethers.utils.parseUnits("25", "gwei");

  for (const contract of CONTRACTS) {
    console.log(`Deploying ${contract.name}...`);

    try {
      const artifact = await loadArtifact(contract.name);
      const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, wallet);

      const deployTx = await factory.deploy(...contract.args, { gasPrice });
      console.log(`  Transaction hash: ${deployTx.deployTransaction.hash}`);

      await deployTx.deployed();
      console.log(`  Deployed at: ${deployTx.address}`);

      deployed[contract.name] = deployTx.address;
    } catch (error) {
      console.error(`  Error deploying ${contract.name}: ${error.message}`);
    }
    console.log("");
  }

  // Summary
  console.log("============================================");
  console.log("Deployment Summary");
  console.log("============================================");
  console.log(`Network: Lux Testnet (${RPC_URL})`);
  console.log(`Chain ID: ${network.chainId}`);
  console.log(`Deployer: ${wallet.address}`);
  console.log("");
  console.log("Deployed Contracts:");
  for (const [name, address] of Object.entries(deployed)) {
    console.log(`  ${name}: ${address}`);
  }
  console.log("");

  // Save deployment info
  const deploymentInfo = {
    network: "lux-testnet",
    chainId: network.chainId,
    rpcUrl: RPC_URL,
    deployer: wallet.address,
    timestamp: new Date().toISOString(),
    contracts: deployed,
  };

  const outputPath = path.join(__dirname, "..", "deployments", "lux-testnet.json");
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`Deployment info saved to: ${outputPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
