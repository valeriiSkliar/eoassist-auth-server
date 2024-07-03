import { auth } from "@/auth";
import { NextResponse, type NextRequest } from "next/server";

export const GET = async (req:NextRequest) => {
    const serverSession = await auth()
    return NextResponse.json({
        session: 'sssdsds',
        serverSession
    })
}