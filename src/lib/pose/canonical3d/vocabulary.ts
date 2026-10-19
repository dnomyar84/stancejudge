/** Expanded wushu leg stance vocabulary (3D-first; supersedes coarse enums over time). */

export type LegStanceKind =
  | "bing_bu"
  | "gong_bu"
  | "ma_bu"
  | "xu_bu"
  | "xie_bu"
  | "pu_bu"
  | "ding_bu"
  | "du_li_bu"
  | "ti_xi"
  | "jiao_bu"
  | "gui_bu"
  | "heng_dang_bu"
  | "unknown";

export type FootAimKind =
  | "toe_forward"
  | "toe_out_45"
  | "toe_in_parallel"
  | "heel_lift"
  | "foot_flat"
  | "ball_of_foot"
  | "unknown";

export type HandShapeKind =
  | "quan"
  | "zhang"
  | "gou_shou"
  | "diao_shou"
  | "jia_shou"
  | "chuan_zhang"
  | "tui_zhang"
  | "an_zhang"
  | "bao_quan"
  | "liang_zhang"
  | "jian_zhi"
  | "chi_jian"
  | "open_relaxed"
  | "unknown";

const LEG_ZH: Record<LegStanceKind, string> = {
  bing_bu: "并步",
  gong_bu: "弓步",
  ma_bu: "马步",
  xu_bu: "虚步",
  xie_bu: "歇步",
  pu_bu: "仆步",
  ding_bu: "丁步",
  du_li_bu: "独立步",
  ti_xi: "提膝",
  jiao_bu: "交叉步",
  gui_bu: "跪步",
  heng_dang_bu: "横裆步",
  unknown: "—",
};

const FOOT_ZH: Record<FootAimKind, string> = {
  toe_forward: "脚尖朝前",
  toe_out_45: "外八约45°",
  toe_in_parallel: "两脚平行",
  heel_lift: "脚跟提起",
  foot_flat: "全脚掌着地",
  ball_of_foot: "前脚掌着地",
  unknown: "—",
};

const HAND_ZH: Record<HandShapeKind, string> = {
  quan: "拳",
  zhang: "掌",
  gou_shou: "勾手",
  diao_shou: "刁手",
  jia_shou: "架手",
  chuan_zhang: "穿掌",
  tui_zhang: "推掌",
  an_zhang: "按掌",
  bao_quan: "抱拳",
  liang_zhang: "亮掌",
  jian_zhi: "剑指",
  chi_jian: "持剑",
  open_relaxed: "自然掌",
  unknown: "—",
};

export function legStanceLabelZh(k: LegStanceKind): string {
  return LEG_ZH[k];
}

export function footAimLabelZh(k: FootAimKind): string {
  return FOOT_ZH[k];
}

export function handShapeLabelZh(k: HandShapeKind): string {
  return HAND_ZH[k];
}
