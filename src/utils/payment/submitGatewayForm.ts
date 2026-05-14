export interface GatewayFormPayload {
  submitMethod?: string | null;
  actionUrl?: string | null;
  formFields?: Record<string, string> | null;
  payUrl?: string | null;
}

export function submitGatewayForm(payload: GatewayFormPayload): boolean {
  const method = (payload.submitMethod ?? '').trim().toUpperCase();
  const actionUrl = (payload.actionUrl ?? payload.payUrl ?? '').trim();
  const formFields = payload.formFields ?? null;

  if (method !== 'POST' || !actionUrl || !formFields || Object.keys(formFields).length === 0) {
    return false;
  }

  const form = document.createElement('form');
  form.method = 'post';
  form.action = actionUrl;
  form.style.display = 'none';

  Object.entries(formFields).forEach(([key, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = key;
    input.value = value ?? '';
    form.appendChild(input);
  });

  document.body.appendChild(form);
  form.submit();
  return true;
}
