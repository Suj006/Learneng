/** Re-mounts on every navigation inside the child world, giving each page a short, gentle entrance (off with reduced motion). */
export default function WorldTemplate({ children }: { children: React.ReactNode }) {
  return <div className="pv-enter">{children}</div>;
}
