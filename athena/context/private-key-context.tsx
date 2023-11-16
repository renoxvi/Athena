"use client"
import { decryptPrivateKey } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { ReactNode, createContext, useContext, useState } from "react";


const context = createContext<{
    privateKey: Uint8Array | null
    decryptPrivateKey?: (password: string) => void
}>({
    privateKey: null,

})



interface Props {
    children: ReactNode
}

export default function PrivateKeyProvider(props:Props){
    const session = useSession()
    const user = session.data?.user
    const { children } = props
    const [privateKey, setPrivateKey] = useState<Uint8Array|null>(null)

    const decryptKey = (password: string) => {
        if(user?.encryptedPrivateKey) {
            const key = decryptPrivateKey(password, user.encryptedPrivateKey)
            console.log("KEY::", key)
            setPrivateKey(key)
        }
    }
    return (
        <context.Provider
            value={{
                privateKey,
                decryptPrivateKey: decryptKey
            }}
        >
            {children}
        </context.Provider>
    )
}


export const usePrivateKey = () => {
    const { privateKey, decryptPrivateKey } = useContext(context)


    return {
        privateKey,
        decryptPrivateKey
    }
}