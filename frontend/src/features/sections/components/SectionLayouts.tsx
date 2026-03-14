import { useState, type CSSProperties, type JSX } from "react";
import { TypewriterText } from "../../../Components/TypewriterText";
import { useCanHover } from "../../../hooks/useCanHover";
import type { FixedSection, SectionCard, SectionCardMediaAsset, SectionLayout } from "../types/section";

type SectionLayoutRendererProps = {
  section: FixedSection;
  variantIndex: number;
};

type SectionLayoutRenderer = (props: SectionLayoutRendererProps) => JSX.Element;

function getRevealDelayStyle(index: number): CSSProperties {
  return { "--item-index": index } as CSSProperties;
}

function getProjectMediaShellStyle(media?: SectionCardMediaAsset): CSSProperties | undefined {
  if (!media?.width || !media?.height) {
    return undefined;
  }

  return {
    aspectRatio: `${media.width} / ${media.height}`,
  };
}

function getContactHref(title: string, value: string): string | undefined {
  if (title === "Email") {
    return `mailto:${value}`;
  }

  if (title === "Phone") {
    return `tel:${value.replace(/[^\d+]/g, "")}`;
  }

  return undefined;
}

function looksLikeExperiencePeriod(value: string): boolean {
  return /(?:present|current|20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(value);
}

function splitExperienceValue(value: string): { headline?: string; period?: string } {
  const match = value.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
  if (!match) {
    const separatedMatch = value.match(/^(.*?)\s*[·•]\s*(.+)$/);
    if (separatedMatch && looksLikeExperiencePeriod(separatedMatch[2])) {
      return {
        headline: separatedMatch[1].trim(),
        period: separatedMatch[2].trim(),
      };
    }

    if (looksLikeExperiencePeriod(value)) {
      return { period: value.trim() };
    }

    return { headline: value };
  }

  return {
    headline: match[1].trim(),
    period: match[2].trim(),
  };
}

function getExperienceMarkerLabel(index: number, period?: string): string {
  if (index === 0) {
    return "Now";
  }

  if (period) {
    const yearMatch = period.match(/(20\d{2})/);
    if (yearMatch) {
      return yearMatch[1];
    }
  }

  return String(index + 1).padStart(2, "0");
}

function isExperienceFocusCard(card: SectionCard): boolean {
  return card.kind === "experience-focus";
}

function renderProjectMediaAsset(media: SectionCardMediaAsset, className: string): JSX.Element {
  if (media.kind === "video") {
    return (
      <video
        className={className}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={media.poster}
        aria-label={media.alt}
        disablePictureInPicture
        disableRemotePlayback
        controlsList="nodownload nofullscreen noplaybackrate noremoteplayback"
      >
        <source src={media.src} type={media.mimeType ?? "video/mp4"} />
      </video>
    );
  }

  return <img className={className} src={media.src} alt={media.alt} loading="lazy" />;
}

function HomeLayout({ section, variantIndex }: SectionLayoutRendererProps) {
  return (
    <div className={`section-content section-content--${variantIndex}`}>
      {section.eyebrow ? (
        <h1 className="section-title section-title--hero">
          <TypewriterText
            text={section.eyebrow}
            className="section-title__typed"
            characterDelay={0.085}
            initialDelay={0.15}
            showCursor
          />
        </h1>
      ) : null}
      <p className="section-description">{section.text}</p>
      {section.highlights && section.highlights.length > 0 ? (
        <ul className="section-highlights" aria-label={`${section.title} strengths`}>
          {section.highlights.map((highlight, index) => (
            <li key={highlight} className="section-highlights__item" style={getRevealDelayStyle(index)}>
              {highlight}
            </li>
          ))}
        </ul>
      ) : null}
      {section.cards && section.cards.length > 0 ? (
        <div className="section-cards" aria-label={`${section.title} quick facts`}>
          {section.cards.map((card) => (
            <article key={`${section.id}-${card.title}`} className="section-card">
              <p className="section-card__title">{card.title}</p>
              <p className="section-card__value">{card.value}</p>
              <p className="section-card__description">{card.description}</p>
            </article>
          ))}
        </div>
      ) : null}
      {section.cta ? <p className="section-cta">{section.cta}</p> : null}
    </div>
  );
}

function AboutLayout({ section }: SectionLayoutRendererProps) {
  return (
    <div className="about-layout">
      <header className="about-layout__intro">
        {section.eyebrow ? <p className="section-eyebrow">{section.eyebrow}</p> : null}
        <h2>{section.title}</h2>
        <p className="section-description">{section.text}</p>
      </header>

      <div className="about-layout__body">
        <aside className="about-layout__signals">
          <p className="about-layout__label">What I Bring</p>
          <ul className="about-layout__highlights" aria-label={`${section.title} highlights`}>
            {(section.highlights ?? []).map((highlight, index) => (
              <li key={highlight} style={getRevealDelayStyle(index)}>
                {highlight}
              </li>
            ))}
          </ul>
        </aside>

        <div className="about-layout__cards" aria-label={`${section.title} key details`}>
          {(section.cards ?? []).map((card) => (
            <article key={`${section.id}-${card.title}`} className="about-layout__card">
              <p className="about-layout__card-title">{card.title}</p>
              <p className="about-layout__card-value">{card.value}</p>
              <p className="about-layout__card-description">{card.description}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProjectsLayout({ section }: SectionLayoutRendererProps) {
  const canHover = useCanHover();
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null);
  const cards = section.cards ?? [];
  const projects = cards.slice(0, 2);
  const attributes = cards.slice(2);

  return (
    <div className="projects-layout">
      <header className="projects-layout__intro">
        {section.eyebrow ? <p className="section-eyebrow">{section.eyebrow}</p> : null}
        <h2>{section.title}</h2>
        <p className="section-description">{section.text}</p>
      </header>

      <div className="projects-layout__projects" aria-label={`${section.title} projects`}>
        {projects.map((card, index) => {
          const expandedMedia = card.media?.expanded ?? card.media?.preview;
          const shouldRenderExpandedMedia = Boolean(
            expandedMedia && (!canHover || activeProjectIndex === index),
          );

          return (
            <article
              key={`${section.id}-${card.title}`}
              className={`projects-layout__project-card ${index === 0 ? "projects-layout__project-card--primary" : ""}`}
              onPointerEnter={() => {
                if (canHover) {
                  setActiveProjectIndex(index);
                }
              }}
              onPointerLeave={() => {
                if (canHover) {
                  setActiveProjectIndex((currentIndex) => (
                    currentIndex === index ? null : currentIndex
                  ));
                }
              }}
            >
              <p className="projects-layout__project-kicker">{index === 0 ? "Featured project" : "Selected project"}</p>
              <p className="projects-layout__project-title">{card.title}</p>
              <p className="projects-layout__project-value">{card.value}</p>
              <div className="projects-layout__project-details">
                <p className="projects-layout__project-description">{card.description}</p>
                {(expandedMedia || (card.detailItems && card.detailItems.length > 0)) ? (
                  <div className="projects-layout__project-hover">
                    <div className="projects-layout__project-hover-inner">
                      <div className="projects-layout__project-expanded-body">
                        {shouldRenderExpandedMedia && expandedMedia ? (
                          <div className="projects-layout__project-expanded-media">
                            <div
                              className="projects-layout__project-expanded-media-shell"
                              style={getProjectMediaShellStyle(expandedMedia)}
                            >
                              {renderProjectMediaAsset(expandedMedia, "projects-layout__project-expanded-media-asset")}
                            </div>
                          </div>
                        ) : null}
                        {card.detailItems && card.detailItems.length > 0 ? (
                          <div className="projects-layout__project-capabilities">
                            <p className="projects-layout__project-hover-label">Key capabilities</p>
                            <ul className="projects-layout__project-points" aria-label={`${card.title} detail points`}>
                              {card.detailItems.map((detail) => (
                                <li key={detail}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>

      <div className="projects-layout__attributes" aria-label={`${section.title} technical attributes`}>
        <p className="projects-layout__attributes-label">Technical Focus</p>
        <div className="projects-layout__attribute-grid">
          {attributes.map((card) => (
            <article key={`${section.id}-${card.title}`} className="projects-layout__attribute-card">
              <p className="projects-layout__attribute-title">{card.title}</p>
              <p className="projects-layout__attribute-value">{card.value}</p>
              <p className="projects-layout__attribute-description">{card.description}</p>
            </article>
          ))}
        </div>
      </div>

      <ul className="projects-layout__tags" aria-label={`${section.title} focus tags`}>
        {(section.highlights ?? []).map((highlight, index) => (
          <li key={highlight} style={getRevealDelayStyle(index)}>
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExperienceLayout({ section }: SectionLayoutRendererProps) {
  const cards = section.cards ?? [];
  const roleCards = cards.filter((card) => !isExperienceFocusCard(card));
  const focusCards = cards.filter(isExperienceFocusCard);

  return (
    <div className="experience-layout">
      <header className="experience-layout__intro">
        {section.eyebrow ? <p className="section-eyebrow">{section.eyebrow}</p> : null}
        <h2>{section.title}</h2>
        <p className="section-description">{section.text}</p>
      </header>

      <div className="experience-layout__body">
        <div className="experience-layout__timeline" aria-label={`${section.title} workplace timeline`}>
          {roleCards.map((card, index) => {
            const { headline, period } = splitExperienceValue(card.value);
            const isCurrent = index === 0;
            const markerLabel = getExperienceMarkerLabel(index, period);
            const hasConnector = index < roleCards.length - 1;

            return (
              <article
                key={`${section.id}-${card.title}`}
                className={`experience-layout__entry${isCurrent ? " experience-layout__entry--current" : ""}`}
              >
                <div className="experience-layout__rail" aria-hidden="true">
                  <span className={`experience-layout__node${isCurrent ? " experience-layout__node--current" : ""}`} />
                  {hasConnector ? <span className="experience-layout__connector" /> : null}
                </div>
                <div className="experience-layout__content">
                  <div className="experience-layout__entry-topline">
                    <p className="experience-layout__entry-title">{card.title}</p>
                    <span className="experience-layout__entry-step">{markerLabel}</span>
                  </div>
                  {headline ? (
                    <div className="experience-layout__entry-header">
                      <p className="experience-layout__entry-value">{headline}</p>
                      {period ? <p className="experience-layout__entry-period">{period}</p> : null}
                    </div>
                  ) : period ? (
                    <p className="experience-layout__entry-period experience-layout__entry-period--standalone">
                      {period}
                    </p>
                  ) : null}
                  <p className="experience-layout__entry-description">{card.description}</p>
                </div>
              </article>
            );
          })}
        </div>

        {focusCards.length > 0 ? (
          <aside className="experience-layout__focus" aria-label={`${section.title} scope across roles`}>
            <p className="experience-layout__focus-label">Scope across roles</p>
            <div className="experience-layout__focus-grid">
              {focusCards.map((card) => (
                <article key={`${section.id}-${card.title}`} className="experience-layout__focus-card">
                  <p className="experience-layout__focus-title">{card.title}</p>
                  <p className="experience-layout__focus-value">{card.value}</p>
                  <p className="experience-layout__focus-description">{card.description}</p>
                </article>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </div>
  );
}

function ContactLayout({ section }: SectionLayoutRendererProps) {
  const cards = section.cards ?? [];
  const primaryCards = cards.slice(0, 3);
  const secondaryCards = cards.slice(3);
  const emailCard = cards.find((card) => card.title === "Email");
  const ctaHref = emailCard ? getContactHref(emailCard.title, emailCard.value) : undefined;

  const renderCardValue = (title: string, value: string) => {
    const href = getContactHref(title, value);
    if (!href) {
      return <p className="contact-layout__card-value">{value}</p>;
    }

    return (
      <a className="contact-layout__card-value contact-layout__card-link" href={href}>
        {value}
      </a>
    );
  };

  return (
    <div className="contact-layout">
      <header className="contact-layout__intro">
        {section.eyebrow ? <p className="section-eyebrow">{section.eyebrow}</p> : null}
        <h2>{section.title}</h2>
        <p className="section-description">{section.text}</p>
      </header>

      {section.cta ? (
        ctaHref ? (
          <a className="contact-layout__cta" href={ctaHref} aria-label="Email Gal Mankedi about a role or project">
            {section.cta}
          </a>
        ) : (
          <p className="contact-layout__cta">{section.cta}</p>
        )
      ) : null}

      <div className="contact-layout__primary" aria-label="Best ways to reach me">
        {primaryCards.map((card) => (
          <article key={`${section.id}-${card.title}`} className="contact-layout__card contact-layout__card--primary">
            <p className="contact-layout__card-title">{card.title}</p>
            {renderCardValue(card.title, card.value)}
            <p className="contact-layout__card-description">{card.description}</p>
          </article>
        ))}
      </div>

      {secondaryCards.length > 0 ? (
        <div className="contact-layout__secondary" aria-label="Additional contact details">
          {secondaryCards.map((card) => (
            <article key={`${section.id}-${card.title}`} className="contact-layout__card">
              <p className="contact-layout__card-title">{card.title}</p>
              {renderCardValue(card.title, card.value)}
              <p className="contact-layout__card-description">{card.description}</p>
            </article>
          ))}
        </div>
      ) : null}

      <ul className="contact-layout__highlights" aria-label="Availability">
        {(section.highlights ?? []).map((highlight, index) => (
          <li key={highlight} style={getRevealDelayStyle(index)}>
            {highlight}
          </li>
        ))}
      </ul>
    </div>
  );
}

// Layout registry keeps section shell stable while enabling richer per-section components over time.
const SECTION_LAYOUT_RENDERERS: Record<SectionLayout, SectionLayoutRenderer> = {
  home: HomeLayout,
  about: AboutLayout,
  projects: ProjectsLayout,
  experience: ExperienceLayout,
  contact: ContactLayout,
};

export function SectionLayout(props: SectionLayoutRendererProps): JSX.Element {
  const RenderLayout = SECTION_LAYOUT_RENDERERS[props.section.layout];
  return <RenderLayout {...props} />;
}
