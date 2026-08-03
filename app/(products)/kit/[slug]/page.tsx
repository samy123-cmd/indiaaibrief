import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckoutButton } from "@/components/products/checkout-button";
import { Badge } from "@/components/ui/badge";
import { JsonLd } from "@/components/seo/json-ld";
import {
  getDigitalProduct,
  getProductReviewSchemaProps,
  PRODUCTS,
} from "@/lib/products";
import {
  breadcrumbSchema,
  faqPageSchema,
  productSchema,
} from "@/lib/schema";
import { buildMetadata } from "@/lib/seo";
import { absoluteUrl, formatInr } from "@/lib/utils";

export const revalidate = 86400;

export function generateStaticParams() {
  return [{ slug: "ai-compliance" }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getDigitalProduct(slug);
  if (!product) return {};
  return buildMetadata({
    title: `${product.name} — ₹${product.priceInr} & Details`,
    description: product.description,
    path: `/kit/${slug}`,
    image: product.image,
  });
}

export default async function KitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getDigitalProduct(slug);
  if (!product) notFound();

  const breadcrumbs = [
    { name: "Home", item: absoluteUrl("/") },
    { name: "Products", item: absoluteUrl("/kit/ai-compliance") },
    { name: product.name, item: absoluteUrl(`/kit/${product.slug}`) },
  ];

  return (
    <div>
      <JsonLd
        data={[
          productSchema({
            name: product.name,
            description: product.description,
            slug: product.slug,
            priceInr: product.priceInr,
            image: product.image,
            currency: product.currency,
            merchantReturnDays: PRODUCTS.complianceKit.merchantReturnDays,
            ...getProductReviewSchemaProps(product.slug),
          }),
          faqPageSchema(product.faqs),
          breadcrumbSchema(breadcrumbs),
        ]}
      />

      <section className="border-b border-border bg-surface">
        <div className="mx-auto w-full max-w-3xl px-4 py-12 md:py-16">
          <nav
            aria-label="Breadcrumb"
            className="text-xs font-medium uppercase tracking-[0.05em] text-text-secondary"
          >
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/" className="hover:text-accent">
                  Home
                </Link>
              </li>
              <li aria-hidden>/</li>
              <li className="text-text-tertiary">Kit</li>
            </ol>
          </nav>

          <Badge className="mt-6">Digital product · {formatInr(product.priceInr)}</Badge>
          <h1 className="mt-3 text-[32px] font-extrabold leading-10 tracking-[-0.02em] text-foreground md:text-5xl md:leading-[56px]">
            {product.name}
          </h1>
          <p className="mt-4 text-lg font-semibold text-foreground md:text-xl">
            {product.headline}
          </p>
          <p className="mt-3 max-w-2xl text-base leading-7 text-text-secondary">
            {product.description}
          </p>
          <div className="mt-8 max-w-md">
            <CheckoutButton
              product={product.slug}
              productName={product.name}
              priceInr={product.priceInr}
            />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          The problem
        </h2>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          {product.problem}
        </p>
        <h2 className="mt-10 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Why it hurts now
        </h2>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          {product.agitation}
        </p>
        <h2 className="mt-10 text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          The solution
        </h2>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          {product.solution}
        </p>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-3xl px-4 py-12">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What you get
          </h2>
          <p className="mt-2 text-text-secondary">
            Four assets. One purchase. Built for Indian MSMEs.
          </p>
          <ul className="mt-8 space-y-6">
            {product.deliverables.map((item) => (
              <li
                key={item.id}
                className="border-b border-border pb-6 last:border-b-0 last:pb-0"
              >
                <p className="text-xs font-medium uppercase tracking-[0.05em] text-accent">
                  {item.format}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Pricing
        </h2>
        <div className="mt-6 border border-border bg-surface p-5 md:p-6">
          <p className="text-sm uppercase tracking-[0.05em] text-text-tertiary">
            One-time
          </p>
          <p className="mt-2 text-4xl font-extrabold tracking-tight text-foreground">
            {formatInr(product.priceInr)}
          </p>
          <ul className="mt-4 space-y-2 text-sm text-text-secondary">
            {product.features.map((feature) => (
              <li key={feature}>— {feature}</li>
            ))}
          </ul>
          <div className="mt-6 max-w-md">
            <CheckoutButton
              product={product.slug}
              productName={product.name}
              priceInr={product.priceInr}
            />
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-surface">
        <div className="mx-auto w-full max-w-3xl px-4 py-12">
          <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            What you walk away with
          </h2>
          <ul className="mt-8 space-y-8">
            {product.outcomes.map((item) => (
              <li key={item.title}>
                <h3 className="text-lg font-semibold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-base leading-7 text-text-secondary">
                  {item.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto w-full max-w-3xl px-4 py-12">
        <h2 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Frequently asked questions
        </h2>
        <dl className="mt-8 space-y-6">
          {product.faqs.map((faq) => (
            <div key={faq.question}>
              <dt className="text-base font-semibold text-foreground">
                {faq.question}
              </dt>
              <dd className="mt-2 text-sm leading-6 text-text-secondary">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-10 text-sm text-text-tertiary">
          Prefer a deeper audit?{" "}
          <Link
            href="/audit"
            className="font-medium text-accent hover:text-accent-hover"
          >
            AI Readiness Audit — ₹4,999
          </Link>
        </p>
      </section>
    </div>
  );
}
