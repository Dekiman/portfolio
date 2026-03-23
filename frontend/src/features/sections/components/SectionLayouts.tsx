import { useMemo, type CSSProperties, type JSX } from "react";
import { PopupCards, type PopupCardItem } from "../../projects/components/PopupCards";
import { TypewriterText } from "../../../ui/typography/TypewriterText";
import type {
  FixedSection,
  SectionCard,
  SectionLayout,
} from "../types/section";
import {
  InlineExpandableText,
} from "./ExpandableDescription";

type SectionLayoutRendererProps = {
  section: FixedSection;
  variantIndex: number;
};

type SectionLayoutRenderer = (props: SectionLayoutRendererProps) => JSX.Element;

function getRevealDelayStyle(index: number): CSSProperties {
  return { "--item-index": index } as CSSProperties;
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
  return /(?:present|current|20\d{2}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(
    value,
  );
}

function splitExperienceValue(value: string): {
  headline?: string;
  period?: string;
} {
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

function toPopupCardId(sectionId: string, title: string): string {
  return `${sectionId}-${title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function getProjectCardEyebrow(card: SectionCard, index: number): string {
  if (index === 0) {
    return "Featured personal build";
  }

  switch (card.title) {
    case "TrackListings":
      return "Workflow study";
    case "Red Alert":
      return "Live alert demo";
    case "Boostify":
      return "Real world application";
    case "Stock Prediction":
      return "Prediction experiment";
    default:
      return "Personal build";
  }
}

function getTextParagraphs(text: string): string[] {
  return text
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function splitIntoColumns<T>(items: readonly T[], columnCount: number): T[][] {
  const columns = Array.from({ length: columnCount }, () => [] as T[]);

  items.forEach((item, index) => {
    columns[index % columnCount]?.push(item);
  });

  return columns;
}

function AboutLayout({ section, variantIndex }: SectionLayoutRendererProps) {
  const textParagraphs = getTextParagraphs(section.text);
  const isLeadSection = variantIndex === 1;
  const highlights = section.highlights ?? [];
  const cards = section.cards ?? [];
  const factColumns = useMemo(() => splitIntoColumns(cards, 2), [cards]);

  return (
    <div className="about-layout">
      <header
        className={`about-layout__intro${isLeadSection ? " about-layout__intro--lead" : ""}`}
      >
        {isLeadSection ? (
          <p className="section-eyebrow">{section.title}</p>
        ) : null}

        {section.eyebrow ? (
          isLeadSection ? (
            <h1 className="section-title section-title--hero">
              <TypewriterText
                text={section.eyebrow}
                className="section-title__typed"
                characterDelay={0.085}
                initialDelay={0.15}
                showCursor
              />
            </h1>
          ) : (
            <p className="section-eyebrow">{section.eyebrow}</p>
          )
        ) : null}

        <div className="about-layout__copy">
          {textParagraphs.map((paragraph, index) => (
            <p
              key={`${section.id}-paragraph-${index + 1}`}
              className="section-description"
            >
              {paragraph}
            </p>
          ))}
        </div>
      </header>

      {highlights.length > 0 ? (
        <ul
          className="about-layout__highlights"
          aria-label={`${section.title} highlights`}
        >
          {highlights.map((highlight, index) => (
            <li key={highlight} style={getRevealDelayStyle(index)}>
              {highlight}
            </li>
          ))}
        </ul>
      ) : null}

      {cards.length > 0 ? (
        <dl
          className="about-layout__facts"
          aria-label={`${section.title} key details`}
        >
          {factColumns.map((column, columnIndex) => (
            <div
              key={`${section.id}-fact-column-${columnIndex + 1}`}
              className="about-layout__fact-column"
            >
              {column.map((card) => {
                const hasDetails = (card.detailItems?.length ?? 0) > 0;

                return (
                  <div
                    key={`${section.id}-${card.title}`}
                    className={`about-layout__fact${hasDetails ? " about-layout__fact--interactive" : ""}`}
                    tabIndex={hasDetails ? 0 : undefined}
                  >
                    <dt className="about-layout__card-title">{card.title}</dt>
                    <dd className="about-layout__fact-copy">
                      <p className="about-layout__card-value">{card.value}</p>
                      <p className="about-layout__card-description">
                        {card.description}
                      </p>

                      {hasDetails ? (
                        <div className="about-layout__fact-details">
                          <div className="about-layout__fact-details-inner">
                            <ul className="about-layout__fact-detail-list">
                              {card.detailItems?.map((detail) => (
                                <li key={`${card.title}-${detail}`}>{detail}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ) : null}
                    </dd>
                  </div>
                );
              })}
            </div>
          ))}
        </dl>
      ) : null}
    </div>
  );
}

function ProjectsLayout({ section }: SectionLayoutRendererProps) {
  const projectCards = useMemo<PopupCardItem[]>(
    () => (section.cards ?? []).map((card, index) => ({
      id: toPopupCardId(section.id, card.title),
      eyebrow: getProjectCardEyebrow(card, index),
      title: card.title,
      subtitle: card.value,
      description: card.description,
      detailItems: card.detailItems,
      media: card.media,
      featured: index === 0,
      surfaceTone: card.surfaceTone,
    })),
    [section.cards, section.id],
  );

  return (
    <div className="projects-layout">
      <header className="projects-layout__intro">
        {section.eyebrow ? (
          <p className="section-eyebrow">{section.eyebrow}</p>
        ) : null}
        <p className="section-description">{section.text}</p>
      </header>

      <PopupCards
        items={projectCards}
        ariaLabel={`${section.title} projects`}
      />

      <ul
        className="projects-layout__tags"
        aria-label={`${section.title} focus tags`}
      >
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
        {section.eyebrow ? (
          <p className="section-eyebrow">{section.eyebrow}</p>
        ) : null}
        <p className="section-description">{section.text}</p>
      </header>

      <div className="experience-layout__body">
        <div
          className="experience-layout__timeline"
          aria-label={`${section.title} workplace timeline`}
        >
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
                  <span
                    className={`experience-layout__node${isCurrent ? " experience-layout__node--current" : ""}`}
                  />
                  {hasConnector ? (
                    <span className="experience-layout__connector" />
                  ) : null}
                </div>

                <div className="experience-layout__content">
                  <div className="experience-layout__entry-topline">
                    <p className="experience-layout__entry-title">
                      {card.title}
                    </p>
                    <span className="experience-layout__entry-step">
                      {markerLabel}
                    </span>
                  </div>

                  {headline ? (
                    <div className="experience-layout__entry-header">
                      <InlineExpandableText
                        value={headline}
                        description={card.description}
                        valueClassName="experience-layout__entry-value"
                        descriptionClassName="experience-layout__entry-description"
                        wrapperClassName="mt-1"
                      />
                      {period ? (
                        <p className="experience-layout__entry-period">
                          {period}
                        </p>
                      ) : null}
                    </div>
                  ) : period ? (
                    <>
                      <p className="experience-layout__entry-period experience-layout__entry-period--standalone">
                        {period}
                      </p>

                      <InlineExpandableText
                        value="Details"
                        description={card.description}
                        valueClassName="experience-layout__entry-value"
                        descriptionClassName="experience-layout__entry-description"
                        wrapperClassName="mt-2"
                      />
                    </>
                  ) : (
                    <InlineExpandableText
                      value="Details"
                      description={card.description}
                      valueClassName="experience-layout__entry-value"
                      descriptionClassName="experience-layout__entry-description"
                      wrapperClassName="mt-2"
                    />
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {focusCards.length > 0 ? (
          <aside
            className="experience-layout__focus"
            aria-label={`${section.title} scope across roles`}
          >
            <p className="experience-layout__focus-label">Scope across roles</p>
            <div className="experience-layout__focus-grid">
              {focusCards.map((card) => (
                <article
                  key={`${section.id}-${card.title}`}
                  className="experience-layout__focus-card"
                >
                  <p className="experience-layout__focus-title">{card.title}</p>

                  <InlineExpandableText
                    value={card.value}
                    description={card.description}
                    valueClassName="experience-layout__focus-value"
                    descriptionClassName="experience-layout__focus-description"
                    wrapperClassName="mt-1"
                  />
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
  const ctaHref = emailCard
    ? getContactHref(emailCard.title, emailCard.value)
    : undefined;

  const renderCardValue = (title: string, value: string) => {
    const href = getContactHref(title, value);
    if (!href) {
      return <p className="contact-layout__card-value">{value}</p>;
    }

    return (
      <a
        className="contact-layout__card-value contact-layout__card-link"
        href={href}
      >
        {value}
      </a>
    );
  };

  return (
    <div className="contact-layout">
      <header className="contact-layout__intro">
        {section.eyebrow ? (
          <p className="section-eyebrow">{section.eyebrow}</p>
        ) : null}
        <p className="section-description">{section.text}</p>
      </header>

      {section.cta ? (
        ctaHref ? (
          <a
            className="contact-layout__cta"
            href={ctaHref}
            aria-label="Email Gal Mankedi about a role or project"
          >
            {section.cta}
          </a>
        ) : (
          <p className="contact-layout__cta">{section.cta}</p>
        )
      ) : null}

      <div
        className="contact-layout__primary"
        aria-label="Best ways to reach me"
      >
        {primaryCards.map((card) => (
          <article
            key={`${section.id}-${card.title}`}
            className="contact-layout__card contact-layout__card--primary"
          >
            <p className="contact-layout__card-title">{card.title}</p>
            {renderCardValue(card.title, card.value)}
            <p className="contact-layout__card-description">
              {card.description}
            </p>
          </article>
        ))}
      </div>

      {secondaryCards.length > 0 ? (
        <div
          className="contact-layout__secondary"
          aria-label="Additional contact details"
        >
          {secondaryCards.map((card) => (
            <article
              key={`${section.id}-${card.title}`}
              className="contact-layout__card"
            >
              <p className="contact-layout__card-title">{card.title}</p>
              {renderCardValue(card.title, card.value)}
              <p className="contact-layout__card-description">
                {card.description}
              </p>
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
  about: AboutLayout,
  projects: ProjectsLayout,
  experience: ExperienceLayout,
  contact: ContactLayout,
};

export function SectionLayout(props: SectionLayoutRendererProps): JSX.Element {
  const RenderLayout = SECTION_LAYOUT_RENDERERS[props.section.layout];
  return <RenderLayout {...props} />;
}
