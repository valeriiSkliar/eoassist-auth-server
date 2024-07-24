// api/users/telegram-auth-link

import { fetchData } from "@/lib/fetch-date";
import { getSubdomain } from "@/lib/get-sub-domain";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const origin = req.nextUrl.searchParams.get('origin');
    const apiResponse = await fetchData('api/users/telegram-auth-link', 'GET', {
        headers: {
            'Domain': getSubdomain(origin ?? ''),
        }
    })

    if(!apiResponse) {
        return NextResponse.json({
        success: false,
        message: 'Failed to get Telegram auth link',
        data: null
        })
    }
    return NextResponse.json({
        success: true,
        data: apiResponse,
        origin
    })
}