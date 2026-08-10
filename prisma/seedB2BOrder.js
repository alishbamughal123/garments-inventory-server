const prisma = require("../src/config/db");

async function seedB2BOrder() {
  console.log("Seeding B2B sample customer order into database...");

  // 1. Get customer
  let customer = await prisma.customer.findFirst({
    where: { email: "client@nordicretail.no" }
  });

  if (!customer) {
    customer = await prisma.customer.findFirst();
  }

  if (!customer) {
    console.error("No customer found. Please seed test accounts first.");
    return;
  }

  // 2. Get products
  const products = await prisma.product.findMany({ take: 2 });
  if (products.length === 0) {
    console.error("No products found.");
    return;
  }

  const p1 = products[0];
  const p2 = products[1] || products[0];

  const qty1 = 5;
  const qty2 = 3;
  const price1 = Number(p1.salePrice) || 500;
  const price2 = Number(p2.salePrice) || 400;

  const totalWeight1 = (p1.weightInKg || 0.85) * qty1;
  const totalWeight2 = (p2.weightInKg || 0.55) * qty2;

  const subtotal = (price1 * qty1) + (price2 * qty2);
  const tax = subtotal * 0.25;
  const grandTotal = subtotal + tax;
  const garmentWeightKg = totalWeight1 + totalWeight2;
  const packagingWeightKg = 0.25;
  const totalParcelWeight = garmentWeightKg + packagingWeightKg;

  const count = await prisma.customerOrder.count();
  const year = new Date().getFullYear();
  const orderNumber = `ORD-${year}-${String(count + 101).padStart(4, "0")}`;

  const order = await prisma.customerOrder.create({
    data: {
      orderNumber,
      customerId: customer.id,
      status: "PENDING",
      subtotal,
      tax,
      totalAmount: grandTotal,
      garmentWeightKg,
      packagingWeightKg,
      totalParcelWeight,
      notes: "Urgent winter inventory restocking order via B2B Portal",
      shippingAddress: customer.address || "Storgata 100, 0182 Oslo, Norway",
      orderItems: {
        create: [
          {
            productId: p1.id,
            quantity: qty1,
            unitPrice: price1,
            unitWeight: p1.weightInKg || 0.85,
            totalPrice: price1 * qty1,
            totalWeight: totalWeight1
          },
          {
            productId: p2.id,
            quantity: qty2,
            unitPrice: price2,
            unitWeight: p2.weightInKg || 0.55,
            totalPrice: price2 * qty2,
            totalWeight: totalWeight2
          }
        ]
      }
    },
    include: {
      customer: true,
      orderItems: { include: { product: true } }
    }
  });

  console.log("==================================================");
  console.log("✓ B2B ORDER SUCCESSFULLY SEEDED IN DATABASE!");
  console.log("--------------------------------------------------");
  console.log("Order Number:", order.orderNumber);
  console.log("Customer:", order.customer.companyName, `(${order.customer.fullName})`);
  console.log("Total Amount:", order.totalAmount.toFixed(2), "NOK (inc 25% MVA)");
  console.log("Parcel Weight:", order.totalParcelWeight.toFixed(2), "kg");
  console.log("Status:", order.status);
  console.log("==================================================");
}

seedB2BOrder()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
