'use client';

import { useState, FormEvent } from 'react';
import { Activity, DollarSign } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import Button from '@/components/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import { scoreMLModel } from '@/lib/api';
import { MLScoreRequest, ServiceStatus } from '@/types';

export default function MLPage() {
  const [status, setStatus] = useState<ServiceStatus>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [prediction, setPrediction] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    Area: 1500,
    Bedrooms: 3,
    Property_Type: 'House',
    City: 'Phoenix',
    Distance_to_City_Center: 5,
    Age_of_House: 10,
    Floors: 1,
    Condition: 'Good',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: e.target.type === 'number' ? Number(value) : value,
    }));
  };

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    setPrediction(null);

    const requestData: MLScoreRequest = {
      data: {
        Area: formData.Area,
        Bedrooms: formData.Bedrooms,
        Property_Type: formData.Property_Type,
        City: formData.City,
        "Distance_to_City_Center (km)": formData.Distance_to_City_Center,
        "Age_of_House (years)": formData.Age_of_House,
        "Floors/Stories": formData.Floors,
        Condition: formData.Condition,
      }
    };

    try {
      const response = await scoreMLModel(requestData);
      
      const resultData = response.result.Results.WebServiceOutput0[0];
      if (resultData && typeof resultData["Scored Labels"] !== 'undefined') {
        setPrediction(resultData["Scored Labels"]);
        setStatus('success');
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong');
      setStatus('error');
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="rounded-full bg-rose-500/10 p-3">
          <Activity className="h-6 w-6 text-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Real Estate Price Prediction</h1>
          <p className="text-muted text-sm">Predict property prices using our machine learning model.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section */}
        <GlassCard className="lg:col-span-2 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Area (sq ft)</label>
                <input
                  type="number"
                  name="Area"
                  value={formData.Area}
                  onChange={handleInputChange}
                  className="w-full rounded-xl bg-surface border border-card-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Bedrooms</label>
                <input
                  type="number"
                  name="Bedrooms"
                  value={formData.Bedrooms}
                  onChange={handleInputChange}
                  className="w-full rounded-xl bg-surface border border-card-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Property Type</label>
                <select
                  name="Property_Type"
                  value={formData.Property_Type}
                  onChange={handleInputChange}
                  className="w-full rounded-xl bg-surface border border-card-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all appearance-none"
                >
                  <option value="House">House</option>
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Condo">Condo</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">City</label>
                <input
                  type="text"
                  name="City"
                  value={formData.City}
                  onChange={handleInputChange}
                  className="w-full rounded-xl bg-surface border border-card-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Distance to City Center (km)</label>
                <input
                  type="number"
                  name="Distance_to_City_Center"
                  value={formData.Distance_to_City_Center}
                  onChange={handleInputChange}
                  className="w-full rounded-xl bg-surface border border-card-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  step="0.1"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Age of House (years)</label>
                <input
                  type="number"
                  name="Age_of_House"
                  value={formData.Age_of_House}
                  onChange={handleInputChange}
                  className="w-full rounded-xl bg-surface border border-card-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Floors / Stories</label>
                <input
                  type="number"
                  name="Floors"
                  value={formData.Floors}
                  onChange={handleInputChange}
                  className="w-full rounded-xl bg-surface border border-card-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Condition</label>
                <select
                  name="Condition"
                  value={formData.Condition}
                  onChange={handleInputChange}
                  className="w-full rounded-xl bg-surface border border-card-border px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all appearance-none"
                >
                  <option value="New">New</option>
                  <option value="Good">Good</option>
                  <option value="Fair">Fair</option>
                  <option value="Poor">Poor</option>
                </select>
              </div>

            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={status === 'loading'} className="px-8 bg-rose-500 hover:bg-rose-600 text-white">
                {status === 'loading' ? (
                  <>
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Predicting...</span>
                  </>
                ) : (
                  'Predict Price'
                )}
              </Button>
            </div>
          </form>
        </GlassCard>

        {/* Result Section */}
        <div className="space-y-6">
          <GlassCard className="p-6 flex flex-col items-center justify-center min-h-[250px] relative overflow-hidden">
            {status === 'idle' && (
              <div className="text-center text-muted">
                <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-20" />
                <p className="text-sm">Enter property details to see the predicted price.</p>
              </div>
            )}

            {status === 'loading' && (
              <div className="flex flex-col items-center">
                <LoadingSpinner size="lg" />
                <p className="mt-4 text-sm text-muted animate-pulse">Running ML Model...</p>
              </div>
            )}

            {status === 'success' && prediction !== null && (
              <div className="text-center animate-in fade-in zoom-in duration-500">
                <p className="text-sm text-rose-400 font-medium mb-2">Estimated Value</p>
                <h3 className="text-4xl font-bold tracking-tight text-foreground">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 0
                  }).format(prediction)}
                </h3>
                <p className="text-xs text-muted mt-4">
                  Based on current market conditions
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center text-red-400">
                <div className="rounded-full bg-red-400/10 p-3 mx-auto w-fit mb-3">
                  <Activity className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium">Prediction Failed</p>
                <p className="text-xs mt-1 opacity-80">{errorMsg}</p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
