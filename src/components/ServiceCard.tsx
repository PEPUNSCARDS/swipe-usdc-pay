import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Wifi, Tv, Zap, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: {
    id: string;
    name: string;
    icon: any;
    description: string;
    fields: string[];
  };
  onSubmit: (serviceId: string, data: any) => void;
  usdcRate: number | null;
  className?: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ 
  service, 
  onSubmit, 
  usdcRate, 
  className 
}) => {
  const [formData, setFormData] = useState<{ [key: string]: string }>({});
  const [networks, setNetworks] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const IconComponent = service.icon;

  // Load networks/providers on mount
  useEffect(() => {
    loadServiceData();
  }, [service.id]);

  const loadServiceData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/${service.id}/networks`);
      const data = await response.json();
      setNetworks(data.networks || data.providers || data.plans || []);
    } catch (error) {
      console.error('Failed to load service data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadPlans = async (networkId: string) => {
    if (service.id === 'data') {
      try {
        const response = await fetch(`/api/data/plans?network=${networkId}`);
        const data = await response.json();
        setPlans(data.plans || []);
      } catch (error) {
        console.error('Failed to load plans:', error);
      }
    } else if (service.id === 'cable') {
      try {
        const response = await fetch(`/api/cable/plans?provider=${networkId}`);
        const data = await response.json();
        setPlans(data.plans || []);
      } catch (error) {
        console.error('Failed to load plans:', error);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Load plans when network/provider changes
    if ((field === 'network' || field === 'provider') && value) {
      loadPlans(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = service.fields.filter(field => field !== 'plan');
    const isValid = requiredFields.every(field => formData[field]?.trim());
    
    if (!isValid) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit(service.id, formData);
  };

  const calculateUSDC = (nairaAmount: string) => {
    if (!nairaAmount || !usdcRate) return '0.00';
    const amount = parseFloat(nairaAmount);
    return (amount / usdcRate).toFixed(4);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn("h-full", className)}
    >
      <Card className="glass-card border-0 h-full flex flex-col">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto mb-4 p-4 rounded-full bg-gradient-primary w-16 h-16 flex items-center justify-center animate-pulse-glow">
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="gradient-text text-2xl font-bold">
            {service.name}
          </CardTitle>
          <p className="text-muted-foreground text-sm">
            {service.description}
          </p>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <form onSubmit={handleSubmit} className="space-y-4 flex-1">
            {service.fields.includes('network') && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Network *
                </label>
                <Select 
                  value={formData.network || ''} 
                  onValueChange={(value) => handleInputChange('network', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="glass border-border/50 focus:border-primary">
                    <SelectValue placeholder="Select network" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((network) => (
                      <SelectItem key={network.code || network.id} value={network.code || network.id}>
                        <div className="flex items-center gap-2">
                          <span>{network.name}</span>
                          {network.status && (
                            <Badge variant={network.status === 'active' ? 'default' : 'secondary'}>
                              {network.status}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {service.fields.includes('provider') && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Provider *
                </label>
                <Select 
                  value={formData.provider || ''} 
                  onValueChange={(value) => handleInputChange('provider', value)}
                  disabled={loading}
                >
                  <SelectTrigger className="glass border-border/50 focus:border-primary">
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {networks.map((provider) => (
                      <SelectItem key={provider.code || provider.id} value={provider.code || provider.id}>
                        {provider.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {service.fields.includes('plan') && plans.length > 0 && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Plan *
                </label>
                <Select 
                  value={formData.plan || ''} 
                  onValueChange={(value) => handleInputChange('plan', value)}
                >
                  <SelectTrigger className="glass border-border/50 focus:border-primary">
                    <SelectValue placeholder="Select plan" />
                  </SelectTrigger>
                  <SelectContent>
                    {plans.map((plan) => (
                      <SelectItem key={plan.code || plan.id} value={plan.code || plan.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{plan.name}</span>
                          {plan.amount && (
                            <Badge variant="outline" className="ml-2">
                              ₦{plan.amount}
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {service.fields.includes('phone') && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  placeholder="e.g. 08012345678"
                  value={formData.phone || ''}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="glass border-border/50 focus:border-primary"
                />
              </div>
            )}

            {service.fields.includes('iuc') && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  IUC/Smart Card Number *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 1234567890"
                  value={formData.iuc || ''}
                  onChange={(e) => handleInputChange('iuc', e.target.value)}
                  className="glass border-border/50 focus:border-primary"
                />
              </div>
            )}

            {service.fields.includes('meter') && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Meter Number *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. 45145984782"
                  value={formData.meter || ''}
                  onChange={(e) => handleInputChange('meter', e.target.value)}
                  className="glass border-border/50 focus:border-primary"
                />
              </div>
            )}

            {service.fields.includes('type') && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Meter Type *
                </label>
                <Select 
                  value={formData.type || ''} 
                  onValueChange={(value) => handleInputChange('type', value)}
                >
                  <SelectTrigger className="glass border-border/50 focus:border-primary">
                    <SelectValue placeholder="Select meter type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="prepaid">Prepaid</SelectItem>
                    <SelectItem value="postpaid">Postpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {service.fields.includes('amount') && (
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Amount (₦) *
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="e.g. 1000"
                    min="100"
                    value={formData.amount || ''}
                    onChange={(e) => handleInputChange('amount', e.target.value)}
                    className="glass border-border/50 focus:border-primary pr-16"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
                {formData.amount && usdcRate && (
                  <div className="mt-2 p-2 glass rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">USDC Equivalent:</span>
                      <span className="text-accent font-semibold">
                        {calculateUSDC(formData.amount)} USDC
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex-1 flex items-end">
              <Button 
                type="submit" 
                className="w-full mt-6 bg-gradient-primary hover:glow-primary transition-all duration-300 font-semibold text-lg py-6"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Loading...
                  </div>
                ) : (
                  <>
                    Pay with USDC
                    {formData.amount && usdcRate && (
                      <span className="ml-2 opacity-80">
                        ({calculateUSDC(formData.amount)})
                      </span>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ServiceCard;