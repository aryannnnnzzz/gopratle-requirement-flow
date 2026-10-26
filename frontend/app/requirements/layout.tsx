import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Event Requirements Feed – GoPratle",
  description:
    "Browse verified event requirements for Planners, Performers, and Crew on GoPratle. Filter by category and find your next opportunity.",
};

export default function RequirementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
