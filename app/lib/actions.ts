'use server';

import { z } from 'zod';
import { db } from './prisma/db.server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};  

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string({
      invalid_type_error: 'Please select a customer.',
    }),
    amount: z.coerce.number().gt(0, { message: 'Amount must be greater than 0.' }),
    status: z.enum(['pending', 'paid'], {
      invalid_type_error: 'Please select a status.',                
    }),
    date: z.string(),
  });
   
  const CreateInvoice = FormSchema.omit({ id: true, date: true });
 
export async function createInvoice(prevState: State, formData: FormData) {
    const validatedFields = CreateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
      });

      if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Create Invoice.',
        };
      }

      const { customerId, amount, status } = validatedFields.data;

      const amountInCents = amount * 100;
      const date = new Date().toISOString();

      try{
        await db.invoices.create({
          data: {
            customer_id: customerId,
            amount: amountInCents,
            status: status,
            date: date,
          },
        })
      } catch(error){
        return{
          message: 'Database Error: ' + error
        }
      }

      revalidatePath('/dashboard/invoices');
      redirect('/dashboard/invoices');
}

const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export async function updateInvoice(id: string, prevState: State, formData: FormData){
    const validatedFields = UpdateInvoice.safeParse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
      });

      if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Missing Fields. Failed to Update Invoice.',
        };
      }

      const { customerId, amount, status } = validatedFields.data;

      const amountInCents = amount * 100;

      try{
        await db.invoices.update({
          where: {
            id: id
          },
          data: {
            customer_id: customerId,
            amount: amountInCents,
            status: status
          }
        })
      } catch(error){
        return{
          message: 'Database Error: ' + error
        }
      }

      revalidatePath('/dashboard/invoices');
      redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string){
  try{
    await db.invoices.delete({
      where: {
        id: id
      }
    })
  } catch(error){
    return{
      message: 'Database Error: ' + error
    }
  }
    revalidatePath('/dashboard/invoices');
}