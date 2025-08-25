import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { QRCodeCanvas } from 'qrcode.react';
import { 
  Copy, 
  ExternalLink, 
  CheckCircle, 
  XCircle, 
  Loader2,
  Wallet,
  ArrowRight
} from 'lucide-react';
import { USDC_CONTRACT, TREASURY_WALLET, sonic } from '@/config/wallet';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  serviceData: {
    service: string;
    details: any;
    amount: string;
    usdcAmount: string;
  } | null;
  onPaymentSuccess: (txHash: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  serviceData,
  onPaymentSuccess
}) => {
  const [step, setStep] = useState<'confirm' | 'processing' | 'success' | 'error'>('confirm');
  const [txHash, setTxHash] = useState<string>('');
  
  const { address, isConnected } = useAccount();
  const { writeContract, isPending: isWritePending, error: writeError } = useWriteContract();
  
  const { 
    isLoading: isTxLoading, 
    isSuccess: isTxSuccess, 
    isError: isTxError,
    data: receipt
  } = useWaitForTransactionReceipt({
    hash: txHash as `0x${string}`,
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setTxHash('');
    }
  }, [isOpen]);

  // Handle transaction state changes
  useEffect(() => {
    if (isWritePending || isTxLoading) {
      setStep('processing');
    } else if (isTxSuccess && receipt) {
      setStep('success');
      onPaymentSuccess(txHash);
    } else if (isTxError || writeError) {
      setStep('error');
    }
  }, [isWritePending, isTxLoading, isTxSuccess, isTxError, writeError, receipt, txHash, onPaymentSuccess]);

  const handlePayment = async () => {
    if (!serviceData || !isConnected) return;

    try {
      const usdcAmount = parseUnits(serviceData.usdcAmount, 6);
      
      writeContract({
        address: USDC_CONTRACT.address,
        abi: USDC_CONTRACT.abi,
        functionName: 'transfer',
        args: [TREASURY_WALLET, usdcAmount],
        chain: sonic,
        account: address,
      }, {
        onSuccess: (hash) => {
          setTxHash(hash);
          toast({
            title: "Transaction Sent",
            description: "Your payment is being processed...",
          });
        },
        onError: (error) => {
          console.error('Transaction error:', error);
          toast({
            title: "Payment Failed",
            description: error.message || "Failed to send transaction",
            variant: "destructive",
          });
        }
      });
    } catch (error) {
      console.error('Payment error:', error);
      setStep('error');
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Address copied to clipboard",
      });
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const getStepContent = () => {
    if (!serviceData) return null;

    switch (step) {
      case 'confirm':
        return (
          <div className="space-y-6">
            {/* Service Summary */}
            <Card className="glass-card border-0">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-lg capitalize">{serviceData.service}</h4>
                    <p className="text-muted-foreground text-sm">Service Purchase</p>
                  </div>
                  <Badge className="bg-gradient-primary">
                    Web3 Payment
                  </Badge>
                </div>
                
                <div className="space-y-2 text-sm">
                  {Object.entries(serviceData.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-muted-foreground capitalize">{key}:</span>
                      <span className="font-medium">{value as string}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Details */}
            <Card className="glass-card border-0">
              <CardContent className="p-4">
                <div className="text-center space-y-4">
                  <div>
                    <div className="text-3xl font-bold gradient-text">
                      {serviceData.usdcAmount} USDC
                    </div>
                    <div className="text-muted-foreground">
                      ≈ ₦{serviceData.amount}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Send to Treasury:</p>
                    <div className="flex items-center gap-2 p-2 glass rounded-lg">
                      <code className="text-xs font-mono flex-1 truncate">
                        {TREASURY_WALLET}
                      </code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(TREASURY_WALLET)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-lg">
                      <QRCodeCanvas
                        value={`ethereum:${TREASURY_WALLET}?amount=${serviceData.usdcAmount}&token=${USDC_CONTRACT.address}`}
                        size={150}
                        level="M"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 glass border-border/50"
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePayment}
                disabled={!isConnected}
                className="flex-1 bg-gradient-primary hover:glow-primary font-semibold"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Pay with Wallet
              </Button>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="relative">
                <Loader2 className="w-16 h-16 text-primary animate-spin" />
                <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold mb-2">Processing Payment</h3>
              <p className="text-muted-foreground">
                {isWritePending ? 'Confirming transaction...' : 'Waiting for blockchain confirmation...'}
              </p>
              
              {txHash && (
                <div className="mt-4 p-3 glass rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Transaction Hash:</p>
                  <div className="flex items-center justify-center gap-2">
                    <code className="text-xs font-mono">
                      {txHash.slice(0, 10)}...{txHash.slice(-8)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                    >
                      <a 
                        href={`https://sonicscan.org/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <div className="relative">
                <CheckCircle className="w-16 h-16 text-green-500" />
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-green-400 mb-2">
                Payment Successful!
              </h3>
              <p className="text-muted-foreground mb-4">
                Your {serviceData.service} purchase is being processed
              </p>
              
              {txHash && (
                <div className="p-3 glass rounded-lg mb-4">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <span>Transaction:</span>
                    <code className="font-mono">
                      {txHash.slice(0, 8)}...{txHash.slice(-6)}
                    </code>
                    <Button
                      size="sm"
                      variant="ghost"
                      asChild
                    >
                      <a 
                        href={`https://sonicscan.org/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button 
              onClick={onClose}
              className="w-full bg-gradient-primary hover:glow-primary"
            >
              Done
            </Button>
          </div>
        );

      case 'error':
        return (
          <div className="text-center space-y-6 py-8">
            <div className="flex justify-center">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-red-400 mb-2">
                Payment Failed
              </h3>
              <p className="text-muted-foreground">
                {writeError?.message || 'Transaction failed. Please try again.'}
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={onClose}
                className="flex-1 glass border-border/50"
              >
                Cancel
              </Button>
              <Button 
                onClick={() => setStep('confirm')}
                className="flex-1 bg-gradient-primary hover:glow-primary"
              >
                Try Again
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <Dialog open={isOpen} onOpenChange={onClose}>
          <DialogContent className="glass-card border-0 max-w-md">
            <DialogHeader>
              <DialogTitle className="gradient-text text-center">
                {step === 'confirm' && 'Confirm Payment'}
                {step === 'processing' && 'Processing...'}
                {step === 'success' && 'Success!'}
                {step === 'error' && 'Payment Failed'}
              </DialogTitle>
            </DialogHeader>
            
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {getStepContent()}
            </motion.div>
          </DialogContent>
        </Dialog>
      )}
    </AnimatePresence>
  );
};

export default PaymentModal;