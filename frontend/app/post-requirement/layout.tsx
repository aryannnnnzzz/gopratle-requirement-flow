import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Post a Requirement – GoPratle",
  description:
    "Use the GoPratle 4-step wizard to post your event requirement for Planners, Performers, or Crew. Draft is auto-saved to your session.",
};

export default function PostRequirementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
