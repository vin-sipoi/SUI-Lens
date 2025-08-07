'use client';

import { useState, useEffect } from 'react';
import { X, Send, Coins, Image, Copy, Check, Wallet, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useZkLogin, useEnokiFlow } from '@mysten/enoki/react';
import { useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';

interface WalletPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

// Helper function to format balance
function formatBalance(balance: string, decimals: number): string {
  const value = parseFloat(balance) / Math.pow(10, decimals);
  return value.toFixed(6);
}

export function WalletPopup({ isOpen, onClose }: WalletPopupProps) {
  const { address } = useZkLogin();
  const enokiFlow = useEnokiFlow();
  const suiClient = useSuiClient();
  const [activeTab, setActiveTab] = useState('assets');
  const [balance, setBalance] = useState('0');
  const [totalUsdValue, setTotalUsdValue] = useState('0');
  const [copied, setCopied] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [recipientAddress, setRecipientAddress] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [coins, setCoins] = useState<any[]>([]);
  const [nfts, setNfts] = useState<any[]>([]);
  const [fetchingCoins, setFetchingCoins] = useState(false);
  const [fetchingNfts, setFetchingNfts] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch wallet data function
  const fetchWalletData = async (showRefreshToast = false) => {
    if (!address) return;
    
    if (showRefreshToast) {
      setIsRefreshing(true);
      toast.loading('Refreshing wallet data...');
    } else {
      setFetchingCoins(true);
    }
    
    try {
          // Fetch coins using SuiVision API for better data
          const response = await fetch(
            `https://api.blockvision.org/v2/sui/account/coins?account=${address}`,
            {
              headers: {
                'accept': 'application/json',
                'x-api-key': process.env.NEXT_PUBLIC_SUIVISION_API_KEY || '',
              },
            }
          );
          
          const data = await response.json();
          console.log('SuiVision API response:', data);
          
          if (data.code === 200 && data.result) {
            // Filter out scam tokens and format coins
            const validCoins = data.result.coins
              .filter((coin: any) => !coin.scam && parseFloat(coin.balance) > 0)
              .map((coin: any) => ({
                coinType: coin.coinType,
                name: coin.name || coin.symbol,
                symbol: coin.symbol,
                decimals: coin.decimals,
                balance: (parseFloat(coin.balance) / Math.pow(10, coin.decimals)).toFixed(6),
                rawBalance: coin.balance,
                logo: coin.logo,
                usdValue: coin.usdValue || '0',
                price: coin.price || '0',
                priceChange24h: coin.priceChangePercentage24H || '0',
                verified: coin.verified,
                isLpToken: coin.isLpToken,
              }));
            
            // Fetch price data from Noodles API for each coin
            const coinsWithPrices = await Promise.all(
              validCoins.map(async (coin: any) => {
                try {
                  const priceResponse = await fetch(
                    `https://api.noodles.fi/api/v1/partner/coin-price?coin_id=${encodeURIComponent(coin.coinType)}`,
                    {
                      headers: {
                        'Accept-Encoding': 'application/json',
                        'x-api-key': process.env.NEXT_PUBLIC_NOODLES_API_KEY || '',
                        'x-chain': 'sui',
                      },
                    }
                  );
                  
                  const priceData = await priceResponse.json();
                  console.log(`Noodles price data for ${coin.symbol}:`, priceData);
                  
                  if (priceData.data) {
                    // Calculate USD value using Noodles price
                    const usdValue = parseFloat(coin.balance) * (priceData.data.price || 0);
                    
                    return {
                      ...coin,
                      price: priceData.data.price || coin.price,
                      priceChange24h: priceData.data.price_change_24h !== null ? priceData.data.price_change_24h : coin.priceChange24h,
                      priceChange7d: priceData.data.price_change_7d,
                      priceChange30d: priceData.data.price_change_30d,
                      usdValue: usdValue.toFixed(2),
                    };
                  }
                } catch (error) {
                  console.error(`Failed to fetch Noodles price for ${coin.symbol}:`, error);
                }
                return coin;
              })
            );
            
            setCoins(coinsWithPrices);
            
            // Set SUI balance separately for display
            const suiCoin = coinsWithPrices.find((coin: any) => coin.symbol === 'SUI');
            if (suiCoin) {
              setBalance(suiCoin.balance);
            }
            
            // Calculate total USD value from all coins
            const totalUsd = coinsWithPrices.reduce((sum, coin) => {
              return sum + parseFloat(coin.usdValue || '0');
            }, 0);
            setTotalUsdValue(totalUsd.toFixed(2));
          } else {
            // Fallback to regular SUI client if API fails
            const balanceResult = await suiClient.getBalance({
              owner: address,
            });
            setBalance(formatBalance(balanceResult.totalBalance, 9));
            
            const coinsResult = await suiClient.getAllBalances({
              owner: address,
            });
            
            const formattedCoins = await Promise.all(
              coinsResult.map(async coin => {
                const symbol = coin.coinType === '0x2::sui::SUI' ? 'SUI' : 
                              coin.coinType.split('::').pop() || 'Unknown';
                const formattedBalance = formatBalance(coin.totalBalance, 9);
                
                // Try to fetch price from Noodles API
                let priceData = null;
                try {
                  const priceResponse = await fetch(
                    `https://api.noodles.fi/api/v1/partner/coin-price?coin_id=${encodeURIComponent(coin.coinType)}`,
                    {
                      headers: {
                        'Accept-Encoding': 'application/json',
                        'x-api-key': process.env.NEXT_PUBLIC_NOODLES_API_KEY || '',
                        'x-chain': 'sui',
                      },
                    }
                  );
                  const data = await priceResponse.json();
                  if (data.data) {
                    priceData = data.data;
                  }
                } catch (error) {
                  console.error(`Failed to fetch price for ${symbol}:`, error);
                }
                
                return {
                  coinType: coin.coinType,
                  balance: formattedBalance,
                  symbol,
                  price: priceData?.price || '0',
                  priceChange24h: priceData?.price_change_24h || '0',
                  priceChange7d: priceData?.price_change_7d || '0',
                  priceChange30d: priceData?.price_change_30d || '0',
                  usdValue: priceData?.price ? (parseFloat(formattedBalance) * priceData.price).toFixed(2) : '0',
                };
              })
            );
            
            setCoins(formattedCoins);
            
            // Calculate total USD value
            const totalUsd = formattedCoins.reduce((sum, coin) => {
              return sum + parseFloat(coin.usdValue || '0');
            }, 0);
            setTotalUsdValue(totalUsd.toFixed(2));
          }
          
          // Fetch NFTs using SuiVision API
          setFetchingNfts(true);
          try {
            // Fetch both kiosk and standard NFTs
            const [kioskResponse, standardResponse] = await Promise.all([
              fetch(
                `https://api.blockvision.org/v2/sui/account/nfts?account=${address}&type=kiosk&pageIndex=1&pageSize=50`,
                {
                  headers: {
                    'accept': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_SUIVISION_API_KEY || '',
                  },
                }
              ),
              fetch(
                `https://api.blockvision.org/v2/sui/account/nfts?account=${address}&type=standard&pageIndex=1&pageSize=50`,
                {
                  headers: {
                    'accept': 'application/json',
                    'x-api-key': process.env.NEXT_PUBLIC_SUIVISION_API_KEY || '',
                  },
                }
              )
            ]);
            
            const [kioskData, standardData] = await Promise.all([
              kioskResponse.json(),
              standardResponse.json()
            ]);
            
            console.log('SuiVision Kiosk NFTs:', kioskData);
            console.log('SuiVision Standard NFTs:', standardData);
            
            const allNfts = [];
            
            // Process kiosk NFTs
            if (kioskData.code === 200 && kioskData.result?.data) {
              const kioskNfts = kioskData.result.data
                .filter((nft: any) => !nft.scamFlag)
                .map((nft: any) => ({
                  objectId: nft.objectId,
                  name: nft.name,
                  image: nft.image,
                  description: nft.description,
                  collection: nft.collection,
                  lastPrice: nft.lastPrice,
                  listPrice: nft.listPrice,
                  listed: nft.listed,
                  kioskId: nft.kioskId,
                  rarityRank: nft.rarityRank,
                  type: 'kiosk'
                }));
              allNfts.push(...kioskNfts);
            }
            
            // Process standard NFTs
            if (standardData.code === 200 && standardData.result?.data) {
              const standardNfts = standardData.result.data
                .filter((nft: any) => !nft.scamFlag)
                .map((nft: any) => ({
                  objectId: nft.objectId,
                  name: nft.name,
                  image: nft.image,
                  description: nft.description,
                  collection: nft.collection,
                  lastPrice: nft.lastPrice,
                  listPrice: nft.listPrice,
                  listed: nft.listed,
                  rarityRank: nft.rarityRank,
                  type: 'standard'
                }));
              allNfts.push(...standardNfts);
            }
            
            // If no NFTs from API, try fallback
            if (allNfts.length === 0 && (!kioskData.code || !standardData.code)) {
              // Fallback to basic NFT fetching if API fails
              const objects = await suiClient.getOwnedObjects({
                owner: address,
                options: {
                  showType: true,
                  showContent: true,
                  showDisplay: true,
                }
              });
              
              const nftObjects = objects.data.filter(obj => {
                const type = obj.data?.type || '';
                return !type.includes('::coin::Coin') && 
                       !type.includes('::sui::SUI') &&
                       type !== '0x2::coin::Coin';
              });
              
              setNfts(nftObjects.map(nft => ({
                objectId: nft.data?.objectId,
                name: nft.data?.display?.data?.name || 'Unknown NFT',
                image: nft.data?.display?.data?.image_url,
                description: nft.data?.display?.data?.description,
              })));
            } else {
              setNfts(allNfts);
            }
          } catch (error) {
            console.error('Failed to fetch NFTs:', error);
            setNfts([]);
          } finally {
            setFetchingNfts(false);
          }
    } catch (error) {
      console.error('Failed to fetch wallet data:', error);
      if (showRefreshToast) {
        toast.error('Failed to refresh wallet data');
      }
    } finally {
      setFetchingCoins(false);
      setIsRefreshing(false);
      if (showRefreshToast) {
        toast.dismiss();
        toast.success('Wallet data refreshed!');
      }
    }
  };

  // Fetch data when popup opens
  useEffect(() => {
    if (isOpen && address) {
      fetchWalletData();
    }
  }, [isOpen, address]);

  const handleCopyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSend = async () => {
    if (!recipientAddress || !sendAmount) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!address) {
      toast.error('Wallet not connected');
      return;
    }

    // Validate recipient address
    if (!recipientAddress.startsWith('0x') || recipientAddress.length !== 66) {
      toast.error('Invalid recipient address. Must be a valid SUI address starting with 0x');
      return;
    }

    // Validate amount
    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Invalid amount');
      return;
    }

    setLoading(true);
    const loadingToast = toast.loading('Preparing transaction...');
    
    try {
      // Create transaction
      const tx = new Transaction();
      
      // Convert SUI to MIST (1 SUI = 1,000,000,000 MIST)
      const amountInMist = Math.floor(amount * 1_000_000_000);
      
      // Split coins and transfer
      const [coin] = tx.splitCoins(tx.gas, [amountInMist]);
      tx.transferObjects([coin], recipientAddress);
      
      // Set sender
      tx.setSender(address);

      // Sign and execute transaction using Enoki
      toast.loading('Signing transaction...', { id: loadingToast });
      
      // Get the keypair from Enoki
      const keypair = await enokiFlow.getKeypair({
        network: 'mainnet' as any,
      });

      // Build the transaction
      const txBytes = await tx.build({ client: suiClient });

      // Sign the transaction
      const signature = await keypair.signTransaction(txBytes);

      // Execute the transaction
      toast.loading('Executing transaction on chain...', { id: loadingToast });
      const result = await suiClient.executeTransactionBlock({
        transactionBlock: txBytes,
        signature: signature.signature,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      console.log('Transaction result:', result);
      
      if (result.effects?.status?.status === 'success') {
        toast.dismiss(loadingToast);
        toast.success(
          <div>
            <p className="font-semibold">Transaction successful!</p>
            <p className="text-sm">Sent {sendAmount} SUI</p>
            <p className="text-xs font-mono mt-1">
              Digest: {result.digest.slice(0, 10)}...
            </p>
          </div>,
          { duration: 8000 }
        );
        
        // Clear form and close modal
        setRecipientAddress('');
        setSendAmount('');
        setShowSendModal(false);
        
        // Refresh balance after a short delay
        setTimeout(() => {
          fetchWalletData(false); // Refresh without toast
        }, 1500);
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error: any) {
      console.error('Transaction failed:', error);
      toast.dismiss(loadingToast);
      toast.error(`Transaction failed: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-semibold">My Wallet</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wallet Address */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
              <p className="text-sm font-mono truncate">
                {address ? `${address.slice(0, 8)}...${address.slice(-6)}` : 'Not connected'}
              </p>
            </div>
            <button
              onClick={handleCopyAddress}
              className="p-2 hover:bg-white rounded-lg transition-colors"
              title="Copy address"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Balance Display */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 relative">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Balance</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-gray-900">{balance}</span>
                <span className="text-lg text-gray-600">SUI</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">
                ≈ ${totalUsdValue} USD
              </p>
            </div>
            <button
              onClick={() => fetchWalletData(true)}
              disabled={isRefreshing}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
              title="Refresh balance"
            >
              <RefreshCw 
                className={`w-4 h-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-2 p-1 bg-gray-100">
            <TabsTrigger value="assets" className="flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Assets
            </TabsTrigger>
            <TabsTrigger value="nfts" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              NFTs
            </TabsTrigger>
          </TabsList>

          {/* Assets Tab */}
          <TabsContent value="assets" className="p-6 space-y-4">
            <div className="space-y-3">
              {fetchingCoins ? (
                <div className="text-center py-4">
                  <p className="text-gray-500">Loading assets...</p>
                </div>
              ) : coins.length > 0 ? (
                <>
                  {/* Display all coins */}
                  {coins.map((coin, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        {coin.logo ? (
                          <img 
                            src={coin.logo} 
                            alt={coin.symbol}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="40" height="40"%3E%3Crect width="40" height="40" fill="%23e0e7ff" rx="20"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%234338ca" font-size="16" font-weight="bold"%3E' + coin.symbol.charAt(0) + '%3C/text%3E%3C/svg%3E';
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-bold">
                              {coin.symbol.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{coin.symbol}</p>
                            {coin.verified && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                                ✓
                              </span>
                            )}
                            {coin.isLpToken && (
                              <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">
                                LP
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            {coin.name || 'Unknown Token'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{coin.balance} {coin.symbol}</p>
                        <div className="flex items-center justify-end gap-2">
                          <p className="text-sm text-gray-600">
                            ${parseFloat(coin.usdValue || '0').toFixed(2)}
                          </p>
                          {coin.priceChange24h && (
                            <span className={`text-xs ${parseFloat(coin.priceChange24h) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {parseFloat(coin.priceChange24h) >= 0 ? '↑' : '↓'}
                              {Math.abs(parseFloat(coin.priceChange24h)).toFixed(2)}%
                            </span>
                          )}
                        </div>
                        {coin.price && parseFloat(coin.price) > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            ${parseFloat(coin.price).toFixed(8)}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No assets found</p>
                  <p className="text-sm text-gray-400 mt-1">Your tokens will appear here</p>
                </div>
              )}

              {/* Send Button - only show if there are coins */}
              {coins.length > 0 && (
                <Button
                  onClick={() => setShowSendModal(true)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Send Assets
                </Button>
              )}
            </div>
          </TabsContent>

          {/* NFTs Tab */}
          <TabsContent value="nfts" className="p-6">
            {fetchingNfts ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading NFTs...</p>
              </div>
            ) : nfts.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {nfts.map((nft, index) => (
                  <div key={nft.objectId || index} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
                    <div className="w-full aspect-square bg-gray-100 relative">
                      {nft.image ? (
                        <img 
                          src={nft.image} 
                          alt={nft.name || 'NFT'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="14"%3ENFT%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Image className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                      {nft.listed && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
                          Listed
                        </div>
                      )}
                      {nft.rarityRank > 0 && (
                        <div className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">
                          #{nft.rarityRank}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm truncate" title={nft.name}>
                        {nft.name || 'Unknown NFT'}
                      </p>
                      {nft.description && (
                        <p className="text-xs text-gray-500 truncate mt-1" title={nft.description}>
                          {nft.description}
                        </p>
                      )}
                      {(nft.listPrice > 0 || nft.lastPrice) && (
                        <div className="mt-2 pt-2 border-t">
                          {nft.listPrice > 0 && (
                            <p className="text-xs text-green-600">
                              Listed: {(nft.listPrice / 1e9).toFixed(2)} SUI
                            </p>
                          )}
                          {nft.lastPrice && (
                            <p className="text-xs text-gray-600">
                              Last: {nft.lastPrice} SUI
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-medium">No NFTs yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Your NFT collection will appear here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Send Modal */}
      <Dialog open={showSendModal} onOpenChange={setShowSendModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Send SUI</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Recipient Address
              </label>
              <Input
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Amount
              </label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="0.00"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSendAmount(balance)}
                    className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                  >
                    MAX
                  </button>
                  <span className="text-gray-500">
                    SUI
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available: {balance} SUI
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowSendModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSend}
                disabled={loading}
                className="flex-1"
              >
                {loading ? 'Sending...' : 'Send'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}