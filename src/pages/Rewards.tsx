import { RewardsTable } from '../components/features/rewards/RewardsTable';

export function Rewards() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center animate-slide-up pt-8 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gradient-primary mb-2 animate-float">
          Rewards
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Track your achievements and claim your earned rewards
        </p>
      </div>

      <RewardsTable />
    </div>
  );
}
