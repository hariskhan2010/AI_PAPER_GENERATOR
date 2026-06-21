import Tesseract from 'tesseract.js'
import { extractWithGemini } from './gemini'

export async function extractText(imageUrl: string): Promise<string> {
  try {
    const { data } = await Tesseract.recognize(imageUrl, 'eng+urd', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR progress: ${Math.round(m.progress * 100)}%`)
        }
      },
    })

    if (data.confidence < 70) {
      const imageResponse = await fetch(imageUrl)
      const imageBuffer = await imageResponse.arrayBuffer()
      const base64 = Buffer.from(imageBuffer).toString('base64')
      return await extractWithGemini(base64)
    }

    return data.text
  } catch (error) {
    console.error('OCR failed, falling back to Gemini:', error)
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()
    const base64 = Buffer.from(imageBuffer).toString('base64')
    return await extractWithGemini(base64)
  }
}
