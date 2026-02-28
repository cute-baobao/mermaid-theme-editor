import type { ThemePropertyGroup } from "@/types/theme"

/**
 * Mermaid themeVariables property groups.
 * Only 'base' theme supports customization via themeVariables.
 * Priority: expose seed/root variables first; derived variables are labeled advanced.
 */
export const THEME_PROPERTY_GROUPS: ThemePropertyGroup[] = [
  {
    id: "core",
    label: "核心颜色",
    description: "基础种子颜色，许多其他颜色会自动从这些值派生",
    properties: [
      {
        key: "background",
        label: "背景色",
        description: "图表背景色，影响派生颜色的计算",
        type: "color",
      },
      {
        key: "primaryColor",
        label: "主色",
        description: "节点背景的主色，会派生出 primaryBorderColor 和 mainBkg",
        type: "color",
      },
      {
        key: "secondaryColor",
        label: "次要色",
        description: "次要节点背景色，会派生出 secondaryBorderColor",
        type: "color",
      },
      {
        key: "tertiaryColor",
        label: "第三色",
        description: "第三节点背景色，会派生出 tertiaryBorderColor（子图背景默认用此色）",
        type: "color",
      },
    ],
  },
  {
    id: "text-lines",
    label: "文字与线条",
    description: "控制图表中文字和连接线的颜色",
    properties: [
      {
        key: "primaryTextColor",
        label: "主要文字色",
        description: "节点内文字的主要颜色",
        type: "color",
      },
      {
        key: "textColor",
        label: "标签文字色",
        description: "图表标签、信号等文字的颜色（派生自 primaryTextColor）",
        type: "color",
      },
      {
        key: "lineColor",
        label: "连接线颜色",
        description: "节点间连接线的颜色（派生自 background）",
        type: "color",
      },
      {
        key: "secondaryTextColor",
        label: "次要文字色",
        description: "次要节点中的文字颜色",
        type: "color",
        advanced: true,
      },
      {
        key: "tertiaryTextColor",
        label: "第三文字色",
        description: "第三节点中的文字颜色",
        type: "color",
        advanced: true,
      },
    ],
  },
  {
    id: "typography",
    label: "字体",
    description: "图表中的字体设置",
    properties: [
      {
        key: "fontFamily",
        label: "字体族",
        description: "图表文字的字体，默认为 trebuchet ms, verdana, arial",
        type: "font-family",
      },
      {
        key: "fontSize",
        label: "字号",
        description: "图表文字大小（如 16px）",
        type: "font-size",
      },
    ],
  },
  {
    id: "notes",
    label: "备注样式",
    description: "备注/注释框的颜色样式",
    properties: [
      {
        key: "noteBkgColor",
        label: "备注背景色",
        type: "color",
      },
      {
        key: "noteTextColor",
        label: "备注文字色",
        type: "color",
      },
      {
        key: "noteBorderColor",
        label: "备注边框色",
        description: "派生自 noteBkgColor",
        type: "color",
        advanced: true,
      },
    ],
  },
  {
    id: "flowchart",
    label: "流程图",
    description: "flowchart / graph 图表专属样式",
    properties: [
      {
        key: "clusterBkg",
        label: "子图背景色",
        description: "subgraph 子图的背景色（派生自 tertiaryColor）",
        type: "color",
      },
      {
        key: "clusterBorder",
        label: "子图边框色",
        description: "派生自 tertiaryBorderColor",
        type: "color",
      },
      {
        key: "edgeLabelBackground",
        label: "边标签背景色",
        description: "连接线标签的背景色",
        type: "color",
      },
      {
        key: "titleColor",
        label: "标题颜色",
        description: "图表标题颜色（派生自 tertiaryTextColor）",
        type: "color",
      },
      {
        key: "nodeBorder",
        label: "节点边框色",
        description: "派生自 primaryBorderColor",
        type: "color",
        advanced: true,
      },
      {
        key: "nodeTextColor",
        label: "节点文字色",
        description: "派生自 primaryTextColor",
        type: "color",
        advanced: true,
      },
    ],
  },
  {
    id: "sequence",
    label: "时序图",
    description: "sequenceDiagram 图表专属样式",
    properties: [
      {
        key: "actorBkg",
        label: "Actor 背景色",
        description: "派生自 mainBkg",
        type: "color",
      },
      {
        key: "actorBorder",
        label: "Actor 边框色",
        description: "派生自 primaryBorderColor",
        type: "color",
      },
      {
        key: "actorTextColor",
        label: "Actor 文字色",
        description: "派生自 primaryTextColor",
        type: "color",
      },
      {
        key: "signalColor",
        label: "信号线颜色",
        description: "派生自 textColor",
        type: "color",
      },
      {
        key: "activationBkgColor",
        label: "激活框背景色",
        description: "派生自 secondaryColor",
        type: "color",
        advanced: true,
      },
      {
        key: "sequenceNumberColor",
        label: "序号颜色",
        description: "派生自 lineColor",
        type: "color",
        advanced: true,
      },
    ],
  },
]

/** All available font families */
export const FONT_FAMILY_OPTIONS = [
  { value: "trebuchet ms, verdana, arial", label: "Trebuchet MS (默认)" },
  { value: "ui-sans-serif, system-ui, sans-serif", label: "System UI" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Courier New, monospace", label: "Courier New" },
  { value: "Arial, sans-serif", label: "Arial" },
  { value: "Helvetica Neue, Helvetica, sans-serif", label: "Helvetica Neue" },
]
