export function requireFormValue(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`${key} is required`);
  }

  return value.trim();
}

export function optionalFormValue(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function requireEmail(formData: FormData, key = "email") {
  const email = requireFormValue(formData, key).toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    throw new Error("A valid email is required");
  }

  return email;
}
