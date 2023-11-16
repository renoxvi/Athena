"use client"
import { usePrivateKey } from "@/context/private-key-context";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Input } from "./ui/input";
import { useState } from "react";
import { useToast } from "./ui/use-toast";
import { Heart } from "lucide-react";

export default function DecryptPrivateKey(props: { visible: boolean }) {
    const [password, setPassword] = useState<string>();
    const { decryptPrivateKey, privateKey } = usePrivateKey();
    const { toast } = useToast();
    const [isVisible, setIsVisible] = useState(props.visible);

    const handleDecrypt = () => {
        try {
            password && decryptPrivateKey?.(password);
            setIsVisible(false); // Set visibility to false to close the component
        } catch (e) {
            toast({
                variant: "destructive",
                title: "!Uh-oh",
                description: "Are you sure the password is valid"
            });
        }
    };

    return (
        <div>
            {isVisible ? (
                <Dialog>
                    <DialogTrigger>
                        <Button>
                            Decrypt Private Key to purchase
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                Decrypt your private key
                            </DialogTitle>
                            <DialogDescription>
                                This operation requires you to sign with your private key, decrypt it to proceed
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col w-full gap-y-2 ">
                            <Input onChange={(e) => setPassword(e.target.value)} placeholder="Your cool password..." type="password" />
                            <Button variant={'outline'} onClick={handleDecrypt} >
                                Decrypt
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            ) : null}
        </div>
    );
}