import { handlePostVideoUpdate } from "@/actions/admin-actions";
import { NextResponse } from "next/server";
import z from "zod"

const requestSchema = z.object({
    postId: z.string(),
    videoUrl: z.string(),
    videoKey: z.string(),
})

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const validation = requestSchema.safeParse(body)

        if(!validation.success){
            return NextResponse.json(
              { message: "Invalid request body" },
              { status: 401 }
            );
        }
        
        const {postId, videoUrl, videoKey} = validation.data;
        
        const result = await handlePostVideoUpdate(postId, videoUrl, videoKey);
        
        if(result.success){
            return NextResponse.json(
                {message: result.message},
                {status: 200}
            )
        }
        else{
            return NextResponse.json(
              { message: result.message },
              { status: 401 }
            );
        }
    } catch (error) {
        
    }
}