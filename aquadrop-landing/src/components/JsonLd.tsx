type JsonLdObject = Record<string, unknown>;

type JsonLdProps = {
  data: JsonLdObject | JsonLdObject[];
};

function stripUndefined(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripUndefined).filter((item) => item !== undefined);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as JsonLdObject)
        .filter(([, item]) => item !== undefined)
        .map(([key, item]) => [key, stripUndefined(item)])
    );
  }

  return value;
}

export function JsonLd({ data }: JsonLdProps) {
  const json = JSON.stringify(stripUndefined(data)).replace(/</g, '\\u003c');

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
