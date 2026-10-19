import type { ChoreographyCue } from "../canonical3d/choreography";

function cue(
  id: string,
  layer: ChoreographyCue["layer"],
  labelZh: string,
  labelEn: string,
  descriptionZh: string,
): ChoreographyCue {
  return { id, layer, labelZh, labelEn, descriptionZh };
}

/** wbq-02 弓步冲拳 */
export const WBQ02_STEP_CUES: ChoreographyCue[] = [
  cue(
    "02-leg-step",
    "legs",
    "左弓步",
    "Left bow step",
    "左脚向左迈出成左弓步：左腿屈膝、大腿接近水平，脚尖微内扣；右腿蹬直，全脚掌着地。",
  ),
  cue(
    "02-hand-lou",
    "hands",
    "左搂手抱拳",
    "Left hand to waist",
    "左手向左平搂（或收抱）至腰间，拳心向上，肘贴肋侧。",
  ),
  cue(
    "02-punch-right",
    "hands",
    "右冲拳",
    "Right punch",
    "右拳向前平冲，拳心向下，力达拳面；与左弓步同时完成，目视前方。",
  ),
];

export const WBQ02_PUNCH_FLOW_CUES: ChoreographyCue[] = [
  cue(
    "02-waist-guard",
    "hands",
    "双拳抱腰",
    "Fists at waist",
    "弓步定势时左拳抱腰，右拳置于腰间预备。",
  ),
  cue(
    "02-punch-extend",
    "hands",
    "右拳出拳",
    "Extend punch",
    "右拳沿中线向前冲拳，肘勿过高，拳心向下。",
  ),
  cue(
    "02-ding",
    "whole",
    "弓步冲拳定势",
    "Bow punch finish",
    "左弓步、右冲拳、左抱腰，前腿弓后腿绷，挺胸立腰。",
  ),
];

/** wbq-03 弹踢冲拳 */
export const WBQ03_CHAMBER_CUES: ChoreographyCue[] = [
  cue(
    "03-weight-left",
    "legs",
    "重心前移",
    "Shift to left leg",
    "重心移至左腿，左腿微屈支撑，上身正直。",
  ),
  cue(
    "03-knee-right",
    "legs",
    "右腿提膝",
    "Right knee lift",
    "右腿屈膝提起，大腿接近水平，为弹踢做准备。",
  ),
  cue(
    "03-punch-left",
    "hands",
    "左冲拳",
    "Left punch",
    "左拳向前平冲，右拳同时收抱腰间。",
  ),
];

export const WBQ03_KICK_CUES: ChoreographyCue[] = [
  cue(
    "03-snap-kick",
    "legs",
    "右腿弹踢",
    "Right snap kick",
    "右腿由屈到伸向前弹击，脚面绷平，力达脚尖，弹击有寸劲。",
  ),
  cue(
    "03-upright",
    "torso",
    "上身正直",
    "Upright torso",
    "弹踢时立身，收髋，目视前方。",
  ),
];

export const WBQ03_DING_CUES: ChoreographyCue[] = [
  cue(
    "03-ding",
    "whole",
    "弹踢冲拳定势",
    "Snap kick finish",
    "弹踢与左冲拳同时到位，右拳抱腰，支撑腿稳定。",
  ),
];

/** wbq-04 马步架打 */
export const WBQ04_MA_BU_CUES: ChoreographyCue[] = [
  cue(
    "04-land-turn",
    "legs",
    "右转马步",
    "Turn to horse stance",
    "右脚落地，身体左转约九十度，两脚开立下蹲成马步，重心居中。",
  ),
  cue(
    "04-jia-zhang",
    "hands",
    "左掌上架",
    "Left palm block up",
    "左拳变掌，屈臂向上、向体外侧撩架，掌指向上。",
  ),
  cue(
    "04-punch-right",
    "hands",
    "右冲拳",
    "Right side punch",
    "右拳向身体右侧平冲，拳心向下，头眼随拳看右方。",
  ),
];

export const WBQ04_JIA_DA_CUES: ChoreographyCue[] = [
  cue(
    "04-ma-ding",
    "legs",
    "马步定势",
    "Horse stance set",
    "马步开立，膝不过尖，挺胸塌腰，两脚抓地。",
  ),
  cue(
    "04-jia-da",
    "whole",
    "架打定势",
    "Block and strike",
    "左掌上架护头，右拳侧向冲拳，上下协调。",
  ),
];

/** wbq-05 歇步冲拳 */
export const WBQ05_GAI_CUES: ChoreographyCue[] = [
  cue(
    "05-insert-step",
    "legs",
    "后插步",
    "Insert step",
    "左脚向右脚后方插步，重心下沉，准备转体。",
  ),
  cue(
    "05-gai-zhang",
    "hands",
    "右掌下盖",
    "Right palm cover",
    "右拳变掌，向左下盖按，掌外沿向前，身体左转。",
  ),
  cue(
    "05-left-waist",
    "hands",
    "左拳抱腰",
    "Left fist to waist",
    "左拳收抱左侧腰间，目视右掌。",
  ),
];

export const WBQ05_XIE_CUES: ChoreographyCue[] = [
  cue(
    "05-xie-bu",
    "legs",
    "歇步下蹲",
    "Cross stance sit",
    "两腿交叉靠拢全蹲成歇步，臀部贴实，两腿贴紧，挺胸立腰。",
  ),
  cue(
    "05-punch-left",
    "hands",
    "左冲拳",
    "Left punch",
    "左拳向前平冲，拳心向下；右拳收抱腰间，目视左拳。",
  ),
];

/** wbq-06 提膝穿掌 */
export const WBQ06_QI_LI_CUES: ChoreographyCue[] = [
  cue(
    "06-stand-turn",
    "whole",
    "起立转体",
    "Stand and turn",
    "由歇步起立，身体左转，面向前方。",
  ),
  cue(
    "06-palm-prep",
    "hands",
    "穿掌预备",
    "Palm thrust prep",
    "左拳变掌收至右腋下；右拳变掌在左手背侧向前穿出，手心向上。",
  ),
];

export const WBQ06_TI_XI_CUES: ChoreographyCue[] = [
  cue(
    "06-ti-xi-left",
    "legs",
    "左提膝",
    "Left knee lift",
    "左腿屈膝提起，脚面绷直，支撑腿伸直站稳。",
  ),
  cue(
    "06-chuan-zhang",
    "hands",
    "穿掌",
    "Palm thrust",
    "右掌经左手背向前穿出，掌心向上，与提膝同时完成，目视右掌。",
  ),
];

export const WBQ06_DING_CUES: ChoreographyCue[] = [
  cue(
    "06-ding",
    "whole",
    "提膝穿掌定势",
    "Knee lift palm finish",
    "提膝、穿掌定势，立身平衡，支撑脚实。",
  ),
];

/** wbq-07 仆步穿掌 */
export const WBQ07_LUO_CUES: ChoreographyCue[] = [
  cue(
    "07-land-pu",
    "legs",
    "落仆步",
    "Drop to pu bu",
    "左脚向侧前方落步，左腿伸直平仆接近地面，右腿全蹲，全脚着地。",
  ),
  cue(
    "07-body-up",
    "torso",
    "立身开髋",
    "Open hips upright",
    "挺胸立腰，开髋，仆步时上身勿前倾过多。",
  ),
];

export const WBQ07_CHUAN_CUES: ChoreographyCue[] = [
  cue(
    "07-chuan-down",
    "hands",
    "沿腿穿掌",
    "Palm along leg",
    "左掌指朝前，沿左腿内侧向下穿至左脚面，臂伸直。",
  ),
  cue(
    "07-look-left",
    "whole",
    "目视左掌",
    "Eyes on left palm",
    "穿掌定势，目视左掌方向。",
  ),
];

/** wbq-08 虚步挑掌 */
export const WBQ08_SHANG_CUES: ChoreographyCue[] = [
  cue(
    "08-rise-step",
    "legs",
    "起身上步",
    "Rise and step",
    "由仆步起身，右脚向前上步。",
  ),
  cue(
    "08-xu-bu",
    "legs",
    "右虚步",
    "Right empty stance",
    "左腿屈膝前弓，右脚前脚掌虚点地面成右虚步，虚实分明。",
  ),
];

export const WBQ08_TIAO_CUES: ChoreographyCue[] = [
  cue(
    "08-gou-shou",
    "hands",
    "左勾手",
    "Left hook hand",
    "左手向后划弧成勾手，屈腕，勾尖向后。",
  ),
  cue(
    "08-tiao-zhang",
    "hands",
    "右挑掌",
    "Right rising palm",
    "右手顺右腿外侧向上挑掌，掌指向上，肘微屈。",
  ),
  cue(
    "08-look-front",
    "whole",
    "目视前方",
    "Eyes forward",
    "虚步挑掌定势，目视前方。",
  ),
];

/** wbq-09 并步抱拳 */
export const WBQ09_BING_CUES: ChoreographyCue[] = [
  cue(
    "09-close-feet",
    "legs",
    "收脚并步",
    "Close feet",
    "左脚向右脚并拢成并步，两腿伸直，脚尖朝前。",
  ),
  cue(
    "09-gather-hands",
    "hands",
    "勾手收掌",
    "Gather hands",
    "左勾手、右挑掌变拳，两臂回收至体侧。",
  ),
];

export const WBQ09_BAO_CUES: ChoreographyCue[] = [
  cue(
    "09-bao-quan",
    "hands",
    "抱拳收势",
    "Embrace fists close",
    "两拳抱于腰间，拳心向上，肘侧视约四十五度，目视前方。",
  ),
  cue(
    "09-ding",
    "whole",
    "收势定势",
    "Closing posture",
    "并步抱拳，呼吸自然，精神集中。",
  ),
];
