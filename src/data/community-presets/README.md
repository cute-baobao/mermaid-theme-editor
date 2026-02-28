# 社区主题贡献指南

感谢你愿意为 Mermaid Theme Editor 贡献主题！社区主题通过 Pull Request 方式提交，合并后自动部署。

## 贡献步骤

1. **Fork** 本仓库
2. 在 `src/data/community-presets/` 目录下创建一个 JSON 文件，命名格式：`your-theme-name.json`
3. 按照下方 Schema 填写主题配置
4. 提交 PR，等待 CI 校验通过并合并

## 主题 JSON Schema

```json
{
  "id": "my-theme",
  "name": "My Theme",
  "description": "一句话描述你的主题",
  "author": "你的 GitHub 用户名",
  "tags": ["blue", "minimal"],
  "styles": {
    "light": {
      "background": "#ffffff",
      "primaryColor": "#your-hex-color",
      "primaryTextColor": "#333333",
      "lineColor": "#666666",
      "fontFamily": "trebuchet ms, verdana, arial",
      "fontSize": "16px"
    },
    "dark": {
      "darkMode": true,
      "background": "#1a1a1a",
      "primaryColor": "#your-dark-hex-color",
      "primaryTextColor": "#dddddd",
      "lineColor": "#999999",
      "fontFamily": "trebuchet ms, verdana, arial",
      "fontSize": "16px"
    }
  }
}
```

## 重要约束

- ⚠️ **颜色必须使用 HEX 格式**（如 `#ff0000`），不支持 CSS 颜色名（如 `red`）
- ⚠️ `id` 必须在所有预设中唯一，建议使用 `author-themename` 格式（如 `alice-ocean`）
- `darkMode: true` 必须在 `dark` 配置中设置，影响 Mermaid 内部派生色计算
- 所有字段对应 Mermaid 官方 `themeVariables`，详见 [官方文档](https://mermaid.js.org/config/theming.html)

## 可用的 themeVariables

| 变量 | 说明 |
|---|---|
| `background` | 图表背景色 |
| `primaryColor` | 主节点背景色（派生 primaryBorderColor） |
| `secondaryColor` | 次要节点背景色 |
| `tertiaryColor` | 第三节点背景色（子图背景） |
| `primaryTextColor` | 节点文字颜色 |
| `textColor` | 标签/信号文字颜色 |
| `lineColor` | 连接线颜色 |
| `fontFamily` | 字体 |
| `fontSize` | 字号（如 `16px`） |
| `noteBkgColor` | 备注背景色 |
| `noteTextColor` | 备注文字颜色 |
| `clusterBkg` | 子图背景色 |
| `actorBkg` | 时序图 Actor 背景 |
| `signalColor` | 时序图信号颜色 |

完整变量列表参考 [Mermaid 官方主题文档](https://mermaid.js.org/config/theming.html#theme-variables)。
