import {
  MOBILE_FLOW_HINTS,
  MOBILE_SECTION_LABELS,
  MOBILE_SECTION_ORDER,
  type MobileSection
} from "../config";

interface MobileSectionNavProps {
  mobileSection: MobileSection;
  mobileStepIndex: number;
  mobileNextSection: MobileSection | null;
  onSelectSection: (section: MobileSection) => void;
}

export function MobileSectionNav({
  mobileSection,
  mobileStepIndex,
  mobileNextSection,
  onSelectSection
}: MobileSectionNavProps) {
  return (
    <div className="mobile-nav-sticky">
      <div className="mobile-section-bar">
        <label className="mobile-section-label" htmlFor="mobile-section">
          Vista (passo {mobileStepIndex + 1} di {MOBILE_SECTION_ORDER.length})
        </label>
        <select
          id="mobile-section"
          className="mobile-section-select"
          value={mobileSection}
          onChange={(event) => onSelectSection(event.target.value as MobileSection)}
        >
          <option value="upload">1 - Audio</option>
          <option value="model">2 - Modello</option>
          <option value="run">3 - Esecuzione</option>
          <option value="output">4 - Trascrizione</option>
        </select>
      </div>
      <div className="mobile-flow" aria-live="polite">
        <div className="mobile-flow-steps" aria-hidden="true">
          {MOBILE_SECTION_ORDER.map((id, index) => (
            <span
              key={id}
              className={`mobile-flow-dot ${index <= mobileStepIndex ? "mobile-flow-dot--done" : ""} ${
                index === mobileStepIndex ? "mobile-flow-dot--current" : ""
              }`}
            />
          ))}
        </div>
        <p className="mobile-flow-hint">{MOBILE_FLOW_HINTS[mobileSection]}</p>
        {mobileNextSection ? (
          <button
            type="button"
            className="secondary-button mobile-flow-next"
            onClick={() => onSelectSection(mobileNextSection)}
          >
            Continua - {MOBILE_SECTION_LABELS[mobileNextSection]}
          </button>
        ) : (
          <p className="mobile-flow-end">
            Hai completato i passi: puoi usare il menu per rivedere una sezione.
          </p>
        )}
      </div>
    </div>
  );
}
