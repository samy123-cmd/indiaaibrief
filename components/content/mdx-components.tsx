import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  HTMLAttributes,
  ReactNode,
  TableHTMLAttributes,
  TdHTMLAttributes,
  ThHTMLAttributes,
} from "react";
import { Figure, FigureTable } from "@/components/content/figure";

function Answer({ children }: { children: ReactNode }) {
  return <div className="answer-block">{children}</div>;
}

function MdxLink({
  href,
  children,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href?.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

function Table({
  children,
  ...props
}: TableHTMLAttributes<HTMLTableElement>) {
  return (
    <div className="table-scroll">
      <table {...props}>{children}</table>
    </div>
  );
}

function Th({ children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return <th {...props}>{children}</th>;
}

function Td({ children, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td {...props}>{children}</td>;
}

function Pre({ children, ...props }: HTMLAttributes<HTMLPreElement>) {
  return <pre {...props}>{children}</pre>;
}

export const mdxComponents = {
  Answer,
  Figure,
  FigureTable,
  a: MdxLink,
  table: Table,
  th: Th,
  td: Td,
  pre: Pre,
} satisfies MDXComponents;
