import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardLayout } from '@/components/common/DashboardLayout';
import { SlideIn } from '@/components/animations/Transitions';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Settings, Save, AlertCircle, Info } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface LateFineConfig {
  enabled: boolean;
  perDayAmount: number;
  maxCap: number;
  graceDays: number;
}

const defaultConfig: LateFineConfig = {
  enabled: true,
  perDayAmount: 50,
  maxCap: 500,
  graceDays: 7,
};

export default function LateFineSettings() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [config, setConfig] = useState<LateFineConfig>(defaultConfig);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['late-fine-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('fee_settings')
        .select('*')
        .eq('setting_key', 'late_fine_config')
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (settings?.setting_value) {
      const value = settings.setting_value as unknown as LateFineConfig;
      setConfig({
        enabled: value.enabled ?? defaultConfig.enabled,
        perDayAmount: value.perDayAmount ?? defaultConfig.perDayAmount,
        maxCap: value.maxCap ?? defaultConfig.maxCap,
        graceDays: value.graceDays ?? defaultConfig.graceDays,
      });
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: async (newConfig: LateFineConfig) => {
      const { data: existing } = await supabase
        .from('fee_settings')
        .select('id')
        .eq('setting_key', 'late_fine_config')
        .maybeSingle();

      const settingValue = {
        enabled: newConfig.enabled,
        perDayAmount: newConfig.perDayAmount,
        maxCap: newConfig.maxCap,
        graceDays: newConfig.graceDays,
      };

      if (existing) {
        const { error } = await supabase
          .from('fee_settings')
          .update({
            setting_value: settingValue,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('fee_settings')
          .insert([{
            setting_key: 'late_fine_config',
            setting_value: settingValue,
            description: 'Late fine configuration for fee invoices',
          }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['late-fine-settings'] });
      toast.success('Late fine settings saved successfully!');
    },
    onError: (error) => {
      toast.error('Failed to save settings: ' + error.message);
    },
  });

  const handleSave = () => {
    if (config.perDayAmount < 0 || config.maxCap < 0 || config.graceDays < 0) {
      toast.error('Values cannot be negative');
      return;
    }
    if (config.perDayAmount > config.maxCap) {
      toast.error('Per-day amount cannot exceed maximum cap');
      return;
    }
    saveMutation.mutate(config);
  };

  const calculateExample = () => {
    if (!config.enabled) return 'Late fine is disabled';
    const daysLate = 15;
    const effectiveDays = Math.max(0, daysLate - config.graceDays);
    const calculatedFine = effectiveDays * config.perDayAmount;
    const actualFine = Math.min(calculatedFine, config.maxCap);
    return `For ${daysLate} days overdue: ${config.graceDays} grace days = ${effectiveDays} chargeable days × Rs. ${config.perDayAmount} = Rs. ${calculatedFine} → Capped at Rs. ${actualFine}`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-2xl">
        <SlideIn>
          <div className="page-header">
            <div>
              <h1 className="page-title flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Late Fine Settings
              </h1>
              <p className="page-subtitle">
                Configure automatic late fine calculation for overdue fee invoices
              </p>
            </div>
          </div>
        </SlideIn>

        <SlideIn delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle>Late Fine Configuration</CardTitle>
              <CardDescription>
                Set the rules for calculating late fines on overdue invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Enable/Disable Toggle */}
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div className="space-y-0.5">
                  <Label htmlFor="enabled" className="text-base font-medium">
                    Enable Late Fine
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically apply late fines to overdue invoices
                  </p>
                </div>
                <Switch
                  id="enabled"
                  checked={config.enabled}
                  onCheckedChange={(checked) => setConfig({ ...config, enabled: checked })}
                />
              </div>

              <div className={!config.enabled ? 'opacity-50 pointer-events-none' : ''}>
                {/* Grace Days */}
                <div className="space-y-2">
                  <Label htmlFor="graceDays">Grace Period (Days)</Label>
                  <Input
                    id="graceDays"
                    type="number"
                    min="0"
                    max="30"
                    value={config.graceDays}
                    onChange={(e) => setConfig({ ...config, graceDays: parseInt(e.target.value) || 0 })}
                    className="max-w-[200px]"
                  />
                  <p className="text-sm text-muted-foreground">
                    Number of days after due date before late fine starts applying
                  </p>
                </div>

                {/* Per Day Amount */}
                <div className="space-y-2 mt-4">
                  <Label htmlFor="perDayAmount">Per-Day Fine Amount (PKR)</Label>
                  <div className="relative max-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rs.</span>
                    <Input
                      id="perDayAmount"
                      type="number"
                      min="0"
                      step="10"
                      value={config.perDayAmount}
                      onChange={(e) => setConfig({ ...config, perDayAmount: parseInt(e.target.value) || 0 })}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Fine charged for each day after grace period
                  </p>
                </div>

                {/* Maximum Cap */}
                <div className="space-y-2 mt-4">
                  <Label htmlFor="maxCap">Maximum Fine Cap (PKR)</Label>
                  <div className="relative max-w-[200px]">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rs.</span>
                    <Input
                      id="maxCap"
                      type="number"
                      min="0"
                      step="100"
                      value={config.maxCap}
                      onChange={(e) => setConfig({ ...config, maxCap: parseInt(e.target.value) || 0 })}
                      className="pl-10"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Maximum total late fine regardless of days overdue
                  </p>
                </div>
              </div>

              {/* Example Calculation */}
              <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                <div className="flex gap-2">
                  <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-info">Example Calculation</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {calculateExample()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                <div className="flex gap-2">
                  <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-warning">Important Note</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Changes will apply to newly generated invoices. Existing invoices will not be recalculated automatically.
                    </p>
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="flex justify-end pt-4">
                <Button 
                  onClick={handleSave} 
                  disabled={saveMutation.isPending}
                  className="min-w-[120px]"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {saveMutation.isPending ? 'Saving...' : 'Save Settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </SlideIn>
      </div>
    </DashboardLayout>
  );
}
