"use server"
import { prisma } from "@/lib/prisma"
import { encryptPrivateKey } from "@/lib/utils"
import algosdk from "algosdk"
import { myAlgoConnect } from "@/algorand/constants"
import { getServerAuthSession } from "./auth"

export const createAccount = async () => {
    console.log(3)
    const session = await getServerAuthSession()
    console.log(4)
    // const account = algosdk.generateAccount()   
    const accounts = await myAlgoConnect.connect();
    console.log(5)
    const address = accounts[0].address;


    const user = await prisma.user.update({
        where: {
            id: session?.user.id
        },
        data: {
            walletAddress: address,
            // encryptedPrivateKey,
            publicKey: address
        }
    })
    console.log(6)

    return user


}