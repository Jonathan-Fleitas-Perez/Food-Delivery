import { z } from 'zod';

export const orderSchemaZod = z.object({
  userId: z.string().min(1, "ID de usuario requerido"),
  items: z.array(
    z.object({
      name: z.string().min(1, "Nombre del ítem requerido"),
      quantity: z.number().int().positive("Cantidad debe ser positiva"),
      size: z.string().optional(),
      price: z.record(z.string(), z.number()).optional()
    })
  ).nonempty("Debe haber al menos un ítem"),
  amount: z.number().positive("Monto debe ser positivo"),
  address: z.object({
    firstName: z.string().min(1, "Nombre requerido"),
    lastName: z.string().min(1, "Apellido requerido"),
    street: z.string().min(1, "Calle requerida"),
    city: z.string().min(1, "Ciudad requerida"),
    state: z.string().min(1, "Estado/provincia requerido"),
    country: z.string().min(1, "País requerido"),
    zipcode: z.string().min(1, "Código postal requerido"),
    phone: z.string().min(1, "Teléfono requerido")
  }),
  status: z.string().default('Order Placed'),
  paymentMethod: z.enum(['COD', 'Stripe'], {
    errorMap: () => ({ message: "Método de pago inválido" })
  }),
  payment: z.boolean().default(false),
  date: z.number().default(() => Date.now())
});