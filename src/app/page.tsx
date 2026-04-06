import { FeedbackForm } from "@/components/FeedbackForm";
import { getTeamConfig, getIntuitValues } from "@/lib/config";
import { RELATIONSHIPS } from "@/lib/constants";

export default function Home() {
  const { members } = getTeamConfig();
  const intuitValues = getIntuitValues();
  const relationships = [...RELATIONSHIPS];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
        <header className="mb-10 text-center sm:text-left">
          <p className="text-sm font-medium uppercase tracking-wider text-sky-400">
            Team FORWARD
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Year End Feedback Form
          </h1>
          <p className="mt-3 max-w-xl text-zinc-400">
            Share structured feedback for your teammates: ratings, the Intuit value they most
            embody, and written reflections. Submissions are stored securely for year-end
            conversations.
          </p>
        </header>

        <FeedbackForm
          members={members}
          intuitValues={intuitValues}
          relationships={relationships}
        />
      </div>
    </div>
  );
}
