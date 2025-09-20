// actions.ts

'use server';

import { z } from 'zod';

import { createUser, getUser } from '@/lib/db/queries';
import { signIn } from './auth';

// Schema for the login form (requires only email and password)
const loginFormSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z.string().min(1, 'Password is required.'),
});

// Expanded schema for the registration form
const registerFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.string().email('Please enter a valid Rice email address.'),
  phoneNumber: z.string().min(10, 'A valid 10-digit phone number is required.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});


export interface LoginActionState {
  status: 'idle' | 'in_progress' | 'success' | 'failed' | 'invalid_data';
  message?: string;
}

export const login = async (
  _: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> => {
  try {
    const validatedData = loginFormSchema.parse({
      email: formData.get('email'),
      password: formData.get('password'),
    });

    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data', message: error.errors.map(e => e.message).join(', ') };
    }
    // Auth.js may throw a specific error for bad credentials, which could be handled here.
    return { status: 'failed', message: 'Invalid email or password.' };
  }
};


export interface RegisterActionState {
  status:
    | 'idle'
    | 'in_progress'
    | 'success'
    | 'failed'
    | 'user_exists'
    | 'invalid_data';
  message?: string;
}

export const register = async (
  _: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> => {
  try {
    const validatedData = registerFormSchema.parse({
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phoneNumber: formData.get('phoneNumber'),
      password: formData.get('password'),
    });

    const [existingUser] = await getUser(validatedData.email);

    if (existingUser) {
      return { status: 'user_exists', message: 'An account with this email already exists.' };
    }
    
    // Construct the object that createUser expects
    await createUser({
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      riceEmail: validatedData.email,
      phoneNumber: validatedData.phoneNumber,
      passwordPlain: validatedData.password,
    });

    // Automatically sign the user in after successful registration
    await signIn('credentials', {
      email: validatedData.email,
      password: validatedData.password,
      redirect: false,
    });

    return { status: 'success' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { status: 'invalid_data', message: error.errors.map(e => e.message).join(', ') };
    }

    console.error("Registration failed:", error); // Log the error for debugging
    return { status: 'failed', message: 'An unexpected error occurred. Please try again.' };
  }
};