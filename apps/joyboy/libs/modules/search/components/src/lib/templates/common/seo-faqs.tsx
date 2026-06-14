'use client';

import React from 'react';
import {
  Stack,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  AccordionGroup,
  Divider,
  Box,
  Container,
} from '@castlery/fortress';
import { JsonLd } from '@castlery/seo';

export type SeoFaqItem = {
  question?: string;
  answer?: string;
  title?: string;
  description?: string;
  question_text?: string;
  question_answer?: string;
};

function parseSeoContent(seoContent?: string | null) {
  if (!seoContent) return { titles: [] as string[], sections: [] as string[] };
  const h2StartReg = /<h2[^>]*>/gi;
  const h2EndReg = /<\/h2[^>]*>/gi;
  const titleReg = /<h2>(.*?)<\/h2>/g;
  const contentReg = /<section>[\s\S]*?<\/section>/g;
  let content = seoContent;
  let ignoreFirst = true;
  content = content.replace(h2StartReg, (tag) => {
    if (!ignoreFirst) return `</section>${tag}`;
    ignoreFirst = false;
    return tag;
  });
  content = content.replace(h2EndReg, (tag) => `${tag}<section>`);
  content = `${content}</section>`;
  const titles: string[] = [];
  const sections: string[] = [];
  content.replace(titleReg, (_, $1) => {
    titles.push($1);
    return _;
  });
  const matches = content.match(contentReg) || [];
  matches.forEach((sec) => {
    sections.push(sec.replace(/^<section>/, '').replace(/<\/section>$/, ''));
  });
  return { titles, sections };
}

export function SeoFaqs({
  title,
  seoContent,
  faqs = [],
}: {
  title?: string;
  seoContent?: string | null;
  faqs?: SeoFaqItem[] | null;
}) {
  const { titles, sections } = parseSeoContent(seoContent || undefined);
  const hasSeo = titles.length > 0;
  const normalizedFaqs = Array.isArray(faqs)
    ? faqs
        .map((f) => ({
          q: f.question || f.title || f.question_text,
          a: f.answer || f.description || f.question_answer,
        }))
        .filter((x) => x.q && x.a)
    : [];
  const hasFaqs = normalizedFaqs.length > 0;
  if (!hasSeo && !hasFaqs) return null;
  return (
    <>
      <JsonLd
        code={{
          '@type': 'FAQPage',
          '@context': 'https://schema.org',
          mainEntity: normalizedFaqs.map((f) => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.a,
            },
          })),
        }}
      />
      <Box my={{ xs: 8, md: 9 }}>
        <Divider
          sx={{
            mb: {
              xs: 8,
              md: 9,
            },
          }}
        />
        <Stack>
          {hasSeo && (
            <Container>
              <Stack
                mx={{
                  xs: 6,
                  md: 0,
                }}
              >
                {title && (
                  <Typography level="subh2" component={'h2'} mb={4}>
                    {title}
                  </Typography>
                )}
                <AccordionGroup>
                  {titles.map((t, i) => (
                    <Accordion key={`seo-${i}`}>
                      <AccordionSummary>
                        <Typography level="h5" component={'h3'}>
                          {t}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box dangerouslySetInnerHTML={{ __html: sections[i] || '' }} />
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </AccordionGroup>
              </Stack>
            </Container>
          )}
          {hasFaqs && <Divider sx={{ my: { xs: 6, md: 7 } }} />}
          {hasFaqs && (
            <Container>
              <Stack
                mx={{
                  xs: 6,
                  md: 0,
                }}
              >
                <Typography level="subh2" mb={4} component={'h2'}>
                  FAQ
                </Typography>
                <AccordionGroup>
                  {normalizedFaqs.map((f, i) => (
                    <Accordion key={`faq-${i}`}>
                      <AccordionSummary>
                        <Typography level="h5" component={'h3'}>
                          {f.q}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box dangerouslySetInnerHTML={{ __html: f.a || '' }} />
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </AccordionGroup>
              </Stack>
            </Container>
          )}
        </Stack>
      </Box>
    </>
  );
}

export default SeoFaqs;
