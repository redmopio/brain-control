import type {
  GetServerSidePropsContext,
  InferGetServerSidePropsType,
} from "next";
import Link from "next/link";
import Head from "next/head";
import { formatRelative } from "date-fns";
import { useState } from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api, type RouterOutputs } from "@/lib/api";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const getServerSideProps = async (
  context: GetServerSidePropsContext,
  // eslint-disable-next-line @typescript-eslint/require-await
) => {
  const groupId = context.query.groupId as string | undefined;

  return { props: { groupId: groupId ?? null } };
};

export default function Home(
  props: InferGetServerSidePropsType<typeof getServerSideProps>,
) {
  const [selectedGroupId, setSelectedGroupId] = useState(props.groupId);

  const usersQuery = api.users.getAll.useQuery();
  const agentsQuery = api.agents.getAll.useQuery();
  const groupsQuery = api.groups.getAll.useQuery();
  const messagesFromGroupQuery = api.groups.getMessages.useQuery(
    { id: selectedGroupId! },
    { enabled: !!selectedGroupId },
  );

  return (
    <>
      <Head>
        <title>Create T3 App</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex min-h-screen flex-col items-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-slate-500 sm:text-[5rem]">
            Brain Control
          </h1>

          <section className="flex w-full flex-col gap-4">
            <h2 className="text-center text-3xl">Users</h2>

            {usersQuery.data ? (
              <Users users={usersQuery.data} />
            ) : (
              "Loading ..."
            )}
          </section>

          <section className="flex w-full flex-col gap-4">
            <h2 className="text-center text-3xl">Agents</h2>

            {agentsQuery.data ? (
              <Agents agents={agentsQuery.data} />
            ) : (
              "Loading ..."
            )}
          </section>

          <section className="flex w-full flex-col gap-4">
            <h2 className="text-center text-3xl">Groups & Messages</h2>
            <div className="flex min-h-[30rem] w-full gap-4 text-lg">
              <div className="shrink-0 rounded-md bg-gray-200 p-4">
                {groupsQuery.data ? (
                  <Groups
                    selectedGroupId={selectedGroupId}
                    setSelectedGroupId={setSelectedGroupId}
                    groups={groupsQuery.data}
                  />
                ) : (
                  "Loading ..."
                )}
              </div>

              <ScrollArea className="flex h-[30rem] grow items-center justify-center rounded-md bg-gray-200 p-4">
                {!selectedGroupId && (
                  <p className="my-auto text-center text-gray-500">
                    Select a group to see its messages
                  </p>
                )}
                <Messages messages={messagesFromGroupQuery.data ?? []} />
              </ScrollArea>
            </div>
            s
          </section>
        </div>
      </main>
    </>
  );
}

function Users({ users }: { users: RouterOutputs["users"]["getAll"] }) {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  return (
    <ul className="flex flex-wrap gap-4">
      {users.map((user) => {
        const createdAt = formatRelative(user.createdAt, new Date());
        const updatedAt = formatRelative(user.updatedAt, new Date());
        return (
          <Card className="grow" key={user.id}>
            <CardHeader>
              <CardTitle>{user.userName}</CardTitle>
              <CardDescription className="whitespace-pre-wrap">
                {`Created: ${createdAt}. Last updated: ${updatedAt}`}
              </CardDescription>
              <CardContent className="whitespace-pre-wrap p-0">
                <p>Whatsapp: {user.jid}</p>
                <p>Telegram: {user.telegramId}</p>
                <p>Total messages: {user.messages?.length}</p>
              </CardContent>
              <CardFooter className="p-0">
                <Button
                  onClick={() => setSelectedUserId(user.id)}
                  variant="outline"
                >
                  Edit
                </Button>
              </CardFooter>
            </CardHeader>
          </Card>
        );
      })}
      <UserEditDialog
        isOpen={!!selectedUserId}
        onClose={() => setSelectedUserId(null)}
        user={users.find((user) => user.id === selectedUserId)!}
      />
    </ul>
  );
}

function UserEditDialog({
  user,
  isOpen,
  onClose,
}: {
  user: RouterOutputs["users"]["getAll"][number];
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>
            {"Make changes to this user here. Click save when you're done."}
          </DialogDescription>
        </DialogHeader>

        <form className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Username
            </Label>
            <Input
              id="username"
              defaultValue={user.userName ?? ""}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="whatsappId" className="text-right">
              Whatsapp ID
            </Label>
            <Input
              id="whatsappId"
              defaultValue={user.jid ?? ""}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="telegramId" className="text-right">
              Telegram ID
            </Label>
            <Input
              id="telegramId"
              defaultValue={user.telegramId ?? ""}
              className="col-span-3"
            />
          </div>
        </form>

        <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Agents({ agents }: { agents: RouterOutputs["agents"]["getAll"] }) {
  return (
    <ul className="flex flex-col gap-4">
      {agents.map((agent) => {
        const isActive = false;
        return (
          <Card className={clsx(isActive && "border-blue-500")} key={agent.id}>
            <CardHeader>
              <CardTitle>{agent.name}</CardTitle>
              <CardDescription className="whitespace-pre-wrap">
                {agent.constitution}
              </CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </ul>
  );
}

function Groups({
  groups,
  selectedGroupId,
  setSelectedGroupId,
}: {
  groups: RouterOutputs["groups"]["getAll"];
  selectedGroupId: string | null;
  setSelectedGroupId: (id: string | null) => void;
}) {
  return (
    <ul className="flex flex-col gap-4">
      {groups.map((group) => {
        const isActive = group.id === selectedGroupId;
        return (
          <Link
            key={group.id}
            onClick={() => setSelectedGroupId(isActive ? null : group.id)}
            href={isActive ? "" : `/?groupId=${group.id}`}
            shallow
            scroll={false}
          >
            <Card className={clsx(isActive && "border-blue-500")}>
              <CardHeader>
                <CardTitle>{group.name}</CardTitle>
                <CardDescription>
                  {group.description} - {group.connector?.name}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        );
      })}
    </ul>
  );
}

function Messages({
  messages,
}: {
  messages: RouterOutputs["groups"]["getMessages"];
}) {
  const revertedMessages = [...messages].reverse();

  return (
    <ul className="flex flex-col gap-4">
      {revertedMessages.map((message) => {
        const isBrain = message.role === "assistant";
        return (
          <Card className="w-fit min-w-[16rem] max-w-[70%]" key={message.id}>
            <CardHeader className="p-4">
              <CardTitle>
                {isBrain
                  ? `Brain - Agent [${message.agent?.name}]`
                  : message.user?.userName}
              </CardTitle>
              <CardDescription>Role: {message.role}</CardDescription>
            </CardHeader>

            <CardContent>
              <p className="whitespace-pre-wrap">{message.content}</p>
            </CardContent>

            <CardFooter className="text-sm text-gray-500">
              <p className="ml-auto">
                {new Date(message.createdAt).toLocaleString()}
              </p>
            </CardFooter>
          </Card>
        );
      })}
    </ul>
  );
}
