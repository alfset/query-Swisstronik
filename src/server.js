import express from 'express';
import { ethers } from 'ethers';

const app = express();
app.use(express.json());

const jsonRpcUrl = 'https://json-rpc.testnet.swisstronik.com';
const provider = new ethers.JsonRpcProvider(jsonRpcUrl);

app.post('/query', async (req, res) => {
    const { contractAddresses, txHashes } = req.body;

    const responses = { bytecodes: [], txDetails: [] };

    if (contractAddresses) {
        for (const address of contractAddresses) {
            try {
                const code = await provider.getCode(address);
                responses.bytecodes.push({
                    address,
                    bytecode: code === '0x' ? 'No contract found.' : code
                });
            } catch (error) {
                responses.bytecodes.push({
                    address,
                    bytecode: `Error fetching bytecode: ${error.message}`
                });
            }
        }
    }

    if (txHashes) {
        for (const hash of txHashes) {
            try {
                const receipt = await provider.getTransactionReceipt(hash);
                responses.txDetails.push({
                    hash,
                    receipt: receipt ? receipt : 'Transaction receipt not found.'
                });
            } catch (error) {
                responses.txDetails.push({
                    hash,
                    receipt: `Error fetching transaction receipt: ${error.message}`
                });
            }
        }
    }

    res.json(responses);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
