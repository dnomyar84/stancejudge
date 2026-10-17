import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import referenceVideos from "../src/data/reference-videos.json";
import { placeholderCanonical } from "../src/lib/wushu/canonical";
import { sanDuanChangQuan } from "../src/lib/wushu/routines/san-duan-chang-quan";
import { siDuanJian } from "../src/lib/wushu/routines/si-duan-jian";

const ROUTINES = [sanDuanChangQuan, siDuanJian];
import { parseYouTubeVideoId } from "../src/lib/youtube";

const outDir = join(process.cwd(), "src/data/canonical");
mkdirSync(outDir, { recursive: true });

for (const routine of ROUTINES) {
  const ref = referenceVideos[routine.id as keyof typeof referenceVideos];
  const youtubeUrl = ref?.youtubeUrl?.trim() || null;
  const youtubeId = youtubeUrl ? parseYouTubeVideoId(youtubeUrl) : null;
  const canonical = placeholderCanonical(routine, {
    youtubeId,
    youtubeUrl,
    label: ref?.label,
  });
  writeFileSync(
    join(outDir, `${routine.id}.json`),
    `${JSON.stringify(canonical, null, 2)}\n`,
  );
  console.log(`Wrote ${routine.id}.json (calibrated=${canonical.calibrated})`);
}
