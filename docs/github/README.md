# GROUND GitHub 仓库与发布资料

这个项目已经整理为一个完整主仓库，包含可运行的网站、原始目录数据、API、钱包接口、工具、文档和 CI。项目说明按网站、数据、市场、钱包、API、方法分层组织。

## 已准备的文件

- 根目录 `README.md`：黑绿品牌封面、叙事、六个模块入口、产品截图和当前阶段。
- `../modules/`：六个组件的独立阅读入口。
- `../DEVELOPMENT.md`：完整开发指南，保留启动、API、功能和后续接入说明。
- `assets/`：与网站一致的品牌封面、标记和架构图。
- `PROFILE.md`：账号或组织主页的英文介绍，采用 GROUND 叙事。
- `REFERENCE.md`：原项目 GitHub 的只读核对记录。
- `../THESIS.md`、`../METHOD.md`、`../API.md`、`../ARCHITECTURE.md`、`../ROADMAP.md`：公开项目资料。
- `../../.github/workflows/ci.yml`：代码上传后执行自动检查；不自动部署。
- `../../CONTRIBUTING.md` 和 `../../.env.example`：开发贡献说明和公开环境模板。

## 发布到代码仓库

项目拥有者账号为 [johh7653-cell](https://github.com/johh7653-cell)，公开主仓库为 [johh7653-cell/ground-rwa](https://github.com/johh7653-cell/ground-rwa)。完整源码、目录数据、原始身份图片、文档和自动检查统一维护在这个仓库中。

后续更新从本地仓库提交并推送，或通过 Pull Request 合并。仓库保留现有 README、忽略规则和 MIT 许可。GitHub Actions 会在推送和 Pull Request 时执行检查；托管检查结果以仓库的 [Actions 页面](https://github.com/johh7653-cell/ground-rwa/actions) 为准。本地检查通过不代表某次托管运行已经通过。

## GROUND 账号主页

[GROUND 账号主页](https://github.com/johh7653-cell) 使用同名公开仓库 [johh7653-cell/johh7653-cell](https://github.com/johh7653-cell/johh7653-cell) 的根目录 `README.md`。`PROFILE.md` 是它的项目内文案副本；同名仓库包含主页显示需要的原始 Logo 和流程图。

账号名称、简介和头像采用拥有者指定的 GROUND 品牌资料。账号主页用于项目介绍，`ground-rwa` 仓库用于完整源码与开发文档。网站域名尚未确定。

## 项目渠道

`src/lib/project.ts` 中的 GitHub 链接使用这个主仓库地址。网站域名、CA、X、浏览器和购买链接仍待拥有者提供，空字段继续隐藏；不会恢复原项目的地址或社交跳转。发布源码与发布网站是两个独立步骤，此仓库的 CI 不会自动部署网站。

钱包连接和主网 SOL 查询已经实现。Trade 是真实行情参考的买入预览，真实买入仍未接入。路线图里的探测、成交评分及交易执行是后续开发项，发布文案没有把它们写成现有服务。
