import { Component, type ReactNode } from "react";

export function WebGLFallback() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
      <div className="border border-sci-cyan/20 rounded-xl p-8 bg-white/5 backdrop-blur-sm text-center max-w-xs">
        <div className="w-16 h-16 mx-auto mb-4 border-2 border-sci-cyan/30 rounded-lg flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-sci-cyan/50">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sci-cyan/60 text-xs font-mono tracking-wider uppercase mb-1">3D Viewport</p>
        <p className="text-white/30 text-xs">WebGL not available</p>
        <p className="text-white/20 text-[10px] mt-1">GPU acceleration required</p>
      </div>
    </div>
  );
}

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class WebGLErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="w-full h-full flex flex-col items-center justify-center text-white/40">
          <div className="border border-sci-cyan/20 rounded-xl p-8 bg-white/5 backdrop-blur-sm text-center max-w-xs">
            <div className="w-16 h-16 mx-auto mb-4 border-2 border-sci-cyan/30 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-sci-cyan/50">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <p className="text-sci-cyan/60 text-xs font-mono tracking-wider uppercase mb-1">3D Viewport</p>
            <p className="text-white/30 text-xs">WebGL not available</p>
            <p className="text-white/20 text-[10px] mt-1">GPU acceleration required</p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
