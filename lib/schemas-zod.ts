import { z } from "zod";
const googleUserSchema = z.object({
    // iss: z.string(),
    // azp: z.string(),
    // aud: z.string(),
    sub: z.string(),
    email: z.string().email(),
    // email_verified: z.boolean(),
    // at_hash: z.string(),
    name: z.string(),
    picture: z.string().url(),
    // given_name: z.string(),
    // family_name: z.string(),
    // iat: z.number(),
    // exp: z.number(),
    // id: z.string(),
    // emailVerified: z.null(),
  });
  
  const frontendUserSchema = z.object({
    // user: googleUserSchema,
    oauth_id: z.string(),
    name: z.string(),
    email: z.string().email(),
    image: z.string().url(),
    domain: z.string().optional().nullable(),
    auth_key: z.string().optional(),
  });
  
  const userSchema = z.object({
    user: frontendUserSchema,
    sessionToken: z.string(),
    userId: z.string(),
    expires: z.string().datetime(),
  });

  const searchParamsSchema = z.object({
    callbackUrl: z.string().url(),
    provider: z.string().nullable().optional(),
  })

  const userSchemaCredintials = z.object({
    auth_key: z.string(),
    domain: z.string(),
    error: z.nullable(z.string()),
    email: z.string().email(),
  });

  const newUserRequestSchema = z.object({
    user: userSchema.nullable(),
    searchParams: z.object({
      callbackUrl: z.string().url(),
      provider: z.string().optional(),
    }),
  })

  const newUserCredintialsSchema = z.object({
    user: userSchemaCredintials,
    searchParams: searchParamsSchema,
    provider: z.string().nullable().optional(),
  })



  export { frontendUserSchema, newUserCredintialsSchema, newUserRequestSchema, userSchema };

