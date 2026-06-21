'use client'

import type { PaperData } from '@/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface PaperPreviewProps {
  papers: Record<string, PaperData>
}

export function PaperPreview({ papers }: PaperPreviewProps) {
  const versions = Object.keys(papers)

  return (
    <Tabs defaultValue={versions[0]} className="w-full">
      <TabsList>
        {versions.map((v) => (
          <TabsTrigger key={v} value={v}>
            Version {v}
          </TabsTrigger>
        ))}
      </TabsList>
      {versions.map((v) => (
        <TabsContent key={v} value={v}>
          <div className="rounded-lg border bg-white p-8">
            <div className="mb-6 text-center">
              <h2 className="text-xl font-bold">{papers[v].paper_title}</h2>
              <p className="text-sm text-gray-600">
                Class: {papers[v].class} &middot; Subject: {papers[v].subject}
              </p>
              <p className="text-sm text-gray-600">
                Marks: {papers[v].total_marks} &middot; Time: {papers[v].time}
              </p>
            </div>

            {papers[v].long_questions.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-lg font-semibold">
                  Q.1 Long Questions ({papers[v].long_questions.reduce((s, q) => s + q.marks, 0)} Marks)
                </h3>
                {papers[v].long_questions.map((q) => (
                  <div key={q.number} className="mb-3">
                    <p>
                      <span className="font-medium">{q.number}.</span> {q.question}
                    </p>
                    <p className="text-sm text-gray-500">({q.marks} marks) [{q.difficulty}]</p>
                  </div>
                ))}
              </div>
            )}

            {(papers[v].short_questions.word_meanings.length > 0 ||
              papers[v].short_questions.sentences.length > 0 ||
              papers[v].short_questions.fill_blanks.length > 0 ||
              papers[v].short_questions.true_false.length > 0 ||
              papers[v].short_questions.mcqs.length > 0) && (
              <div>
                <h3 className="mb-3 text-lg font-semibold">Q.2 Short Questions</h3>

                {papers[v].short_questions.word_meanings.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium">Word Meanings</h4>
                    {papers[v].short_questions.word_meanings.map((w, i) => (
                      <p key={i} className="text-sm">
                        {w.word} - {w.urdu} ({w.meaning})
                      </p>
                    ))}
                  </div>
                )}

                {papers[v].short_questions.sentences.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium">Make Sentences</h4>
                    {papers[v].short_questions.sentences.map((s, i) => (
                      <p key={i} className="text-sm">
                        {i + 1}. {s}
                      </p>
                    ))}
                  </div>
                )}

                {papers[v].short_questions.fill_blanks.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium">Fill in the Blanks</h4>
                    {papers[v].short_questions.fill_blanks.map((fb, i) => (
                      <p key={i} className="text-sm">
                        {i + 1}. {fb.sentence}
                      </p>
                    ))}
                  </div>
                )}

                {papers[v].short_questions.true_false.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium">True/False</h4>
                    {papers[v].short_questions.true_false.map((tf, i) => (
                      <p key={i} className="text-sm">
                        {i + 1}. {tf.statement}
                      </p>
                    ))}
                  </div>
                )}

                {papers[v].short_questions.mcqs.length > 0 && (
                  <div className="mb-4">
                    <h4 className="mb-2 text-sm font-medium">MCQs</h4>
                    {papers[v].short_questions.mcqs.map((mcq, i) => (
                      <div key={i} className="mb-2 text-sm">
                        <p>{i + 1}. {mcq.question}</p>
                        <div className="ml-4 grid grid-cols-2 gap-1">
                          {mcq.options.map((opt, oi) => (
                            <p key={oi}>
                              {String.fromCharCode(65 + oi)}) {opt}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}
