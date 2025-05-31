import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { WalletProvider } from './contexts/WalletContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import MintNFT from './pages/MintNFT';
import MyNFTs from './pages/MyNFTs';
import NFTDetails from './pages/NFTDetails';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/mint" element={<MintNFT />} />
              <Route path="/my-nfts" element={<MyNFTs />} />
              <Route path="/nft/:tokenId" element={<NFTDetails />} />
            </Routes>
          </main>

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4ade80',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;
