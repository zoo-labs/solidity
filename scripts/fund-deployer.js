// scripts/fund-deployer.js
// Fund the deployer account from treasury
//
// Usage: TREASURY_KEY=<private_key> node scripts/fund-deployer.js
//
// Environment:
//   TREASURY_KEY - Private key of treasury account (required)
//   RPC_URL - RPC endpoint (default: http://127.0.0.1:9640/ext/bc/C/rpc)
//   DEPLOYER_ADDRESS - Address to fund (default: first hardhat test account)

const { ethers } = require("ethers");

const RPC_URL = process.env.RPC_URL || "http://127.0.0.1:9640/ext/bc/C/rpc";
const TREASURY_KEY = process.env.TREASURY_KEY;
const TREASURY_ADDRESS = "0x9011E888251AB053B7bD1cdB598Db4f9DEd94714";

// First account from test mnemonic "test test test test test test test test test test test junk"
const DEPLOYER_ADDRESS = process.env.DEPLOYER_ADDRESS || "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

// Amount to send (100 LUX)
const FUND_AMOUNT = ethers.utils.parseEther("100");

async function main() {
  console.log("============================================");
  console.log("Fund Deployer Account");
  console.log("============================================");
  console.log(`RPC URL: ${RPC_URL}`);
  console.log(`Treasury: ${TREASURY_ADDRESS}`);
  console.log(`Deployer: ${DEPLOYER_ADDRESS}`);
  console.log(`Amount: ${ethers.utils.formatEther(FUND_AMOUNT)} LUX`);
  console.log("");

  if (!TREASURY_KEY) {
    console.error("Error: TREASURY_KEY environment variable is required");
    console.error("");
    console.error("The treasury account 0x9011E888251AB053B7bD1cdB598Db4f9DEd94714");
    console.error("is derived from the production mnemonic which is not in the codebase.");
    console.error("");
    console.error("For local development, you have these options:");
    console.error("1. Use the Lux CLI to fund from P-chain:");
    console.error("   lux chain send --from-chain P --to-chain C --key <keyname> --amount 100");
    console.error("");
    console.error("2. Restart the network with --dev mode which uses K=1 consensus");
    console.error("   and may have different allocations.");
    console.error("");
    console.error("3. Contact your team for the production mnemonic.");
    process.exit(1);
  }

  const provider = new ethers.providers.JsonRpcProvider(RPC_URL);
  const treasury = new ethers.Wallet(TREASURY_KEY, provider);

  // Verify treasury address
  if (treasury.address.toLowerCase() !== TREASURY_ADDRESS.toLowerCase()) {
    console.error(`Error: Provided key derives address ${treasury.address}`);
    console.error(`       Expected treasury address ${TREASURY_ADDRESS}`);
    process.exit(1);
  }

  const treasuryBalance = await treasury.getBalance();
  console.log(`Treasury balance: ${ethers.utils.formatEther(treasuryBalance)} LUX`);

  if (treasuryBalance.lt(FUND_AMOUNT)) {
    console.error("Error: Treasury has insufficient balance");
    process.exit(1);
  }

  console.log("\nSending funds...");
  const tx = await treasury.sendTransaction({
    to: DEPLOYER_ADDRESS,
    value: FUND_AMOUNT,
    gasPrice: ethers.utils.parseUnits("25", "gwei"),
  });

  console.log(`Transaction hash: ${tx.hash}`);
  await tx.wait();

  const deployerBalance = await provider.getBalance(DEPLOYER_ADDRESS);
  console.log(`\nDeployer balance: ${ethers.utils.formatEther(deployerBalance)} LUX`);
  console.log("\nFunding complete! You can now run the deployment script.");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
