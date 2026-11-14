import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));

  // Endpoint for animating an uploaded photo into a 16:9 or 9:16 video using gemini-omni-1.2-flash via Interactions API
  app.post('/api/animate-video', async (req, res) => {
    try {
      const { imageBase64, mimeType, prompt, aspectRatio } = req.body as {
        imageBase64?: string;
        mimeType?: string;
        prompt?: string;
        aspectRatio?: '16:9' | '9:16';
      };

      if (!imageBase64) {
        res.status(400).json({ error: 'Vui lòng tải lên một bức ảnh trước khi tạo video.' });
        return;
      }

      const validAspectRatio: '16:9' | '9:16' = aspectRatio === '9:16' ? '9:16' : '16:9';
      const motionPrompt =
        prompt && prompt.trim().length > 0
          ? prompt.trim()
          : 'Hoạt ảnh vũ trụ Toán học 3D sinh động, các tia sáng góc học và ngôi sao chuyển động mượt mà.';

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(403).json({
          error:
            'Tính năng tạo video với mô hình gemini-omni-1.2-flash yêu cầu cấu hình GEMINI_API_KEY trả phí trong mục Settings > Secrets.',
        });
        return;
      }

      const ai = new GoogleGenAI({ apiKey });

      const interaction = await ai.interactions.create(
        {
          model: 'gemini-omni-1.2-flash',
          input: [
            {
              type: 'image',
              mime_type: mimeType || 'image/png',
              data: imageBase64,
            },
            {
              type: 'text',
              text: motionPrompt,
            },
          ],
          background: false,
          store: false,
          stream: false,
          response_format: {
            type: 'video',
            aspect_ratio: validAspectRatio,
          },
        },
        { timeout: 300000 }
      );

      const videoPart = interaction.output_video;
      if (videoPart && videoPart.data) {
        const videoMime = videoPart.mime_type || 'video/mp4';
        res.json({
          videoDataUrl: `data:${videoMime};base64,${videoPart.data}`,
          aspectRatio: validAspectRatio,
        });
        return;
      }

      if (videoPart && videoPart.uri) {
        res.json({
          videoDataUrl: videoPart.uri,
          aspectRatio: validAspectRatio,
        });
        return;
      }

      res.status(500).json({
        error: 'Không nhận được dữ liệu video từ mô hình gemini-omni-1.2-flash.',
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const status =
        msg.includes('403') || msg.includes('PERMISSION_DENIED') || msg.includes('API_KEY_INVALID')
          ? 403
          : msg.includes('429') || msg.includes('RESOURCE_EXHAUSTED')
          ? 429
          : 500;
      res.status(status).json({
        error:
          status === 403 || status === 429
            ? 'Mô hình tạo video gemini-omni-1.2-flash yêu cầu API Key trả phí. Vui lòng kiểm tra GEMINI_API_KEY trong Settings > Secrets.'
            : `Lỗi khi tạo video: ${msg}`,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
