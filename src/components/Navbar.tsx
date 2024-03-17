import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import Image from "next/image";

export const Navbar = () => {
  return (
    <header className="border-b-2">
      <div className="max-w-6xl mx-auto p-3 flex items-center justify-between font-medium">
        <Link href="/">
          <Button className="py-6" variant="ghost">
            <Image
              src="/LogoIcon.png"
              alt="Logo"
              height={20}
              width={60}
              className="ml-[-15px]"
            />
            <Image
              src="/LogoText.png"
              alt="Logo"
              height={80}
              width={100}
              className="hidden sm:block"
            />
          </Button>
        </Link>
        <SignedIn>
          <div className="flex items-center gap-x-5">
            <Link href="/meetings">
              <Button className="rounded">Meetings</Button>
            </Link>
            <UserButton />
          </div>
        </SignedIn>
        <SignedOut>
            <Button className="rounded">
                <SignInButton afterSignInUrl="/" />
            </Button>
        </SignedOut>
      </div>
    </header>
  );
};
