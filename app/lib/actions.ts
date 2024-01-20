'use server';

import { z } from 'zod';
import { db } from './prisma/db.server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const FormSchema = z.object({
    id: z.string(),
    customerId: z.string(),
    amount: z.coerce.number(),
    status: z.enum(['pending', 'paid']),
    date: z.string(),
  });
   
  const CreateInvoice = FormSchema.omit({ id: true, date: true });
 
export async function createInvoice(formData: FormData) {
    const { customerId, amount, status } = CreateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
      });
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

export async function updateInvoice(id: string, formData: FormData){
    const { customerId, amount, status } = UpdateInvoice.parse({
        customerId: formData.get('customerId'),
        amount: formData.get('amount'),
        status: formData.get('status'),
      });

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