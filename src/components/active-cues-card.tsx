import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ChoreographyCue } from "@/lib/pose/canonical3d/choreography";

type ActiveCuesCardProps = {
  cues: ChoreographyCue[];
};

export function ActiveCuesCard({ cues }: ActiveCuesCardProps) {
  if (cues.length === 0) return null;

  return (
    <Card className="border-cyan-500/30">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Active cues</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {cues.map((c) => (
          <div key={c.id}>
            <p className="font-medium">{c.labelZh}</p>
            <p className="text-xs text-muted-foreground">{c.descriptionZh}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
