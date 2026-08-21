const DATE_INPUT_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function getReturnDate(formData: FormData) {
  const value = String(formData.get("returnDate") ?? "");
  return DATE_INPUT_PATTERN.test(value) ? value : null;
}

export function buildTimelineRedirectPath(
  childId: string,
  formData: FormData,
  error?: string,
) {
  const params = new URLSearchParams();
  const returnDate = getReturnDate(formData);

  if (returnDate) {
    params.set("date", returnDate);
  }

  if (error) {
    params.set("error", error);
  }

  const query = params.toString();
  return `/children/${childId}/timeline${query ? `?${query}` : ""}`;
}
