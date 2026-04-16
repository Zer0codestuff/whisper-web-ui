interface PanelHeaderProps {
  step: string;
  label: string;
  title: string;
}

export function PanelHeader({ step, label, title }: PanelHeaderProps) {
  return (
    <div className="panel-heading">
      <span className="panel-step">{step}</span>
      <div>
        <p className="panel-label">{label}</p>
        <h2>{title}</h2>
      </div>
    </div>
  );
}
