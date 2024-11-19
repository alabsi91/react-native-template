/**
 * Clamps a value within a specified range.
 *
 * @param value - The value to clamp.
 * @param min - The minimum value in the range.
 * @param max - The maximum value in the range.
 * @returns The clamped value.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Sleeps (waits) for a specified amount of time in milliseconds.
 *
 * @param ms - The time to sleep in milliseconds.
 * @returns A Promise that resolves after the specified time.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generates a random number within a specified range.
 *
 * @param min - The minimum value of the range (inclusive).
 * @param max - The maximum value of the range (inclusive).
 * @returns A random number within the specified range.
 */
export function getRandomNumberInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Picks a random item from an array.
 *
 * @param array - The array from which to pick an item.
 * @returns A randomly selected item from the array.
 */
export function pickRandomItem<T>(array: T[]): T | undefined {
  if (array.length === 0) {
    return undefined; // Return undefined for empty arrays.
  }

  const randomIndex = getRandomNumberInRange(0, array.length - 1);
  return array[randomIndex];
}

/**
 * Generates a Universally Unique Identifier (UUID).
 *
 * @returns A UUID string.
 */
export function generateUUID(): string {
  // Generate a random hexadecimal string for each segment of the UUID.
  const segment = () =>
    Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);

  // Create the UUID by combining the generated segments.
  return (
    segment() +
    segment() +
    "-" +
    segment() +
    "-" +
    segment() +
    "-4" +
    segment().substr(0, 3) +
    "-" +
    segment() +
    segment() +
    segment()
  );
}
