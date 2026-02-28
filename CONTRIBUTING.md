# 贡献指南

## 提交社区主题

请参阅 [src/data/community-presets/README.md](src/data/community-presets/README.md) 了解主题 JSON 格式要求。

### 快速步骤

1. Fork 此仓库
2. 创建新分支：`git checkout -b theme/your-theme-name`
3. 在 `src/data/community-presets/` 添加你的主题 JSON 文件
4. 确保 JSON 通过格式校验（CI 会自动检查）
5. 提交 Pull Request

### PR 说明模板

提交 PR 时请包含：
- 主题名称和灵感来源
- 截图或主题颜色预览
- 适用场景（如"适合打印"、"高对比度"等）

## 开发本地环境

```bash
npm install
npm run dev
```

## 校验主题 JSON

```bash
npm run validate-presets
```
