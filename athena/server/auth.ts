import { NextAuthOptions, getServerSession } from "next-auth"
import { PrismaAdapter } from  "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import Github, { GithubProfile } from "next-auth/providers/github"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        Github({
            clientId: process.env.CLIENT_ID,
            clientSecret: process.env.CLIENT_SECRET,
            profile: (profile: GithubProfile) => {
                return {
                    id: profile.id,
                    image: profile.avatar_url,
                    name: profile.name,
                    username: profile.name,
                    email: profile.email, 
                    encryptedPrivateKey: null,
                    publicKey: null,
                    walletAddress: null
                }
            }
        })
    ],
    callbacks: {
        session: ({ session, user }) => {
            return {
                ...session,
                user: {
                    ...user
                }
            }
        }
    },
    events: {
        signIn: (message) => {
            console.log('SignIn event::', message)
        },
        signOut: (message) => {
            console.log("Signout event::", message)
        }
    }
}


export const getServerAuthSession = () => getServerSession(authOptions);