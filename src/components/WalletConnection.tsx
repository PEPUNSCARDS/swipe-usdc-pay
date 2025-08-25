import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';

const WalletConnection: React.FC = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <motion.button
                    onClick={openConnectModal}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="glass-card px-6 py-3 rounded-full bg-gradient-primary hover:glow-primary transition-all duration-300 flex items-center gap-2 font-semibold text-white"
                  >
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </motion.button>
                );
              }

              if (chain.unsupported) {
                return (
                  <motion.button
                    onClick={openChainModal}
                    whileHover={{ scale: 1.05 }}
                    className="glass-card px-4 py-2 rounded-full bg-destructive/20 border border-destructive/50 text-destructive font-medium"
                  >
                    Wrong network
                  </motion.button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={openChainModal}
                    whileHover={{ scale: 1.05 }}
                    className="glass-card px-3 py-2 rounded-full border-border/50 flex items-center gap-2 text-sm font-medium hover:border-primary/50 transition-colors"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 20,
                          height: 20,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 20, height: 20 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </motion.button>

                  <motion.button
                    onClick={openAccountModal}
                    whileHover={{ scale: 1.05 }}
                    className="glass-card px-4 py-2 rounded-full bg-gradient-primary hover:glow-primary transition-all duration-300 font-medium text-white"
                  >
                    {account.displayName}
                    {account.displayBalance
                      ? ` (${account.displayBalance})`
                      : ''}
                  </motion.button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletConnection;