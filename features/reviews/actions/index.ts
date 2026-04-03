"use server"

import db from "@/lib/db"
import { currentUser } from "@/features/auth/actions"

export const getReviews= async()=>{
    const user = await currentUser()
    if(!user){
        throw new Error("Unauthorized")
    }

    const reviews = await db.review.findMany({
        where:{
            repository:{
                userId:user.id
            }
        },
        include:{
            repository:true
        },
        orderBy:{
            updatedAt:"desc"
        },
        take:50
    })

    return reviews
}
