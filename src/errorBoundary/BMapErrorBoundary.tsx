import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

export interface BMapErrorBoundaryProps {
  fallback?: ReactNode;
  onError?: (error: Error, info: ErrorInfo) => void;
  children?: ReactNode;
}

interface State { hasError: boolean; error: Error | null; }

/**
 * 可选导出的错误边界（DESIGN.md §11.1）。
 *
 * 捕获子树抛出的 UnsupportedCapabilityError、SDK 异常等。
 * 用户可包在 <BMapProvider> 或 <Map> 外层。
 */
export class BMapErrorBoundary extends Component<BMapErrorBoundaryProps, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.props.onError?.(error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback ?? null;
    }
    return this.props.children;
  }
}
