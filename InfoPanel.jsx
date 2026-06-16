// src/components/InfoPanel.jsx
import '../styles/panel.css';

function InfoPanel({ panelData, isOpen, onClose }) {
  const hasMeta = panelData && panelData.meta && panelData.meta.length > 0;
  const hasLink = panelData && panelData.link;
  const linkIsExternal = hasLink && panelData.link.url.startsWith('http');

  return (
    <aside
      className={`panel ${isOpen ? 'panel--open' : ''}`}
      aria-hidden={!isOpen}
    >
      <button
        className="panel__close"
        onClick={onClose}
        aria-label="Close panel"
      >
        ×
      </button>

      {panelData && (
        <div className="panel__content">
          <p className="panel__eyebrow">{panelData.eyebrow}</p>

          <h2 className="panel__title">
            {panelData.title}
          </h2>

          <p className="panel__body">
            {panelData.body}
          </p>

          {hasMeta && (
            <dl className="panel__meta">
              {panelData.meta.map((item) => (
                <div
                  className="panel__meta-row"
                  key={item.label}
                >
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          )}

          {hasLink && (
            <a
              className="panel__link"
              href={panelData.link.url}
              target={linkIsExternal ? '_blank' : undefined}
              rel={linkIsExternal ? 'noopener noreferrer' : undefined}
            >
              {panelData.link.label} →
            </a>
          )}
        </div>
      )}
    </aside>
  );
}

export default InfoPanel;