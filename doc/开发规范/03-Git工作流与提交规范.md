# Git 工作流与提交规范

本规范基于 Gitflow 工作流，旨在统一团队的代码管理路径。

## 主要分支

### main (或 master)
- 包含生产环境就绪的代码。
- **禁止**直接提交到 main 分支。
- 仅接受来自以下分支的合并：
    - `hotfix/*` 分支
    - `release/*` 分支
- 每次合并后必须打上版本号标签 (Tag)。

### develop
- 主开发分支。
- 包含最新的已交付开发变更。
- 是所有 feature 分支的源分支。
- **禁止**直接提交到 develop 分支。

## 辅助分支

### feature/* (功能分支)
- 源分支：`develop`
- 合并回：`develop`
- 命名规范：`feature/[issue-id]-描述名称`
- 示例：`feature/123-user-authentication`
- 在创建 Pull Request 前必须确保已同步 `develop` 的最新代码。
- 合并后删除该分支。

### release/* (发布分支)
- 源分支：`develop`
- 合并回：`main` 和 `develop`
- 命名规范：`release/vX.Y.Z`
- 示例：`release/v1.2.0`
- 仅允许 Bug 修复、文档完善和发布相关的任务。
- **禁止**在该分支开发新功能。
- 合并后删除该分支。

### hotfix/* (热修复分支)
- 源分支：`main`
- 合并回：`main` 和 `develop`
- 命名规范：`hotfix/vX.Y.Z`
- 示例：`hotfix/v1.2.1`
- 仅用于修复紧急的生产环境问题。
- 合并后删除该分支。

## 提交信息规范 (Commit Messages)

- 格式：`type(scope): 描述`
- 类型 (type)：
    - **feat**: 新功能
    - **fix**: 修补 Bug
    - **docs**: 文档变更
    - **style**: 格式（不影响代码运行的变动，如空格、格式化、缺少分号等）
    - **refactor**: 重构（即不是新增功能，也不是修改 Bug 的代码变动）
    - **perf**: 性能优化
    - **test**: 增加测试
    - **build**: 影响构建系统或外部依赖的更改
    - **ci**: 更改 CI 配置文件和脚本
    - **chore**: 构建过程或辅助工具的变动

## 版本管理 (Semantic Versioning)

- **MAJOR (主版本号)**: 当你做了不兼容的 API 修改。
- **MINOR (次版本号)**: 当你做了向下兼容的功能性新增。
- **PATCH (修订号)**: 当你做了向下兼容的问题修正。

## 合并请求规则 (Pull Request Rules)

1. 所有变更必须通过 Pull Request。
2. 至少需要 1 人审核通过。
3. CI 检查必须通过。
4. 禁止向受保护分支（main, develop）直接提交。
5. 分支在合并前必须与目标分支同步。
6. 合并后删除源分支。
