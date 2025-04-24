"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft } from 'lucide-react';
import { ShippingAddress } from '@/lib/types';
import { z } from 'zod';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ShippingStepProps {
  onContinue: (address: ShippingAddress) => void;
  onBack: () => void;
}

const shippingSchema = z.object({
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  address_line1: z.string().min(1, { message: "Address is required" }),
  address_line2: z.string().optional(),
  city: z.string().min(1, { message: "City is required" }),
  state: z.string().min(1, { message: "State is required" }),
  zip_code: z.string().min(5, { message: "Valid zip code is required" }),
  country: z.string().min(1, { message: "Country is required" }),
  phone_number: z.string().min(10, { message: "Valid phone number is required" }),
});

const US_STATES = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  { value: "AZ", label: "Arizona" },
  { value: "AR", label: "Arkansas" },
  { value: "CA", label: "California" },
  { value: "CO", label: "Colorado" },
  { value: "CT", label: "Connecticut" },
  { value: "DE", label: "Delaware" },
  { value: "FL", label: "Florida" },
  { value: "GA", label: "Georgia" },
  { value: "HI", label: "Hawaii" },
  { value: "ID", label: "Idaho" },
  { value: "IL", label: "Illinois" },
  { value: "IN", label: "Indiana" },
  { value: "IA", label: "Iowa" },
  { value: "KS", label: "Kansas" },
  { value: "KY", label: "Kentucky" },
  { value: "LA", label: "Louisiana" },
  { value: "ME", label: "Maine" },
  { value: "MD", label: "Maryland" },
  { value: "MA", label: "Massachusetts" },
  { value: "MI", label: "Michigan" },
  { value: "MN", label: "Minnesota" },
  { value: "MS", label: "Mississippi" },
  { value: "MO", label: "Missouri" },
  { value: "MT", label: "Montana" },
  { value: "NE", label: "Nebraska" },
  { value: "NV", label: "Nevada" },
  { value: "NH", label: "New Hampshire" },
  { value: "NJ", label: "New Jersey" },
  { value: "NM", label: "New Mexico" },
  { value: "NY", label: "New York" },
  { value: "NC", label: "North Carolina" },
  { value: "ND", label: "North Dakota" },
  { value: "OH", label: "Ohio" },
  { value: "OK", label: "Oklahoma" },
  { value: "OR", label: "Oregon" },
  { value: "PA", label: "Pennsylvania" },
  { value: "RI", label: "Rhode Island" },
  { value: "SC", label: "South Carolina" },
  { value: "SD", label: "South Dakota" },
  { value: "TN", label: "Tennessee" },
  { value: "TX", label: "Texas" },
  { value: "UT", label: "Utah" },
  { value: "VT", label: "Vermont" },
  { value: "VA", label: "Virginia" },
  { value: "WA", label: "Washington" },
  { value: "WV", label: "West Virginia" },
  { value: "WI", label: "Wisconsin" },
  { value: "WY", label: "Wyoming" },
  { value: "DC", label: "District of Columbia" },
];

export function ShippingStep({ onContinue, onBack }: ShippingStepProps) {
  const [address, setAddress] = useState<ShippingAddress>({
    first_name: '',
    last_name: '',
    address_line1: '',
    address_line2: '',
    city: '',
    state: '',
    zip_code: '',
    country: 'US', // Default to US
    phone_number: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: keyof ShippingAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user types
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateAddress = () => {
    try {
      shippingSchema.parse(address);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.errors.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateAddress()) {
      onContinue(address);
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Shipping Details 📦
        </h1>
        <p className="text-gray-600">
          Enter the shipping information for your gift recipient. This information is used only for delivery and is kept secure.
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name <span className="text-red-500">*</span></Label>
            <Input
              id="first_name"
              value={address.first_name}
              onChange={(e) => updateField('first_name', e.target.value)}
              placeholder="Recipient's first name"
              className={errors.first_name ? "border-red-500" : ""}
            />
            {errors.first_name && <p className="text-red-500 text-sm">{errors.first_name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name <span className="text-red-500">*</span></Label>
            <Input
              id="last_name"
              value={address.last_name}
              onChange={(e) => updateField('last_name', e.target.value)}
              placeholder="Recipient's last name"
              className={errors.last_name ? "border-red-500" : ""}
            />
            {errors.last_name && <p className="text-red-500 text-sm">{errors.last_name}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address_line1">Address Line 1 <span className="text-red-500">*</span></Label>
          <Input
            id="address_line1"
            value={address.address_line1}
            onChange={(e) => updateField('address_line1', e.target.value)}
            placeholder="Street address"
            className={errors.address_line1 ? "border-red-500" : ""}
          />
          {errors.address_line1 && <p className="text-red-500 text-sm">{errors.address_line1}</p>}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="address_line2">Address Line 2</Label>
          <Input
            id="address_line2"
            value={address.address_line2}
            onChange={(e) => updateField('address_line2', e.target.value)}
            placeholder="Apartment, suite, unit, etc. (optional)"
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City <span className="text-red-500">*</span></Label>
            <Input
              id="city"
              value={address.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="City"
              className={errors.city ? "border-red-500" : ""}
            />
            {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State <span className="text-red-500">*</span></Label>
            <Select 
              value={address.state} 
              onValueChange={(value) => updateField('state', value)}
            >
              <SelectTrigger className={errors.state ? "border-red-500" : ""}>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && <p className="text-red-500 text-sm">{errors.state}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zip_code">ZIP Code <span className="text-red-500">*</span></Label>
            <Input
              id="zip_code"
              value={address.zip_code}
              onChange={(e) => updateField('zip_code', e.target.value)}
              placeholder="ZIP Code"
              className={errors.zip_code ? "border-red-500" : ""}
            />
            {errors.zip_code && <p className="text-red-500 text-sm">{errors.zip_code}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="phone_number">Phone Number <span className="text-red-500">*</span></Label>
          <Input
            id="phone_number"
            value={address.phone_number}
            onChange={(e) => updateField('phone_number', e.target.value.replace(/\D/g, ''))}
            placeholder="For delivery purposes only"
            className={errors.phone_number ? "border-red-500" : ""}
          />
          {errors.phone_number && <p className="text-red-500 text-sm">{errors.phone_number}</p>}
          <p className="text-xs text-gray-500">
            This is required by carriers for delivery communications. We won't use it for marketing.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-4">
          <Button 
            type="button"
            variant="outline" 
            onClick={onBack}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button 
            type="submit"
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
          >
            Continue to Review
          </Button>
        </div>
      </form>
    </div>
  );
}