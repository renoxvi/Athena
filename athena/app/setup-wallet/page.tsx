"use client"
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { createAccount } from '@/server/wallet'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { Wallet } from 'lucide-react'


const formSchema = z.object({
    password: z.string().min(8, {
        message: "Password should be a tleast 8 characters long"
    }),
    confirmPassword: z.string().min(8, {
        message: "Password needs to be at least 8 characters long"
    })
}).superRefine(({password, confirmPassword},ctx)=>{
    if(password !== confirmPassword){
        ctx.addIssue({
            code: "custom",
            message: "The password did not match"
        })
    }
})

function SettupWallet() {
    const { push } = useRouter()
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
    })

    const {toast} = useToast()

    async function onSubmit() {


        try {
            console.log(1);
            const user = await createAccount()
            console.log("User::", user)

            push("/dashboard")
            toast({
                title: "🎉 Success",
                description: "Your wallet was successfully set up"
            })

            
        }
        catch (e)
        {
            toast({
                title: "!Oops",
                description: "Something went wrong, please try again",
                variant: "destructive"
            })
        }

    }

  return (
    <div className="flex flex-col items-center justify-center px-5 py-5 w-full h-screen">
        <div className="flex flex-col w-1/2 h-4/5 space-y-5">
            <h3 className='text-2xl font-semibold' >
                Setup you account
            </h3>
            <Form {...form} >
                <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8' >
                    <FormField
                        control={form.control}
                        name="password"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Encryption Password</FormLabel>
                                <FormControl>
                                    <Input type="password" placeholder='Encryption Password' {...field} />
                                </FormControl>
                                <FormDescription  >
                                    This password will be used to encrypt and decrypt your private key to guarantee its safety. <br />
                                    <span className="text-red-500">
                                        Do not share this with anyone, even us! 
                                    </span><br/> 
                                    <span className='text-blue-500' >
                                        Your encryption password is never stored on our servers, so its up to you to keep it safe
                                    </span>
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({field})=>(
                            <FormItem>
                                <FormLabel>Confirm Encryption Password</FormLabel>
                                <FormControl>
                                    <Input type='password' placeholder='Confirm Encryption Password' {...field} />
                                </FormControl>
                                <FormDescription>
                                    Confirm you have entered a correct encryption password
                                </FormDescription>
                                <FormMessage/>
                            </FormItem>
                        )}
                    />
                    
                    <FormControl > 
                        <Button  type="submit" variant={'outline'} >Create Account</Button>
                    </FormControl>
                </form>
            </Form>
            
        </div>
    </div>
  )
}

export default SettupWallet