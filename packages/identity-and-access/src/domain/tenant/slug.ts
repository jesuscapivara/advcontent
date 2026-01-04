import z from "zod";

const SlugSchema = z
  .string()
  .trim()
  .lowercase()
  .min(1, "Slug cannot be empty")
  .max(24, "Slug cannot be too long (max. 24 characters)")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug is not valid");

class Slug {
  value: string;

  constructor(slug: string) {
    this.value = slug;

    SlugSchema.parse(this.value);
  }
}

export { Slug };
