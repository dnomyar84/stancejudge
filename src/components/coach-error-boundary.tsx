"use client";

import { Component, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

type Props = { children: ReactNode; onBack?: () => void; title?: string };

export class CoachErrorBoundary extends Component<
  Props,
  { error: Error | null }
> {
  state = { error: null as Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-gradient-to-b from-background via-background to-cyan-950/25 px-6 py-12 text-center">
          <h2 className="text-lg font-semibold">
            {this.props.title ?? "Coach view failed to load"}
          </h2>
          <p className="max-w-md text-sm text-muted-foreground">
            {this.state.error.message}
          </p>
          {this.props.onBack && (
            <Button type="button" variant="secondary" onClick={this.props.onBack}>
              Back to home
            </Button>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}
