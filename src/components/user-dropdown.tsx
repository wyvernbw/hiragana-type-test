"use client";

import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenu,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User as UserIcon } from "lucide-react";
import { Button } from "./ui/button";
import { loggedInAtom, userSessionAtom } from "@/app/state";
import { useAtom, useAtomValue } from "jotai";
import Link from "next/link";

export const UserDropdown = () => {
  const loggedIn = useAtomValue(loggedInAtom);
  const [userSession, setUserSession] = useAtom(userSessionAtom);

  const LoggedIn = () => {
    "use client";
    return (
      <>
        <DropdownMenuLabel>{userSession?.user.username}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View Profile</DropdownMenuItem>
        <DropdownMenuItem
          onClick={(_e) => {
            setUserSession(undefined);
          }}
        >
          Logout
        </DropdownMenuItem>
      </>
    );
  };

  const LoggedOut = () => {
    return (
      <DropdownMenuItem asChild>
        <Link href="login/">Log in </Link>
      </DropdownMenuItem>
    );
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar>
            <AvatarFallback>
              <UserIcon />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {loggedIn ? <LoggedIn /> : <LoggedOut />}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
