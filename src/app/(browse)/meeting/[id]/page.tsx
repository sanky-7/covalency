import { Metadata, ResolvingMetadata } from "next";
import MeetingPage from "../_components/MeetingPage";

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({
  params: { id },
}: PageProps): Promise<Metadata> {
  return {
    title: `Meeting ${id}`,
  };
}

export default function Page({ params: { id } }: PageProps) {
  return <MeetingPage id={id} />;
}
