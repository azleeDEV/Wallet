import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Wallet from '../../../backend/artifacts/contracts/Wallet.sol/Wallet.json';
import './App.css';

const WalletAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

function App() {
  const [balance, setBalance] = useState(0);
  const [amountSend, setAmountSend] = useState('');
  const [amountWithdraw, setAmountWithdraw] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getBalance();
  }, []);

  async function getBalance() {
    try {
      if (!window.ethereum) {
        setError("MetaMask n'est pas installé !");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(WalletAddress, Wallet.abi, signer);

      const data = await contract.getBalance();
      setBalance(ethers.formatEther(data)); // Conversion en ETH
    } catch (err) {
      setError("Une erreur est survenue lors de la récupération du solde.");
      console.error(err);
    }
  }

  async function transfer() {
    if (!amountSend) return;

    setError('');
    setSuccess('');

    try {
      if (!window.ethereum) {
        setError("MetaMask n'est pas installé !");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: WalletAddress,
        value: ethers.parseEther(amountSend),
      });

      await tx.wait();
      setAmountSend('');
      getBalance();
      setSuccess('Votre argent a bien été transféré sur le portefeuille !');
    } catch (err) {
      setError('Une erreur est survenue.');
      console.error(err);
    }
  }

  async function withdraw() {
    if (!amountWithdraw) return;

    setError('');
    setSuccess('');

    try {
      if (!window.ethereum) {
        setError("MetaMask n'est pas installé !");
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(WalletAddress, Wallet.abi, signer);

      const tx = await contract.withdrawMoney(
        await signer.getAddress(),
        ethers.parseEther(amountWithdraw)
      );

      await tx.wait();
      setAmountWithdraw('');
      getBalance();
      setSuccess('Votre argent a bien été retiré du portefeuille !');
    } catch (err) {
      setError('Une erreur est survenue.');
      console.error(err);
    }
  }

  const resetChamp = () => {
    setSuccess('');
    setError('');
  }

  return (
    <div className="App">
      <div className="container">
        <div className="logo">
          <i className="fab fa-ethereum"></i>
        </div>
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}
        <h2 style={{ color: balance <= 50 ? 'red' : '#1eff00' }}>
          {balance} <span className="eth">ETH</span>
        </h2>
        <div className="wallet__flex">
          <div className="walletG">
            <h3>{"Envoyer de l'Ether"}</h3>
            <input type="text" placeholder="Ethers" value={amountSend} onChange={(e) => setAmountSend(e.target.value)} onClick={resetChamp} />
            <button onClick={transfer}>Envoyer</button>
          </div>
          <div className="walletD">
            <h3>{"Retirer de l'Ether"}</h3>
            <input type="text" placeholder="Ethers" value={amountWithdraw} onChange={(e) => setAmountWithdraw(e.target.value)} onClick={resetChamp} />
            <button onClick={withdraw}>Retirer</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
