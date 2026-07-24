import {
  getFigureByKey,
  getFiguresByGroup,
  getFiguresByKeys,
} from "@/lib/editorial/figures";

interface FigureProps {
  id: string;
}

/** Single live figure pulled from the figures registry. */
export async function Figure({ id }: FigureProps) {
  const figure = await getFigureByKey(id);
  if (!figure) {
    return (
      <p className="text-sm text-text-tertiary">
        [Figure <code>{id}</code> unavailable — add it in Editorial → Figures]
      </p>
    );
  }

  const asOf = figure.asOfDate
    ? new Intl.DateTimeFormat("en-IN", {
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(figure.asOfDate)
    : null;

  return (
    <aside className="figure-stat">
      <span className="figure-stat__value">
        {figure.value}
        {figure.unit ? ` ${figure.unit}` : ""}
      </span>
      <span className="figure-stat__label">{figure.label}</span>
      <span className="figure-stat__source">
        {figure.sourceUrl ? (
          <a href={figure.sourceUrl} rel="noopener noreferrer">
            {figure.sourceName}
          </a>
        ) : (
          figure.sourceName
        )}
        {asOf ? ` · as of ${asOf}` : null}
      </span>
    </aside>
  );
}

interface FigureTableProps {
  group?: string;
  keys?: string[];
  caption?: string;
}

/** Live table of figures by group key or explicit keys list. */
export async function FigureTable({ group, keys, caption }: FigureTableProps) {
  const rows = group
    ? await getFiguresByGroup(group)
    : keys
      ? await getFiguresByKeys(keys)
      : [];

  if (rows.length === 0) {
    return (
      <p className="text-sm text-text-tertiary">
        [Figure table empty
        {group ? ` for group “${group}”` : ""}
        {keys ? ` for keys ${keys.join(", ")}` : ""} — update in Editorial →
        Figures]
      </p>
    );
  }

  return (
    <div className="table-scroll">
      <table>
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr>
            <th>Metric</th>
            <th>Finding</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td>{row.label}</td>
              <td>
                <strong>
                  {row.value}
                  {row.unit ? ` ${row.unit}` : ""}
                </strong>
              </td>
              <td>
                {row.sourceUrl ? (
                  <a href={row.sourceUrl} rel="noopener noreferrer">
                    {row.sourceName}
                  </a>
                ) : (
                  row.sourceName
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
