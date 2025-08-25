import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCreative } from 'swiper/modules';
import { useAccount } from 'wagmi';
import { Smartphone, Wifi, Tv, Zap, Sparkles, Globe } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

import ServiceCard from '@/components/ServiceCard';
import PaymentModal from '@/components/PaymentModal';
import WalletConnection from '@/components/WalletConnection';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-creative';

const services = [
  {
    id: 'airtime',
    name: 'Airtime',
    description: 'Top up your mobile credit instantly with USDC',
    icon: Smartphone,
    fields: ['network', 'phone', 'amount']
  },
  {
    id: 'data',
    name: 'Data Plans',
    description: 'Buy data bundles for all major networks',
    icon: Wifi,
    fields: ['network', 'plan', 'phone']
  },
  {
    id: 'cable',
    name: 'Cable TV',
    description: 'Renew your TV subscriptions seamlessly',
    icon: Tv,
    fields: ['provider', 'iuc', 'plan', 'phone']
  },
  {
    id: 'electricity',
    name: 'Electricity',
    description: 'Pay your electricity bills with crypto',
    icon: Zap,
    fields: ['meter', 'plan', 'amount', 'type', 'phone']
  }
];

const Index: React.FC = () => {
  const [usdcRate, setUsdcRate] = useState<number | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isConnected } = useAccount();

  // Fetch USDC to NGN rate
  useEffect(() => {
    const fetchRate = async () => {
      try {
        const response = await fetch('/api/price');
        const data = await response.json();
        setUsdcRate(data.usdcToNgn);
      } catch (error) {
        console.error('Failed to fetch USDC rate:', error);
        toast({
          title: "Rate Fetch Failed",
          description: "Unable to get current USDC rates",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchRate();
    // Refresh rate every 5 minutes
    const interval = setInterval(fetchRate, 300000);
    return () => clearInterval(interval);
  }, []);

  const handleServiceSubmit = async (serviceId: string, formData: any) => {
    if (!usdcRate) {
      toast({
        title: "Rate Not Available",
        description: "Please wait for exchange rate to load",
        variant: "destructive",
      });
      return;
    }

    if (!isConnected) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to continue",
        variant: "destructive",
      });
      return;
    }

    const amount = formData.amount || '1000';
    const usdcAmount = (parseFloat(amount) / usdcRate).toFixed(4);

    setCurrentPayment({
      service: serviceId,
      details: formData,
      amount,
      usdcAmount
    });
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (txHash: string) => {
    if (!currentPayment) return;

    try {
      // Call the purchase API to process with Peyflex
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: currentPayment.service,
          details: currentPayment.details,
          txHash,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Purchase Successful!",
          description: `Your ${currentPayment.service} has been processed successfully.`,
        });
      } else {
        toast({
          title: "Service Error",
          description: result.error || "Service purchase failed after payment",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Purchase processing error:', error);
      toast({
        title: "Processing Error",
        description: "Payment confirmed but service processing failed",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading Strills...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-bg opacity-90" />
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 flex justify-between items-center p-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Strills</h1>
            <p className="text-xs text-muted-foreground">Web3 Payments Platform</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <WalletConnection />
        </motion.div>
      </header>

      {/* Rate Display */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 text-center mb-8"
      >
        <div className="glass-card inline-flex items-center gap-2 px-4 py-2 rounded-full">
          <Globe className="w-4 h-4 text-primary" />
          <span className="text-sm">
            1 USDC = ₦{usdcRate?.toFixed(2) || '---'}
          </span>
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        </div>
      </motion.div>

      {/* Main Content */}
      <main className="relative z-10 px-6 pb-6">
        <div className="max-w-md mx-auto">
          {/* Welcome Text */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <h2 className="text-3xl font-bold mb-2 gradient-text">
              Pay Bills with Crypto
            </h2>
            <p className="text-muted-foreground">
              Swipe to explore services. Pay with USDC on Sonic Network.
            </p>
          </motion.div>

          {/* Services Swiper */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="h-[500px]"
          >
            <Swiper
              modules={[Navigation, Pagination, EffectCreative]}
              spaceBetween={20}
              slidesPerView={1}
              navigation
              pagination={{ 
                clickable: true,
                dynamicBullets: true 
              }}
              effect="creative"
              creativeEffect={{
                prev: {
                  shadow: true,
                  translate: ['-120%', 0, -500],
                  rotate: [0, 0, -45],
                },
                next: {
                  translate: ['120%', 0, -500],
                  rotate: [0, 0, 45],
                },
              }}
              className="h-full"
            >
              {services.map((service, index) => (
                <SwiperSlide key={service.id}>
                  <ServiceCard
                    service={service}
                    onSubmit={handleServiceSubmit}
                    usdcRate={usdcRate}
                    className="h-full"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </motion.div>

          {/* Features */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-12 grid grid-cols-2 gap-4 text-center"
          >
            <div className="glass-card p-4 rounded-xl">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-2">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-sm mb-1">Instant</h4>
              <p className="text-xs text-muted-foreground">Lightning fast payments</p>
            </div>
            <div className="glass-card p-4 rounded-xl">
              <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center mx-auto mb-2">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-semibold text-sm mb-1">Decentralized</h4>
              <p className="text-xs text-muted-foreground">No middleman needed</p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        serviceData={currentPayment}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};

export default Index;