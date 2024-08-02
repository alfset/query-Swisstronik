import React, { useState } from 'react';
import { ethers } from 'ethers';

function App() {
    const [contractInput, setContractInput] = useState('');
    const [txHashInput, setTxHashInput] = useState('');
    const [bytecodes, setBytecodes] = useState([]);
    const [txDetails, setTxDetails] = useState([]);
    const [loading, setLoading] = useState(false);

    const jsonRpcUrl = 'https://json-rpc.testnet.swisstronik.com';

    const parseInput = (input) => {
        try {
            const parsedInput = JSON.parse(input);
            return Array.isArray(parsedInput) ? parsedInput : parsedInput.split(',').map(item => item.trim());
        } catch {
            return input.split(',').map(item => item.trim());
        }
    };

    const handleContractQuery = async () => {
        const provider = new ethers.JsonRpcProvider(jsonRpcUrl);
        const addresses = parseInput(contractInput);
        const newBytecodes = [];

        setLoading(true);

        for (const address of addresses) {
            if (!address) {
                newBytecodes.push({ address, bytecode: 'Please enter a valid contract address.' });
                continue;
            }

            try {
                const code = await provider.getCode(address);

                if (code === '0x') {
                    newBytecodes.push({ address, bytecode: 'No contract found.' });
                } else {
                    newBytecodes.push({ address, bytecode: code });
                }
            } catch (error) {
                newBytecodes.push({ address, bytecode: `Error fetching bytecode: ${error.message}` });
            }
        }

        setBytecodes(newBytecodes);
        setLoading(false);
    };

    const handleTxQuery = async () => {
        const provider = new ethers.JsonRpcProvider(jsonRpcUrl);
        const hashes = parseInput(txHashInput);
        const newTxDetails = [];

        setLoading(true);

        for (const hash of hashes) {
            if (!hash) {
                newTxDetails.push({ hash, receipt: 'Please enter a valid transaction hash.' });
                continue;
            }

            try {
                const receipt = await provider.getTransactionReceipt(hash);

                if (receipt) {
                    newTxDetails.push({ hash, receipt });
                } else {
                    newTxDetails.push({ hash, receipt: 'Transaction receipt not found.' });
                }
            } catch (error) {
                newTxDetails.push({ hash, receipt: `Error fetching transaction receipt: ${error.message}` });
            }
        }

        setTxDetails(newTxDetails);
        setLoading(false);
    };

    const downloadJson = (data, filename) => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleFileUpload = (event, type) => {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const content = e.target.result;
                if (type === 'contracts') {
                    setContractInput(content);
                } else if (type === 'transactions') {
                    setTxHashInput(content);
                }
            } catch (error) {
                console.error('Error reading file:', error.message);
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="App">
            <h1>Contract and Transaction Query</h1>

            <div className="container">
                <h2>Upload Contract Addresses File</h2>
                <input type="file" accept=".json,.txt" onChange={(e) => handleFileUpload(e, 'contracts')} />
                <textarea
                    rows="4"
                    cols="50"
                    value={contractInput}
                    onChange={(e) => setContractInput(e.target.value)}
                    placeholder='Enter contract addresses as a list (comma-separated or JSON array)'
                />
                <div className="customized-button">
                    <button onClick={handleContractQuery} disabled={loading}>
                        {loading ? 'Loading...' : 'Query Bytecode'}
                    </button>
                    <div>
                        {bytecodes.map((item, index) => (
                            <div className="result" key={index}>
                                <strong>Address:</strong> {item.address}<br /><br />
                                <strong>Bytecode:</strong> <pre>{item.bytecode}</pre>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => downloadJson({ contracts: bytecodes }, 'contracts.json')} disabled={loading}>
                        Download Bytecode JSON
                    </button>
                </div>
            </div>

            <div className="container">
                <h2>Upload Transaction Hashes File</h2>
                <input type="file" accept=".json,.txt" onChange={(e) => handleFileUpload(e, 'transactions')} />
                <textarea
                    rows="4"
                    cols="50"
                    value={txHashInput}
                    onChange={(e) => setTxHashInput(e.target.value)}
                    placeholder='Enter transaction hashes as a list (comma-separated or JSON array)'
                />
                <div className="customized-button">
                    <button onClick={handleTxQuery} disabled={loading}>
                        {loading ? 'Loading...' : 'Query Transaction'}
                    </button>
                    <div>
                        {txDetails.map((item, index) => (
                            <div className="result" key={index}>
                                <strong>Hash:</strong> {item.hash}<br />
                                <br />
                                <strong>Receipt:</strong> <pre>{JSON.stringify(item.receipt, null, 2)}</pre>
                            </div>
                        ))}
                    </div>
                    <button onClick={() => downloadJson({ transactions: txDetails }, 'transactions.json')} disabled={loading}>
                        Download Transactions JSON
                    </button>
                </div>
            </div>
        </div>
    );
}

export default App;
