import { type FormSubmitRequest, type FormSubmitResponse } from '@/lib/forms/types';

export async function submitFormToServer(request: FormSubmitRequest): Promise<FormSubmitResponse> {
  const response = await fetch('/api/forms/submit', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  const data = (await response.json().catch(() => null)) as FormSubmitResponse | null;

  if (!response.ok || !data?.ok) {
    throw new Error(data?.error ?? `Form submit API returned status ${response.status}`);
  }

  return data;
}
