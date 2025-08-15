"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import cx from "classnames";
import { MessageSquareText } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { User } from "next-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { ChatMeta } from "@/lib/redis-queries";
import { fetcher, generateUUID } from "@/lib/utils";

import { FeedbackForm } from "./feedback-form"; // Import the new component
import {
  InfoIcon,
  MenuIcon,
  MoreHorizontalIcon,
  PencilEditIcon,
  TrashIcon,
  // MessageSquareTextIcon, // replaced by lucide-react MessageSquareText
} from "./icons";
import { NavUser } from "./nav-user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

export const History = ({ user }: { user: User | undefined }) => {
  const { id } = useParams();
  const pathname = usePathname();

  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false); // New state for feedback form
  const {
    data: history,
    isLoading,
    mutate,
  } = useSWR<Array<ChatMeta>>(user ? "/api/history" : null, fetcher, {
    fallbackData: [],
  });

  // Add state for profile info
  const [profile, setProfile] = useState<{ firstName?: string; lastName?: string; plan?: string }>({});

  useEffect(() => {
    // Only mutate when the history component is visible to prevent unnecessary updates
    if (isHistoryVisible) {
      mutate();
    }
  }, [pathname, mutate, isHistoryVisible]);

  // Fetch profile info for sidebar user display
  useEffect(() => {
    if (user) {
      fetch("/account/api/profile")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) setProfile({ firstName: data.firstName, lastName: data.lastName, plan: data.plan });
        });
    }
  }, [user]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting chat...",
      success: () => {
        mutate((history) => {
          if (history) {
            return history.filter((h) => h.id !== id);
          }
        });
        return "Chat deleted successfully";
      },
      error: "Failed to delete chat",
    });

    setShowDeleteDialog(false);
  };

  function getTitleFromChat(chat: ChatMeta): import("react").ReactNode {
    // Use the title from Redis, or fallback to a default
    if (chat.title && chat.title !== 'Untitled chat') {
      const content = chat.title.trim();
      return content.length > 40 ? content.slice(0, 40) + "..." : content;
    }
    return <span className="italic text-zinc-400">Untitled chat</span>;
  }

  return (
    <>
      <Button
        variant="outline"
        className="p-1.5 h-fit"
        onClick={() => {
          setIsHistoryVisible(true);
        }}
      >
        <MenuIcon />
      </Button>

      <Sheet
        open={isHistoryVisible}
        onOpenChange={(state) => {
          setIsHistoryVisible(state);
        }}
      >
        <SheetContent side="left" className="p-3 w-[78vw] sm:w-80 max-w-[90vw] bg-background/80 backdrop-blur-md border-r border-border/50">
          <SheetHeader>
            <VisuallyHidden.Root>
              <SheetTitle className="text-left">History</SheetTitle>
              <SheetDescription className="text-left">
                {history === undefined ? "loading" : history.length} chats
              </SheetDescription>
            </VisuallyHidden.Root>
          </SheetHeader>

          <div className="text-sm flex flex-row items-center justify-between">
            <div className="flex flex-row gap-2">
              <div className="dark:text-zinc-300">History</div>

              <div className="dark:text-zinc-400 text-zinc-500">
                {history === undefined ? "loading" : history.length} chats
              </div>
            </div>
          </div>

          <div className="mt-8 sm:mt-10 flex flex-col flex-1">
            {user && (
              <Button
                className="font-normal text-sm flex flex-row justify-between text-white"
                asChild
                onClick={() => setIsHistoryVisible(false)} // Close sidebar on new chat click
              >
                <Link href={`/chat/${generateUUID()}`} prefetch={false}>
                  <div>Start a new chat</div>
                  <PencilEditIcon size={14} />
                </Link>
              </Button>
            )}

            <div className="flex flex-col overflow-y-scroll p-1 h-[calc(100dvh-280px)] tiny-scrollbar">
              {!user ? (
                <div className="text-zinc-500 h-dvh w-full flex flex-row justify-center items-center text-sm gap-2">
                  <InfoIcon />
                  <div>Login to save and revisit previous chats!</div>
                </div>
              ) : null}

              {!isLoading && history?.length === 0 && user ? (
                <div className="text-zinc-500 h-dvh w-full flex flex-row justify-center items-center text-sm gap-2">
                  <InfoIcon />
                  <div>No chats found</div>
                </div>
              ) : null}

              {isLoading && user ? (
                <div className="flex flex-col">
                  {[44, 32, 28, 52].map((item) => (
                    <div key={item} className="p-2 my-[2px]">
                      <div
                        className={`w-${item} h-[20px] rounded-md bg-zinc-200 dark:bg-zinc-600 animate-pulse`}
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              {history &&
                history.map((chat) => (
                  <div
                    key={chat.id}
                    className={cx(
                      "flex flex-row items-center gap-6 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md pr-2",
                      { "bg-zinc-200 dark:bg-zinc-700": chat.id === id },
                    )}
                  >
                    <Button
                      variant="ghost"
                      className={cx(
                        "hover:bg-zinc-200 dark:hover:bg-zinc-700 justify-between p-0 text-sm font-normal flex flex-row items-center gap-2 pr-2 w-full transition-none",
                      )}
                      asChild
                      onClick={() => setIsHistoryVisible(false)} // Close sidebar on chat link click
                    >
                      <Link
                        href={`/chat/${chat.id}`}
                        className="text-ellipsis overflow-hidden text-left py-2 pl-2 rounded-lg outline-zinc-900"
                      >
                        {getTitleFromChat(chat)}
                      </Link>
                    </Button>

                    <DropdownMenu modal={true}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="p-0 h-fit font-normal text-zinc-500 transition-none hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          variant="ghost"
                        >
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="left" className="z-[60]">
                        <DropdownMenuItem asChild>
                          <Button
                            className="flex flex-row gap-2 items-center justify-start w-full h-fit font-normal p-1.5 rounded-sm"
                            variant="ghost"
                            onClick={() => {
                              setDeleteId(chat.id);
                              setShowDeleteDialog(true);
                              setIsHistoryVisible(false); // Close sidebar on delete button click
                            }}
                          >
                            <TrashIcon />
                            <div>Delete</div>
                          </Button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
            </div>
          </div>

          {/* Feedback button */}
          {user && (
            <div className="mt-2 px-2">
              <Button
                className="font-normal text-sm flex flex-row items-center justify-start w-full h-10 pl-3 pr-2 gap-2 text-foreground"
                variant="ghost"
                onClick={() => {
                  setShowFeedbackForm(true);
                  setIsHistoryVisible(false); // Close sidebar when opening feedback form
                }}
              >
                <MessageSquareText className="shrink-0" size={20} />
                <span className="leading-none">Submit Feedback</span>
              </Button>
            </div>
          )}

          {/* NavUser at the bottom of the sidebar */}
          <div className="pt-1 px-2">
             {/* Feedback Form Dialog */}
            <AlertDialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
              <AlertDialogContent>
                <FeedbackForm onClose={() => setShowFeedbackForm(false)} />
              </AlertDialogContent>
            </AlertDialog>
            {user && (
              <NavUser
                user={{
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  plan: profile.plan,
                  email: user.email || "",
                  avatar: user.image || "", // always string
                  name: user.name || "", // always string
                }}
                onCloseSidebar={() => setIsHistoryVisible(false)} // Pass close handler to NavUser
              />
            )}
            <div className="mt-1 mb-1 text-center text-[10px] text-muted-foreground">jotium v0.1.9</div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Feedback Form Dialog */}
      <AlertDialog open={showFeedbackForm} onOpenChange={setShowFeedbackForm}>
        <AlertDialogContent>
          <FeedbackForm onClose={() => setShowFeedbackForm(false)} />
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
