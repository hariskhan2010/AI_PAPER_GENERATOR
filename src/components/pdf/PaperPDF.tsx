import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { PaperData } from '@/types'

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 12, fontFamily: 'Helvetica' },
  title: { fontSize: 18, textAlign: 'center', marginBottom: 4, fontWeight: 'bold' },
  subtitle: { fontSize: 10, textAlign: 'center', marginBottom: 4, color: '#666' },
  divider: { borderBottomWidth: 1, borderBottomColor: '#000', marginVertical: 10 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, marginTop: 12 },
  question: { marginBottom: 8, lineHeight: 1.5 },
  questionNumber: { fontWeight: 'bold' },
  marks: { fontSize: 10, color: '#666' },
  subTitle: { fontSize: 11, fontWeight: 'bold', marginBottom: 4, marginTop: 8 },
  mcqOptions: { marginLeft: 16, fontSize: 10, marginBottom: 2 },
})

export function PaperPDF({ paper }: { paper: PaperData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{paper.paper_title}</Text>
        <Text style={styles.subtitle}>
          Class: {paper.class} | Subject: {paper.subject} | Marks: {paper.total_marks} | Time: {paper.time}
        </Text>
        <View style={styles.divider} />

        {paper.long_questions.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>
              Q.1 Long Questions ({paper.long_questions.reduce((s, q) => s + q.marks, 0)} Marks)
            </Text>
            {paper.long_questions.map((q) => (
              <View key={q.number} style={styles.question}>
                <Text>
                  <Text style={styles.questionNumber}>{q.number}. </Text>
                  {q.question}
                </Text>
                <Text style={styles.marks}>({q.marks} marks)</Text>
              </View>
            ))}
          </>
        )}

        {paper.short_questions.word_meanings.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Word Meanings</Text>
            {paper.short_questions.word_meanings.map((w, i) => (
              <Text key={i} style={styles.question}>
                {i + 1}. {w.word} ({w.urdu})
              </Text>
            ))}
          </>
        )}

        {paper.short_questions.sentences.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Make Sentences</Text>
            {paper.short_questions.sentences.map((s, i) => (
              <Text key={i} style={styles.question}>
                {i + 1}. {s}
              </Text>
            ))}
          </>
        )}

        {paper.short_questions.fill_blanks.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Fill in the Blanks</Text>
            {paper.short_questions.fill_blanks.map((fb, i) => (
              <Text key={i} style={styles.question}>
                {i + 1}. {fb.sentence}
              </Text>
            ))}
          </>
        )}

        {paper.short_questions.true_false.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>True / False</Text>
            {paper.short_questions.true_false.map((tf, i) => (
              <Text key={i} style={styles.question}>
                {i + 1}. {tf.statement}
              </Text>
            ))}
          </>
        )}

        {paper.short_questions.mcqs.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>MCQs</Text>
            {paper.short_questions.mcqs.map((mcq, i) => (
              <View key={i} style={styles.question}>
                <Text>
                  {i + 1}. {mcq.question}
                </Text>
                {mcq.options.map((opt, oi) => (
                  <Text key={oi} style={styles.mcqOptions}>
                    {String.fromCharCode(65 + oi)}) {opt}
                  </Text>
                ))}
              </View>
            ))}
          </>
        )}
      </Page>
    </Document>
  )
}
