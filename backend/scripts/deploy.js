import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
    const { ethers } = hre;

    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy();
    // waitForDeployment is ethers v6 syntax
    await escrow.waitForDeployment();
    const address = await escrow.getAddress();

    console.log("Escrow contract deployed to:", address);

    // Extract ABI
    const artifactsDir = path.join(__dirname, "../artifacts/contracts/Escrow.sol/Escrow.json");
    const artifact = JSON.parse(fs.readFileSync(artifactsDir, "utf-8"));

    // Write ABI + address to client/src/constants/Escrow.json
    const outputDir = path.join(__dirname, "../../client/src/constants");
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const outputData = {
        address: address,
        abi: artifact.abi
    };

    fs.writeFileSync(
        path.join(outputDir, "Escrow.json"),
        JSON.stringify(outputData, null, 2)
    );
    console.log("ABI exported to client/src/constants/Escrow.json");

    // Auto-update ESCROW_ADDRESS in client/src/constants/index.ts
    const indexTsPath = path.join(outputDir, "index.ts");
    fs.writeFileSync(indexTsPath, `export const ESCROW_ADDRESS = "${address}";\n`);
    console.log(`ESCROW_ADDRESS updated to ${address} in client/src/constants/index.ts`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
