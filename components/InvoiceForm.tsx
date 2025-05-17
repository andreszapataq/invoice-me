import React, { useState, useEffect } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { formatCurrencyInput } from '@/lib/data';

interface InvoiceFormData {
  email: string;
  amount: string;
  frequency: 'monthly' | 'biweekly';
  dueDateDay: string;  // Día de corte para facturas
  concept: string;
}

interface InvoiceFormProps {
  onCancel?: () => void;
}

const DEFAULT_FORM_DATA: InvoiceFormData = {
  email: '',
  amount: '',
  frequency: 'monthly',
  dueDateDay: '1',  // Por defecto, el primer día
  concept: ''
};

export function InvoiceForm({ onCancel }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>(DEFAULT_FORM_DATA);
  const [formattedAmount, setFormattedAmount] = useState<string>('');

  // Cuando formData.amount cambia, actualizar el valor formateado
  useEffect(() => {
    if (formData.amount) {
      setFormattedAmount(formatCurrencyInput(formData.amount));
    } else {
      setFormattedAmount('');
    }
  }, [formData.amount]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      // Para el campo de monto, solo actualizamos formData.amount
      // El formato visible es manejado por formattedAmount
      const numericValue = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Obtener el valor del input
    const inputValue = e.target.value;
    
    // Eliminar caracteres no numéricos (incluyendo puntos de formato)
    const numericValue = inputValue.replace(/\D/g, '');
    
    // Guardar el valor numérico en formData
    setFormData(prev => ({
      ...prev,
      amount: numericValue
    }));
    
    // Formatear para mostrar
    if (numericValue) {
      setFormattedAmount(formatCurrencyInput(numericValue));
    } else {
      setFormattedAmount('');
    }
  };

  const handleFrequencyChange = (value: string) => {
    const frequency = value as 'monthly' | 'biweekly';
    
    // Ajustar el día de corte cuando cambia la frecuencia
    let dueDateDay = formData.dueDateDay;
    if (frequency === 'biweekly' && parseInt(formData.dueDateDay) > 15) {
      dueDateDay = '1'; // Resetear a 1 si el día seleccionado es mayor que 15 para quincenal
    }
    
    setFormData(prev => ({
      ...prev,
      frequency,
      dueDateDay
    }));
  };

  // Generar opciones de días según la frecuencia
  const generateDayOptions = () => {
    const options = [];
    
    if (formData.frequency === 'monthly') {
      // Para mensual, mostrar días 1-31
      for (let i = 1; i <= 31; i++) {
        options.push(
          <SelectItem key={i} value={i.toString()}>
            Día {i}
          </SelectItem>
        );
      }
    } else {
      // Para quincenal, mostrar opciones de primera y segunda quincena
      options.push(
        <SelectItem key="1" value="1">
          Día 1 (Primera quincena)
        </SelectItem>
      );
      options.push(
        <SelectItem key="16" value="16">
          Día 16 (Segunda quincena)
        </SelectItem>
      );
    }
    
    return options;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // El valor numérico ya está almacenado en formData.amount
    // No necesitamos reconvertirlo
    
    // Crear el objeto final para enviar
    const finalData = {
      ...formData,
      amount: formData.amount // Ya está como valor numérico sin formato
    };
    
    console.log('Datos de factura:', finalData);
    // Aquí iría la lógica para guardar los datos
    alert('Factura configurada con éxito!');
    
    // Reiniciar formulario
    setFormData(DEFAULT_FORM_DATA);
    setFormattedAmount('');
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
            Valor de la Factura (COP)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
              $
            </span>
            <Input
              id="amount"
              name="amount"
              type="text"
              inputMode="numeric"
              placeholder="0"
              className="pl-6"
              value={formattedAmount}
              onChange={handleAmountChange}
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">Valor en pesos colombianos sin centavos</p>
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
          <label htmlFor="dueDateDay" className="text-sm font-medium">
            Día de corte
          </label>
          <Select
            value={formData.dueDateDay}
            onValueChange={(value) => 
              setFormData(prev => ({ ...prev, dueDateDay: value }))
            }
            name="dueDateDay"
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecciona el día de corte" />
            </SelectTrigger>
            <SelectContent>
              {generateDayOptions()}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">
            {formData.frequency === 'monthly' 
              ? 'Día del mes en que se generará la factura' 
              : 'Día de la quincena en que se generará la factura'}
          </p>
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