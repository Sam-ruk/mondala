'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState([]);

  const whitelist = process.env.NEXT_PUBLIC_WHITELIST
    ? process.env.NEXT_PUBLIC_WHITELIST.split(',').map(addr => addr.trim().toLowerCase())
    : [];

  // Generate particles
  useEffect(() => {
    const generateParticles = () => {
      const newParticles = [];
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 4 + 1,
          duration: Math.random() * 20 + 10,
          delay: Math.random() * 10,
        });
      }
      setParticles(newParticles);
    };
    generateParticles();
  }, []);

  const checkWhitelist = async () => {
    setResult(null);
    setIsLoading(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (!walletAddress) {
      setResult({ type: 'error', message: 'Please enter a wallet address.' });
      setIsLoading(false);
      return;
    }

    if (!walletAddress.startsWith('0x')) {
      setResult({ type: 'error', message: 'Invalid EVM wallet address: Must start with "0x".' });
      setIsLoading(false);
      return;
    }
    if (walletAddress.length !== 42) {
      setResult({ type: 'error', message: 'Invalid EVM wallet address: Must be 42 characters long.' });
      setIsLoading(false);
      return;
    }
    if (!/^[0-9a-fA-F]{40}$/.test(walletAddress.slice(2))) {
      setResult({ type: 'error', message: 'Invalid EVM wallet address: Must contain only hexadecimal characters after "0x".' });
      setIsLoading(false);
      return;
    }

    if (whitelist.includes(walletAddress.toLowerCase())) {
      setResult({
        type: 'success',
        message: `GLFP 💜`
      });
    } else {
      setResult({
        type: 'error',
        message: `Stay active, GLFP 💜`
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="w-screen min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-purple-950 relative overflow-x-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(139,69,255,0.1),transparent_50%)]" />
      
      {/* Floating Particles */}
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-purple-400 rounded-full animate-pulse opacity-60"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,69,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,69,255,0.03)_1px,transparent_1px)] bg-[size:50px_50px]" />

      <div className="relative z-10 min-h-screen flex flex-col p-4 sm:p-6 lg:p-8 items-center">
        {/* Header Section */}
        <div className="text-center mb-4 sm:mb-6 lg:mb-8 flex-shrink-0">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-purple-300 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
            LFP Whitelist Checker
          </h1>
        </div>

        {/* Main Content - Equal Height Containers */}
        <div className="flex-1 flex flex-col lg:flex-row lg:items-stretch gap-4 sm:gap-6 lg:gap-8 w-full max-w-[1920px] lg:min-h-[calc(100vh-200px)]">
          {/* Left Container - Banner GIF */}
          <div className="w-full lg:w-1/2 lg:flex-1 order-2 lg:order-1 flex justify-center">
            <div className="relative group w-full max-w-[720px] max-h-[calc(100vh-200px)] min-h-[300px] h-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-pulse" />
              <div className="relative bg-gradient-to-b from-[#560097] to-[#a700d2] backdrop-blur-xl rounded-3xl p-0 border border-purple-500/30 h-full flex flex-col">
                <div className="rounded-2xl overflow-hidden shadow-2xl relative flex-1 flex items-center justify-center">
                  <img 
                    src="/banner.gif" 
                    alt="FEET PASS Banner"
                    className="w-full h-full max-w-full max-h-full object-contain transform hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Container - Form + Feet GIF */}
          <div className="w-full lg:w-1/2 lg:flex-1 order-1 lg:order-2 flex justify-center">
            <div className="relative group w-full max-w-[720px] max-h-[calc(100vh-200px)] min-h-[300px] h-full">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
              <div className="relative bg-gradient-to-br from-purple-900/80 via-slate-900/80 to-purple-900/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-purple-500/30 shadow-0xl h-full flex flex-col justify-center">
                
                {/* Form Section */}
                <div className="space-y-4 sm:space-y-6 flex-shrink-0">
                  <div>
                    <label className="block text-purple-300 text-sm font-semibold mb-2 sm:mb-3 uppercase tracking-wide">
                      Wallet Address
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="0x..."
                        value={walletAddress}
                        onChange={(e) => setWalletAddress(e.target.value.trim())}
                        className="w-full p-3 sm:p-4 rounded-xl border border-purple-500/50 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/50 outline-none transition-all duration-300 bg-slate-800/50 text-purple-100 placeholder-purple-300/60 text-sm sm:text-base font-mono backdrop-blur-sm shadow-inner overflow-hidden text-overflow-ellipsis sm:overflow-visible sm:text-overflow-clip"
                        disabled={isLoading}
                      />
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={checkWhitelist}
                    disabled={!walletAddress || isLoading}
                    className="w-full group relative overflow-hidden rounded-xl p-3 sm:p-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-sm sm:text-base transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-600/30 hover:shadow-purple-600/50 transform hover:scale-105 active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                    <div className="relative flex items-center justify-center gap-3">
                      {isLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>CHECKING...</span>
                        </>
                      ) : (
                        <>
                          <span>🔍</span>
                          <span>CHECK WHITELIST</span>
                        </>
                      )}
                    </div>
                  </button>

                  {/* Result */}
                  {result && (
                    <div className={`relative p-4 sm:p-6 rounded-xl border transition-all duration-500 transform ${
                      result.type === 'success' 
                        ? 'bg-gradient-to-r from-green-900/30 to-purple-900/30 border-green-500/50 text-green-100' 
                        : 'bg-gradient-to-r from-red-900/30 to-purple-900/30 border-red-500/50 text-red-100'
                    } backdrop-blur-sm shadow-xl`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                          result.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                        }`}>
                          {result.type === 'success' ? '✓' : '✗'}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium mb-1">
                            {result.type === 'success' ? 'WHITELISTED' : 'NOT WHITELISTED'}
                          </div>
                          <div className="text-sm opacity-90 leading-relaxed">
                            {result.message}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}