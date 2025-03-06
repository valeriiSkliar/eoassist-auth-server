import { fetchData } from "@/lib/fetch-date";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

interface ResetPasswordResponse {
  success: boolean;
  message?: string;
  data?: any;
}

/**
 * Handle password reset request
 * @param req Request object
 * @returns Response with reset password status
 */
const GET = async (req: Request): Promise<NextResponse<ResetPasswordResponse>> => {
  try {
    // Extract and validate email parameter
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const origin = headers().get('origin') || '';

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'Email parameter is required',
        data: null
      }, { status: 400 });
    }

    if (!email.includes('@')) {
      return NextResponse.json({
        success: false,
        message: 'Invalid email format',
        data: null
      }, { status: 400 });
    }

    // Call the backend API to initiate password reset
    const apiResponse = await fetchData('api/users/reset-password', 'GET', {
      headers: {}
    }, { email });

    // Return successful response
    return NextResponse.json({
      success: true,
      message: 'Password reset link has been sent to your email',
      data: apiResponse
    });

  } catch (error) {
    console.error('Password reset error:', error);
    
    // Handle different types of errors
    if (error instanceof Error) {
      // Check if it's a network error
      if (error.message.includes('Failed to fetch')) {
        return NextResponse.json({
          success: false,
          message: 'Unable to connect to authentication server. Please try again later.',
          data: null
        }, { status: 503 });
      }
      
      return NextResponse.json({
        success: false,
        message: error.message || 'An error occurred during password reset',
        data: null
      }, { status: 500 });
    }
    
    // Generic error fallback
    return NextResponse.json({
      success: false,
      message: 'An unexpected error occurred. Please try again later.',
      data: null
    }, { status: 500 });
  }
};

export { GET };