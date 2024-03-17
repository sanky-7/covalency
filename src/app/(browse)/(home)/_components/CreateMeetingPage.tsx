"use client";

import { getUserId } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import {
  Call,
  useStreamVideoClient,
  MemberRequest,
} from "@stream-io/video-react-sdk";
import { Clipboard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CreateMeetingPage() {
  const [description, setDescription] = useState("");
  const [startTimeInput, setStartTimeInput] = useState("");
  const [participants, setParticipants] = useState("");

  const [call, setCall] = useState<Call>();

  const client = useStreamVideoClient();

  const { user } = useUser();

  async function createMeeting() {
    if (!client || !user) {
      return;
    }

    try {
      const id = crypto.randomUUID();
      const callType = participants ? "private-meeting" : "default";
      const call = client.call(callType, id);

      const memberEmails = participants.split(",").map((email) => email.trim());

      const memberIds = await getUserId(memberEmails);

      const members: MemberRequest[] = memberIds
        .map((id) => ({ user_id: id, role: "call_member" }))
        .concat({ user_id: user.id, role: "call_member" })
        .filter(
          (v, i, a) => a.findIndex((v2) => v2.user_id === v.user_id) === i
        );

      const starts_at = new Date(startTimeInput || Date.now()).toISOString();

      await call.getOrCreate({
        data: {
          starts_at,
          members,
          custom: { description: description },
        },
      });

      setCall(call);
      toast.success("Meeting created!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create meeting!");
    }
  }

  if (!client || !user) {
    return <Loader2 />;
  }

  return (
    <div className="flex flex-col items-center w-full pb-20">
      <Card className="m-5 w-full max-w-5xl">
        <CardHeader>
          <CardTitle className="text-4xl sm:text-5xl">
            Welcome <span className="text-red-400">{user?.username}</span>
          </CardTitle>
          <CardDescription className="text-2xl sm:text-3xl pt-6 flex justify-center">
            Create a new meeting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <DescriptionInput value={description} onChange={setDescription} />
            <StartTimeInput
              value={startTimeInput}
              onChange={setStartTimeInput}
            />
            <ParticipantsInput
              value={participants}
              onChange={setParticipants}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button
            onClick={createMeeting}
            className="w-full max-w-2xl text-xl rounded-[5px]"
          >
            Create meeting
          </Button>
        </CardFooter>
      </Card>
      {call && <MeetingLink call={call} />}
    </div>
  );
}

interface DescriptionInputProps {
  value: string;
  onChange: (value: string) => void;
}

function DescriptionInput({ value, onChange }: DescriptionInputProps) {
  const [active, setActive] = useState(false);

  return (
    <div className="space-y-2 text-xl py-3">
      <div className="font-medium">Meeting info:</div>
      <label className="flex items-center gap-1.5 text-gray-400">
        <input
          type="checkbox"
          checked={active}
          onChange={(e) => {
            setActive(e.target.checked);
            onChange("");
          }}
        />
        Add description
      </label>
      {active && (
        <label className="block space-y-1">
          <span className="font-medium">Description</span>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            maxLength={500}
            className="w-full rounded-md border-white p-2 bg-background/50"
          />
        </label>
      )}
    </div>
  );
}

interface StartTimeInputProps {
  value: string;
  onChange: (value: string) => void;
}

function StartTimeInput({ value, onChange }: StartTimeInputProps) {
  const [active, setActive] = useState(false);

  const dateTimeLocalNow = new Date(
    new Date().getTime() - new Date().getTimezoneOffset() * 60_000
  )
    .toISOString()
    .slice(0, 16);

  return (
    <div className="space-y-2 text-xl pb-3">
      <div className="font-medium">Start time:</div>
      <label className="flex items-center gap-1.5 text-gray-400">
        <input
          type="radio"
          checked={!active}
          onChange={(e) => {
            setActive(false);
            onChange("");
          }}
        />
        Start meeting now
      </label>
      <label className="flex items-center gap-1.5 text-gray-400">
        <input
          type="radio"
          checked={active}
          onChange={(e) => {
            setActive(true);
            onChange(dateTimeLocalNow);
          }}
        />
        Schedule meeting
      </label>
      {active && (
        <label className="block space-y-1">
          <span className="font-medium">Time</span>
          <input
            type="datetime-local"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            min={dateTimeLocalNow}
            className="w-full rounded-[5px] border border-gray-300 bg-background/50"
          />
        </label>
      )}
    </div>
  );
}

interface ParticipantsInputProps {
  value: string;
  onChange: (value: string) => void;
}

function ParticipantsInput({ value, onChange }: ParticipantsInputProps) {
  const [active, setActive] = useState(false);

  return (
    <div className="space-y-2 text-xl">
      <div className="font-medium">Participants:</div>
      <label className="flex items-center gap-1.5 text-gray-400">
        <input
          type="radio"
          checked={!active}
          onChange={() => {
            setActive(false);
            onChange("");
          }}
        />
        Everyone with link can join
      </label>
      <label className="flex items-center gap-1.5 text-gray-400">
        <input type="radio" checked={active} onChange={() => setActive(true)} />
        Private meeting
      </label>
      {active && (
        <label className="block space-y-1">
          <span className="font-medium">Add participant emails</span>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter emails separated by commas"
            className="w-full rounded-md border-white p-2 bg-background/50"
          />
        </label>
      )}
    </div>
  );
}

interface MeetingLinkProps {
  call: Call;
}

function MeetingLink({ call }: MeetingLinkProps) {
  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${call.id}`;

  return (
    <Card className="w-full max-w-5xl pb-5">
      <CardHeader>
        <CardTitle className="text-red-400">Invite Link</CardTitle>
      </CardHeader>
      <div className="flex flex-col items-center sm:gap-5 sm:flex-row">
        <CardContent>
          <Link href={meetingLink} className="text-gray-200 font-medium hover:underline">
            {meetingLink}
          </Link>
        </CardContent>
        <CardFooter>
          <Button
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(meetingLink);
              toast.success("Link copied to clipboard!");
            }}
          >
            <Clipboard />
          </Button>
        </CardFooter>
        <Button variant="outline" className="rounded-[5px] sm:mb-5">
            <a href={getMailToLink(
              meetingLink,
              call.state.startsAt,
              call.state.custom.description,
            )}
              target="_blank"
            >
              Share via email
            </a>
        </Button>
      </div>
    </Card>
  );
}

function getMailToLink (
  meetingLink: string,
  startsAt?: Date,
  description?: string,
) {
  const startsDateFormatted = startsAt ? startsAt.toLocaleString("en-US", {
    dateStyle: "full",
    timeStyle: "short",
  })
  : undefined;

  const subject = "Join my meeting" + {startsDateFormatted} ? ` at ${startsDateFormatted}` : "";

  const body = `Join my meeting at ${meetingLink}.` + {startsDateFormatted} ? `\n\nThe meeting starts at ${startsDateFormatted}.`  : "" + {description} ? `\n\nDescription:: ${description}` : "";

  return `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}