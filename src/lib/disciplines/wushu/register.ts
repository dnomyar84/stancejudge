import { registerVisualCoachRoutine } from "@/lib/motion/visual-coach/registry";
import {
  buildWuBuQuanVisualCoach,
  getWuBuQuanMoveChoreography,
} from "@/lib/disciplines/wushu/visual-coach/wu-bu-quan";

export function registerWushuDiscipline(): void {
  registerVisualCoachRoutine({
    routineId: "wu-bu-quan",
    getRoutineVisualCoach: buildWuBuQuanVisualCoach,
    getMoveChoreography: getWuBuQuanMoveChoreography,
  });
}
