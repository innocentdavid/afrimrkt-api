/* eslint-disable prettier/prettier */
export function slugify(text: string) {
  if (text) {
    return text
      .toString() // Ensure the input is a string
      .toLowerCase() // Convert the string to lowercase
      .normalize('NFD') // Normalize diacritical marks (accents and other marks) into base characters
      .trim() // Trim leading and trailing spaces
      .replace(/\s+/g, '-') // Replace spaces with dashes
      .replace(/[^a-z0-9\-]/g, '') // Remove non-alphanumeric characters except dashes
      .replace(/\-\-+/g, '-') // Replace multiple dashes with a single dash
      .replace(/^-+|-+$/g, ''); // Remove leading and trailing dashes
  } else {
    return '';
  }
}

export function generateRandomToken(): string {
  const min = 100000; // Minimum 6-digit number (inclusive)
  const max = 999999; // Maximum 6-digit number (inclusive)
  const token = Math.floor(Math.random() * (max - min + 1)) + min;
  return token.toString();
}