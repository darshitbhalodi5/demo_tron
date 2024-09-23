import { NextApiRequest, NextApiResponse } from 'next';
import { tokens } from '../../config/tokenConfig';
import { ethers } from 'ethers';

// Function to fetch token price in USD
async function getTokenPrice(tokenSymbol: string): Promise<number> {
  try {
    // Replace with an actual price feed API for BTTC Donau testnet tokens
    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbol.toLowerCase()}&vs_currencies=usd`);
    const data = await response.json();
    return data[tokenSymbol.toLowerCase()].usd;
  } catch (error) {
    console.error(`Error fetching price for ${tokenSymbol}:`, error);
    return 0; // Return 0 if unable to fetch price
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: 'Address is required' });
  }

  const apiKey = process.env.BTTC_API_KEY;

  try {
    const tokenPromises = tokens.map(async (token) => {
      const balanceResponse = await fetch(`https://api.bttcscan.com/api?module=account&action=tokenbalance&contractaddress=${token.contractAddress}&address=${address}&tag=latest&apikey=${apiKey}`);
      const balanceData = await balanceResponse.json();
      const rawBalance = balanceData.result;
      const formattedBalance = ethers.formatUnits(rawBalance, token.decimals);
      
      // Fetch token price in USD
      const priceUSD = await getTokenPrice(token.symbol);
      
      // Calculate USD value
      const balanceUSD = parseFloat(formattedBalance) * priceUSD;

      return {
        ...token,
        balance: formattedBalance,
        rawBalance: rawBalance,
        priceUSD: priceUSD,
        balanceUSD: balanceUSD.toFixed(10)
      };
    });

    const tokenBalances = await Promise.all(tokenPromises);

    return res.status(200).json(tokenBalances);
  } catch (error) {
    console.error("Error fetching tokens:", error);
    return res.status(500).json({ error: 'Failed to fetch tokens' });
  }
}