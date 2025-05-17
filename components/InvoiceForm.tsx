import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface InvoiceFormData {
  email: string;
  amount: string;
  frequency: 'monthly' | 'biweekly';
  concept: string;
}

interface InvoiceFormProps {
  onCancel?: () => void;
}

const DEFAULT_FORM_DATA: InvoiceFormData = {
  email: '',
  amount: '',
  frequency: 'monthly',
  concept: ''
};

export function InvoiceForm({ onCancel }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>(DEFAULT_FORM_DATA);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFrequencyChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      frequency: value as 'monthly' | 'biweekly'
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Datos de factura:', formData);
    // Aquí iría la lógica para guardar los datos
    alert('Factura configurada con éxito!');
    setFormData(DEFAULT_FORM_DATA);
  };

  const handleCancel = () => {
    setFormData(DEFAULT_FORM_DATA);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="w-full">
      <h3 className="font-medium mb-2">Crear Nueva Factura Automática</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4 py-4">
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Correo Electrónico
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="amount" className="text-sm font-medium">
            Valor de la Factura
          </label>
          <Input
            id="amount"
            name="amount"
            type="number"
            placeholder="0.00"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="frequency" className="text-sm font-medium">
            Frecuencia
          </label>
          <Select
            value={formData.frequency}
            onValueChange={handleFrequencyChange}
            name="frequency"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona la frecuencia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensual</SelectItem>
              <SelectItem value="biweekly">Quincenal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="concept" className="text-sm font-medium">
            Concepto
          </label>
          <Input
            id="concept"
            name="concept"
            type="text"
            placeholder="Ahorro personal"
            value={formData.concept}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="flex gap-2 justify-end pt-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit">
            Guardar
          </Button>
        </div>
      </form>
    </div>
  );
} 