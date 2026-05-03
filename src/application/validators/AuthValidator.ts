import { z } from 'zod';

/**
 * Regex para contraseña fuerte:
 * - Al menos 8 caracteres
 * - Al menos una letra mayúscula
 * - Al menos una letra minúscula
 * - Al menos un número
 * - Al menos un carácter especial
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * AuthValidator
 * Esquemas de validación para procesos de autenticación usando Zod.
 */
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      passwordRegex,
      'La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales'
    ),
  displayName: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(50),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
