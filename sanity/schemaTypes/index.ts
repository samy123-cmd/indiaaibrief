export const startup = {
  name: "startup",
  title: "Startup",
  type: "document",
  fields: [
    { name: "name", title: "Name", type: "string" },
    { name: "slug", title: "Slug", type: "slug", options: { source: "name" } },
    { name: "city", title: "City", type: "string" },
    { name: "sector", title: "Sector", type: "string" },
    { name: "fundingStage", title: "Funding Stage", type: "string" },
    { name: "lastFundingDate", title: "Last Funding Date", type: "date" },
    {
      name: "lastFundingAmountInr",
      title: "Last Funding Amount (INR)",
      type: "number",
    },
    { name: "website", title: "Website", type: "url" },
    { name: "summary", title: "Summary", type: "text" },
  ],
};

export const policyUpdate = {
  name: "policyUpdate",
  title: "Policy Update",
  type: "document",
  fields: [
    { name: "title", title: "Title", type: "string" },
    { name: "slug", title: "Slug", type: "slug", options: { source: "title" } },
    { name: "jurisdiction", title: "Jurisdiction", type: "string" },
    { name: "sector", title: "Sector", type: "string" },
    { name: "publishedAt", title: "Published At", type: "datetime" },
    { name: "summary", title: "Summary", type: "text" },
    { name: "sourceUrl", title: "Source URL", type: "url" },
  ],
};

export const schemaTypes = [startup, policyUpdate];
