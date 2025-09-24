import { CreateToken } from '../components/features/tokens/CreateToken';

export function Create() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center animate-slide-up pt-8 pb-4">
        <h1 className="text-3xl md:text-4xl font-bold text-gradient-primary mb-2 animate-float">
          Create Token
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Launch your own meme coin and join the revolution of decentralized finance
        </p>
      </div>

      <CreateToken />
    </div>
  );
}
