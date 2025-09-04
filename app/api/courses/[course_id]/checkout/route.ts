import { db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ course_id: string }>}
) {
  try {
    const { course_id } = await params;
    const user = await currentUser();

    if (!user || !user.id || !user.emailAddresses?.[0]?.emailAddress) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const course = await db.courses.findUnique({
      where: {
        id: course_id,
        is_published: true,
      },
    });

    const purchase = await db.purchases.findUnique({
      where: {
        user_id_course_id: {
          user_id: user.id,
          course_id: course_id,
        },
      },
    });

    if (purchase) {
      return new NextResponse("Already purchased", { status: 400 });
    }

    if (!course) {
      return new NextResponse("Not found", { status: 404 });
    }

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [
      {
        quantity: 1,
        price_data: {
          currency: "USD",
          product_data: {
            name: course.title,
            description: course.description!,
          },
          unit_amount: Math.round(course.price! * 100),
        },
      },
    ];

    let stripeCustomer = await db.stripe_customers.findUnique({
      where: {
        user_id: user.id,
      },
      select: {
        stripe_customer_id: true,
      },
    });

    if (!stripeCustomer) {
      const customer = await stripe.customers.create({
        email: user.emailAddresses[0].emailAddress,
      });
      stripeCustomer  = await db.stripe_customers.create({
        data: {
          user_id: user.id,
          stripe_customer_id: customer.id,
        },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.stripe_customer_id,
      line_items,
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?success=1`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/courses/${course.id}?cancel=1`,
      metadata: {
        course_id: course.id,
        user_id: user.id,
      }
    });

    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.log("[COURSE_ID_CHECKOUT] ", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};