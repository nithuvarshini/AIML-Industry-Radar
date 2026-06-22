export default function Card({ children, className = '', hover = true, style, delay = 0 }) {
  return (
    <div
      className={`glass-card ${hover ? 'glass-card-hover' : ''} ${className}`}
      style={delay ? { animationDelay: `${delay}ms`, ...style } : style}
    >
      {children}
    </div>
  );
}
