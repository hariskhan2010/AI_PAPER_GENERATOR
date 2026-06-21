import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { PaperData } from '@/types'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, fontFamily: 'Helvetica' },
  title: { fontSize: 18, textAlign: 'center', marginBottom: 4, fontWeight: 'bold' },
  subtitle: { fontSize: 10, textAlign: 'center', marginBottom: 4, color: '#666' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#000', marginVertical: 10 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 12 },
  answer: { marginBottom: 8, lineHeight: 1.5 },
  answerNumber: { fontWeight: 'bold' },
  answerText: { marginLeft: 12, fontSize: 11, color: '#333' },
    correctBadge: { fontSize: 10, color: '#059669', marginLeft: 4 },
})

export function AnswerKeyPDF({ paper }: { paper: PaperData }) {
  if (!paper.answer_key) return null

  const { answer_key } = paper

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Answer Key</Text>
        <Text style={styles.subtitle}>
          {paper.paper_title} — Class: {paper.class} | Subject: {paper.subject}
        </Text>
        <View style={styles.divider} />

        {answer_key.long_answers.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Long Questions — Model Answers</Text>
            {answer_key.long_answers.map((la) => (
              <View key={la.number} style={styles.answer}>
                <Text>
                  <Text style={styles.answerNumber}>Q.{la.number}</Text>
                </Text>
                <Text style={styles.answerText}>{la.answer}</Text>
              </View>
            ))}
          </>
        )}

        {answer_key.short_answers.word_meanings.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Word Meanings</Text>
            {answer_key.short_answers.word_meanings.map((w, i) => (
              <Text key={i} style={styles.answer}>
                {w.word} - {w.urdu} ({w.meaning})
              </Text>
            ))}
          </>
        )}

        {answer_key.short_answers.fill_blanks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Fill in the Blanks — Answers</Text>
            {answer_key.short_answers.fill_blanks.map((a, i) => (
              <Text key={i} style={styles.answer}>
                {i + 1}. {a}
              </Text>
            ))}
          </>
        )}

        {answer_key.short_answers.true_false.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>True / False — Answers</Text>
            {paper.short_questions.true_false.map((tf, i) => (
              <Text key={i} style={styles.answer}>
                {i + 1}. {tf.statement} —{' '}
                <Text style={styles.correctBadge}>
                  {answer_key.short_answers.true_false[i] ? 'TRUE' : 'FALSE'}
                </Text>
              </Text>
            ))}
          </>
        )}

        {answer_key.short_answers.mcqs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>MCQs — Answers</Text>
            {paper.short_questions.mcqs.map((mcq, i) => (
              <Text key={i} style={styles.answer}>
                {i + 1}. {mcq.question} —{' '}
                <Text style={styles.correctBadge}>{answer_key.short_answers.mcqs[i]}</Text>
              </Text>
            ))}
          </>
        )}
      </Page>
    </Document>
  )
}
