
import React from 'react';
import { Wallet, Coffee, Gift, AlertCircle, CheckCircle2 } from 'lucide-react';
import RewardCard from './RewardCard';

interface Reward {
  id: string;
  name: string;
  pointsRequired: number;
  description?: string;
  icon?: string;
}

interface MyRewardsPageProps {
  coffeeCoinBalance: string | null;
  walletAddress: string | null;
  rewards: Reward[];
  statusMessage: string | null;
  error: string | null;
  onRedeemClick: (rewardId: string) => void;
  onLinkEmail?: () => void;
}

const MyRewardsPage: React.FC<MyRewardsPageProps> = ({
  coffeeCoinBalance,
  walletAddress,
  rewards,
  statusMessage,
  error,
  onRedeemClick,
  onLinkEmail
}) => {
  const balance = coffeeCoinBalance ? parseInt(coffeeCoinBalance) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-900 to-orange-800 text-cream shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Coffee className="w-8 h-8 text-yellow-300" />
              <h1 className="text-4xl font-bold text-cream">CoffeeDelight Rewards</h1>
              <Coffee className="w-8 h-8 text-yellow-300" />
            </div>
            <p className="text-amber-100 text-lg">Your coffee journey rewards await!</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Status Messages */}
        {(statusMessage || error) && (
          <div className="mb-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 text-red-800">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <span>{error}</span>
              </div>
            )}
            {statusMessage && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3 text-green-800">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span>{statusMessage}</span>
              </div>
            )}
          </div>
        )}

        {/* Balance and Wallet Info */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* CoffeeCoins Balance */}
          <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-6 transform hover:scale-105 transition-transform duration-200">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl font-bold text-amber-900">C</span>
              </div>
              <h2 className="text-2xl font-semibold text-amber-900 mb-2">Your CoffeeCoins</h2>
              <div className="text-4xl font-bold text-amber-800 mb-2">
                {balance} <span className="text-lg text-amber-600">CFC</span>
              </div>
              <p className="text-amber-700">Keep brewing to earn more!</p>
            </div>
          </div>

          {/* Wallet Address */}
          <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Wallet className="w-6 h-6 text-amber-700" />
              <h3 className="text-xl font-semibold text-amber-900">Your Loyalty Wallet</h3>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
              <p className="text-sm text-amber-700 mb-2">Wallet Address:</p>
              <code className="text-amber-800 font-mono text-sm break-all bg-white px-3 py-2 rounded border">
                {walletAddress || 'Not connected'}
              </code>
            </div>
            <p className="text-xs text-amber-600 mt-3">
              Your rewards are securely stored on the Sepolia network
            </p>
          </div>
        </div>

        {/* Link Email Button (if needed) */}
        {onLinkEmail && (
          <div className="mb-8 text-center">
            <button
              onClick={onLinkEmail}
              className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-6 py-3 rounded-lg border border-amber-300 transition-colors duration-200"
            >
              Link Email Address
            </button>
          </div>
        )}

        {/* Rewards Catalog */}
        <div className="bg-white rounded-xl shadow-lg border border-amber-100 p-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gift className="w-7 h-7 text-amber-700" />
              <h2 className="text-3xl font-bold text-amber-900">Treat Yourself!</h2>
              <Gift className="w-7 h-7 text-amber-700" />
            </div>
            <p className="text-amber-700 text-lg">Redeem your CoffeeCoins for delicious rewards</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => (
              <RewardCard
                key={reward.id}
                reward={reward}
                userBalance={balance}
                onRedeemClick={onRedeemClick}
              />
            ))}
          </div>

          {rewards.length === 0 && (
            <div className="text-center py-12">
              <Coffee className="w-16 h-16 text-amber-300 mx-auto mb-4" />
              <p className="text-amber-600 text-lg">No rewards available at the moment.</p>
              <p className="text-amber-500">Check back soon for new treats!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyRewardsPage;
