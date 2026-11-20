import { generateItineraryWithGemini, PlannerApiError } from './lib/geminiPlanner.ts';

interface ServerlessRequest {
  method?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}

interface ServerlessResponse {
  status: (code: number) => ServerlessResponse;
  json: (payload: unknown) => void;
  setHeader?: (name: string, value: string) => void;
}

const MAX_BODY_BYTES = 32 * 1024;

export default async function handler(req: ServerlessRequest, res: ServerlessResponse) {
  res.setHeader?.('Content-Type', 'application/json; charset=utf-8');
  res.setHeader?.('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST requests are supported for itinerary generation.',
        retryable: false,
      },
    });
    return;
  }

  const contentLengthHeader = req.headers?.['content-length'];
  const contentLength = Number(Array.isArray(contentLengthHeader) ? contentLengthHeader[0] : contentLengthHeader);
  if (Number.isFinite(contentLength) && contentLength > MAX_BODY_BYTES) {
    res.status(413).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message: 'Request payload is too large. Please shorten your additional instructions.',
        retryable: false,
      },
    });
    return;
  }

  let parsedBody: unknown = req.body;
  if (typeof parsedBody === 'string') {
    if (Buffer.byteLength(parsedBody, 'utf8') > MAX_BODY_BYTES) {
      res.status(413).json({
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request payload is too large.',
          retryable: false,
        },
      });
      return;
    }
    try {
      parsedBody = JSON.parse(parsedBody);
    } catch {
      res.status(400).json({
        error: {
          code: 'INVALID_JSON',
          message: 'Request body must be valid JSON.',
          retryable: false,
        },
      });
      return;
    }
  }

  try {
    const serializedLen = parsedBody ? Buffer.byteLength(JSON.stringify(parsedBody), 'utf8') : 0;
    if (serializedLen > MAX_BODY_BYTES) {
      res.status(413).json({
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request payload exceeds the maximum allowed size.',
          retryable: false,
        },
      });
      return;
    }

    const itinerary = await generateItineraryWithGemini(parsedBody);
    res.status(200).json({ data: itinerary });
  } catch (err) {
    if (err instanceof PlannerApiError) {
      res.status(err.statusCode).json({
        error: {
          code: err.code,
          message: err.message,
          retryable: err.retryable,
        },
      });
      return;
    }

    res.status(500).json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred while generating your itinerary. Please try again.',
        retryable: true,
      },
    });
  }
}
