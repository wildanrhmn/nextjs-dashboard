import { db } from "@/app/lib/prisma/db.server";
const {
  invoices,
  customers,
  revenue,
  users,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');

async function seed() {
  // await Promise.all(
  //   users.map(async (user) => {
  //     return db.users.create({
  //       data: {
  //         name: user.name,
  //         email: user.email,
  //         password: await bcrypt.hash(user.password, 10),
  //       },
  //     })
  //   })
  // )

  // await Promise.all(
  //   revenue.map(async (record) => {
  //     return db.revenue.create({
  //       data: {
  //         month: record.month,
  //         revenue: record.revenue
  //       }
  //     })
  //   })
  // )

  await Promise.all(
    invoices.map(async (record) => {
      return db.invoices.create({
        data: record
      })
    })
  )

  // await Promise.all(
  //   customers.map(async (record) => {
  //     return db.customers.create({
  //       data: record
  //     })
  //   })
  // )
}

seed();