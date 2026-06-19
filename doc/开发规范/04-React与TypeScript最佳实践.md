# React 与 TypeScript 最佳实践

## React 开发规范

### 组件结构
- 优先使用函数式组件 (Functional Components) 而不是类组件。
- 保持组件短小且专注，每个组件应只负责单一功能。
- 将可复用的逻辑提取到自定义 Hooks 中。
- 优先使用组合 (Composition) 而不是继承。
- 使用 TypeScript 为 Props 定义明确的类型。

### Hooks 使用
- 严格遵循 Hooks 规则（不在循环、条件或嵌套函数中调用 Hooks）。
- 使用自定义 Hooks 封装可复用的业务逻辑或副作用。
- 正确管理 `useEffect` 的依赖数组，并在需要时实现清理函数。
- 避免过度嵌套 Hooks。

### 状态管理
- 使用 `useState` 处理组件局部状态。
- 使用 `useReducer` 处理复杂的组件内部状态逻辑。
- 对于跨组件共享的状态，使用 Context API。
- 遵循“状态提升”原则，将状态保持在尽可能接近使用它的地方。
- 使用 Zustand 等状态库处理复杂的全局状态。

### 性能优化
- 适当使用 `useMemo` 和 `useCallback` 进行记忆化。
- 对于渲染开销大的组件，使用 `React.memo`。
- 避免不必要的重新渲染。
- 实现路由级的懒加载 (Lazy Loading)。
- 在列表渲染中始终提供唯一的 `key`。

### 错误处理
- 使用错误边界 (Error Boundaries) 捕获组件树中的错误。
- 优雅地处理异步错误，并向用户展示友好的错误信息。
- 提供合理的回退 UI (Fallback UI)。

## TypeScript 使用规范

### 类型系统
- 优先使用 `interface` 定义对象，使用 `type` 定义联合类型、交叉类型或映射类型。
- 避免使用 `any` 类型，对于不确定类型优先使用 `unknown`。
- 开启 TypeScript 的严格模式 (`strict: true`)。
- 善用 TypeScript 内置的工具类型（如 `Pick`, `Omit`, `Partial`）。
- 使用泛型来增强代码的可复用性。

### 命名约定
- 类型 (`type`) 和接口 (`interface`) 使用 `PascalCase` 命名。
- 变量和函数使用 `camelCase` 命名。
- 常量使用 `UPPER_CASE` 命名。
- 描述性命名应包含辅助动词（如 `isLoading`, `hasError`）。
- React 组件的 Props 接口通常以 `Props` 结尾（如 `ButtonProps`）。

### 代码组织
- 类型定义应尽可能靠近使用它们的地方。
- 共享的类型应导出到专门的 `types` 目录或文件中。
- 使用 `index.ts` 进行模块导出管理。
- 同步放置组件及其对应的类型定义。

### 函数
- 为公共函数提供明确的返回类型定义。
- 在回调和方法中使用箭头函数。
- 优先使用 `async/await` 而不是原生 Promise。

### 最佳实践
- 为不可变属性使用 `readonly`。
- 使用辨识联合 (Discriminated Unions) 来确保类型安全。
- 在运行时使用类型守卫 (Type Guards) 进行类型检查。
- 处理可能为 `null` 或 `undefined` 的情况。
- 除非绝对必要且安全，否则避免使用类型断言 (Type Assertion, `as`)。
