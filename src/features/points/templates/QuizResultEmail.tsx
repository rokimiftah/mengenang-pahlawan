// src/components/points/templates/QuizResultEmail.tsx
/** biome-ignore-all lint/style/noNonNullAssertion: <> */

import type * as React from "react";

import { Body, Container, Head, Heading, Hr, Html, Link, Section, Text } from "@react-email/components";

export interface QuizResultEmailProps {
  userName?: string;
  heroName: string;
  total: number;
  correct: number;
  awarded: number;
  practice: boolean;
  breakdown?: Record<string, number>;
  sentAtText: string;
  ctaUrl?: string;
}

export function QuizResultEmail({
  userName,
  heroName,
  total,
  correct,
  awarded,
  practice,
  breakdown,
  sentAtText,
  ctaUrl = "https://mengenangpahlawan.web.id",
}: QuizResultEmailProps) {
  const pct = total > 0 ? Math.max(0, Math.min(100, Math.round((correct / total) * 100))) : 0;

  const perfect = correct === total && total > 0;
  const accent = perfect ? "#16a34a" : "#2563eb";

  const chips = breakdown && Object.keys(breakdown).length ? Object.entries(breakdown).map(([k, v]) => `${k} ${v}`) : [];

  return (
    <Html>
      <Head />
      <Body style={styles.main}>
        <Container style={styles.container}>
          <Section style={styles.header}>
            <Link href="https://mengenangpahlawan.web.id" style={styles.brandLink}>
              🇮🇩 Mengenang Pahlawan
            </Link>
          </Section>

          <Section style={styles.banner}>
            <Text style={styles.bannerEyebrow}>Hasil Kuis</Text>
            <Heading style={styles.bannerTitle}>
              {perfect ? "Sempurna!" : "Bagus!"} {userName ? userName : "Kawan"}
            </Heading>
            <Text style={styles.bannerSub}>
              Ringkasan hasil kuis Anda untuk <strong>{heroName}</strong>
            </Text>
          </Section>

          <Section style={styles.statsSection}>
            <div style={styles.statItem}>
              <div style={styles.statEyebrow}>Skor</div>
              <div style={styles.statValue}>
                {correct}/{total}
              </div>
              <div style={styles.progressOuter}>
                <div
                  style={{
                    ...styles.progressInner,
                    width: `${pct}%`,
                    backgroundColor: accent,
                  }}
                />
              </div>
              <div style={styles.progressLabel}>{pct}% benar</div>
            </div>

            <Hr style={styles.statDivider} />

            <div style={styles.statItem}>
              <div style={styles.statEyebrow}>Poin</div>
              <div
                style={{
                  ...styles.badge,
                  color: practice ? "#334155" : "#065f46",
                  backgroundColor: practice ? "#f1f5f9" : "#ecfdf5",
                  borderColor: practice ? "#e2e8f0" : "#a7f3d0",
                }}
              >
                {practice ? "Latihan" : `+${awarded}`}
              </div>
              <Text style={styles.muted}>
                {practice ? "Mode latihan — tidak menambah poin." : "Poin ditambahkan ke saldo Anda."}
              </Text>
            </div>

            <Hr style={styles.statDivider} />

            <div style={styles.statItem}>
              <div style={styles.statEyebrow}>Waktu</div>
              <div style={styles.statValueSm}>{sentAtText}</div>
              <Text style={styles.muted}>Simpan email ini sebagai catatan progres Anda.</Text>
            </div>

            {chips.length > 0 ? (
              <>
                <Hr style={styles.statDivider} />
                <div style={styles.statItem}>
                  <div style={styles.breakdownTitle}>Rincian</div>
                  <div style={styles.chipsRow}>
                    {chips.map((c) => (
                      <span key={c} style={styles.chip}>
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </Section>

          <Section style={styles.ctaWrap}>
            <Link style={{ ...styles.ctaBtn, backgroundColor: accent }} href={ctaUrl}>
              Lanjutkan Belajar
            </Link>
            <Text style={styles.ctaHint}>Buka aplikasi untuk melanjutkan latihan atau memilih pahlawan lainnya.</Text>
          </Section>

          <Hr style={styles.divider} />

          <Section style={styles.footer}>
            <Text style={styles.footerText}>Terima kasih telah menjaga semangat mengenang pahlawan. 🇮🇩</Text>
            <Text style={styles.footerTiny}>
              Anda menerima email ini karena menggunakan fitur kuis di Mengenang Pahlawan. Jika ini bukan Anda, abaikan email ini.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    backgroundColor: "#f1f5f9",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Helvetica Neue', sans-serif",
    color: "#0f172a",
    margin: 0,
    padding: "24px 0",
  },

  container: {
    maxWidth: "640px",
    width: "100%",
    margin: "0 auto",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid #e2e8f0",
  },

  header: {
    padding: "24px 0",
    textAlign: "center",
  },

  brandLink: {
    fontSize: 16,
    fontWeight: 700,
    color: "#334155",
    textDecoration: "none",
  },

  banner: {
    padding: "40px 32px",
    background: "linear-gradient(135deg, #fee2e2 0%, #fef3c7 100%)",
    borderTop: "1px solid #e2e8f0",
    borderBottom: "1px solid #e2e8f0",
  },

  bannerEyebrow: {
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
  },

  bannerTitle: {
    margin: "8px 0 4px",
    fontSize: 32,
    lineHeight: "40px",
    fontWeight: 800,
    color: "#0f172a",
  },

  bannerSub: {
    margin: 0,
    fontSize: 15,
    color: "#1f2937",

    lineHeight: "24px",
  },

  statsSection: {
    padding: "32px 32px 12px 32px",
  },

  statItem: {
    padding: "12px 0",
  },

  statDivider: {
    borderColor: "#e2e8f0",
    borderStyle: "dashed",
    margin: "0",
  },

  statEyebrow: {
    fontSize: 12,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
    fontWeight: 700,
  },

  statValue: {
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 10px",
  },

  statValueSm: {
    fontSize: 15,
    fontWeight: 600,
    color: "#0f172a",
    margin: "0 0 8px",
  },

  progressOuter: {
    width: "100%",
    height: 8,
    borderRadius: 9999,
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },

  progressInner: {
    height: "100%",
    borderRadius: 9999,
  },

  progressLabel: {
    marginTop: 8,
    fontSize: 12,
    color: "#475569",
  },

  badge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 9999,
    border: "1px solid",
    fontSize: 14,
    fontWeight: 700,
  },

  muted: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: "20px",
    color: "#64748b",
  },

  breakdownTitle: {
    fontSize: 12,
    fontWeight: 700,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },

  chipsRow: {
    display: "block",
  },

  chip: {
    display: "inline-block",
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 9999,
    backgroundColor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    color: "#0f172a",
    margin: "0 8px 8px 0",
    wordBreak: "break-word",
  },

  ctaWrap: {
    textAlign: "center",
    padding: "24px 32px 32px 32px",
  },

  ctaBtn: {
    display: "inline-block",
    padding: "14px 24px",
    borderRadius: 12,
    textDecoration: "none",
    color: "#ffffff",
    fontWeight: 700,
    fontSize: 15,
  },

  ctaHint: {
    marginTop: 12,
    fontSize: 13,
    color: "#64748b",
  },

  divider: {
    borderColor: "#e2e8f0",
    margin: "0",
  },

  footer: {
    padding: "24px 20px",
    textAlign: "center",
  },

  footerText: {
    margin: 0,
    fontSize: 13,
    color: "#475569",
  },

  footerTiny: {
    marginTop: 8,
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: "18px",
  },
};

export default QuizResultEmail;
