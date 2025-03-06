// // middlewares/withAuthMiddleware.ts
// import { authConfig } from "@/auth.config";
// import NextAuth from "next-auth";
// import { NextResponse } from "next/server";
// import { CustomMiddleware } from './chain';

// const { auth } = NextAuth(authConfig);

// export function withAuthMiddleware(middleware: CustomMiddleware): CustomMiddleware {
//   return auth(async (request, event) => {
//     const response = NextResponse.next();
//     return middleware(request, event, response);
//   });
// }