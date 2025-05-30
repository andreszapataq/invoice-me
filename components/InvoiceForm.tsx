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
import { InvoicePreview } from './InvoicePreview';
import { Invoice } from '@/lib/data';

interface InvoiceFormData {
  email: string;
  amount: string;
  frequency: 'monthly' | 'biweekly';
  dueDateDay: string;  // Día de corte para facturas
  concept: string;
}

interface InvoiceFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

const DEFAULT_FORM_DATA: InvoiceFormData = {
  email: '',
  amount: '',
  frequency: 'monthly',
  dueDateDay: '1',  // Por defecto, el primer día
  concept: ''
};

export function InvoiceForm({ onCancel, onSuccess }: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>(DEFAULT_FORM_DATA);
  const [formattedAmount, setFormattedAmount] = useState<string>('');
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');
  const [submitSuccess, setSubmitSuccess] = useState<string>('');

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
    
    // Crear el objeto final para enviar
    const finalData = {
      ...formData,
      amount: formData.amount // Ya está como valor numérico sin formato
    };
    
    console.log('Datos de factura:', finalData);
    
    // Crear una factura temporal para la vista previa
    const previewData: Invoice = {
      id: `inv-${Date.now().toString().slice(-6)}`,
      status: "En Proceso",
      email: formData.email,
      amount: parseInt(formData.amount),
      frequency: formData.frequency,
      concept: formData.concept,
      date: new Date().toISOString().slice(0, 10)
    };
    
    // Establecer la factura de vista previa
    setPreviewInvoice(previewData);
  };

  const handleSendByEmail = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await fetch('/api/invoices/send-now', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          amount: formData.amount,
          frequency: formData.frequency,
          dueDateDay: formData.dueDateDay,
          concept: formData.concept
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitSuccess('¡Factura enviada exitosamente por correo!');
        // Limpiar el formulario después del envío exitoso
        setTimeout(() => {
          setFormData(DEFAULT_FORM_DATA);
          setFormattedAmount('');
          setSubmitSuccess('');
          if (onCancel) onCancel();
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        setSubmitError(result.error || 'Error enviando la factura');
      }
    } catch (error) {
      setSubmitError('Error de conexión. Por favor intenta de nuevo.');
      console.error('Error enviando factura:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScheduleInvoice = async () => {
    setIsSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');

    try {
      const response = await fetch('/api/invoices/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          amount: formData.amount,
          frequency: formData.frequency,
          dueDateDay: formData.dueDateDay,
          concept: formData.concept
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSubmitSuccess('¡Factura programada exitosamente!');
        // Limpiar el formulario después del envío exitoso
        setTimeout(() => {
          setFormData(DEFAULT_FORM_DATA);
          setFormattedAmount('');
          setSubmitSuccess('');
          if (onCancel) onCancel();
          if (onSuccess) onSuccess();
        }, 2000);
      } else {
        setSubmitError(result.error || 'Error programando la factura');
      }
    } catch (error) {
      setSubmitError('Error de conexión. Por favor intenta de nuevo.');
      console.error('Error programando factura:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setFormData(DEFAULT_FORM_DATA);
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="w-full">
      {!previewInvoice ? (
        <>
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
            
            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-4">
              <Button 
                type="button" 
                onClick={handleSendByEmail}
                disabled={isSubmitting}
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Enviando...' : 'Enviar por correo'}
              </Button>
              <Button 
                type="button" 
                onClick={handleScheduleInvoice}
                disabled={isSubmitting}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {isSubmitting ? 'Programando...' : 'Programar envío'}
              </Button>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-end pt-2">
              <Button type="submit" variant="link" className="w-full sm:w-auto">
                Vista Previa
              </Button>
              <Button type="button" variant="link" onClick={handleCancel} className="w-full sm:w-auto">
                Cancelar
              </Button>
            </div>
            
            {/* Mostrar mensajes de éxito o error */}
            {submitSuccess && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                {submitSuccess}
              </div>
            )}
            {submitError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {submitError}
              </div>
            )}
          </form>
        </>
      ) : (
        <div className="w-full">
          <InvoicePreview 
            invoice={previewInvoice} 
            customerInfo={{
              name: "Hernan Andres",
              fullName: "Hernan Andres Zapata Quiñonez",
              address: "KR 97 # 6 25 Casa blanca",
              id: "94541677"
            }}
          />
          
          <div className="flex gap-2 justify-end mt-4">
            <Button type="button" variant="link" onClick={() => setPreviewInvoice(null)}>
              Volver al formulario
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 