export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  WHATSAPP_API_ERROR = 'WHATSAPP_API_ERROR',
}

export class AppError extends Error {
  constructor(
    public message: string,
    public code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    public status: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }

  static unauthorized(msg = 'Não autorizado') {
    return new AppError(msg, ErrorCode.UNAUTHORIZED, 401);
  }

  static forbidden(msg = 'Acesso negado') {
    return new AppError(msg, ErrorCode.FORBIDDEN, 403);
  }

  static validation(msg: string, details?: any) {
    return new AppError(msg, ErrorCode.VALIDATION_ERROR, 400, details);
  }

  static internal(msg = 'Erro interno do servidor') {
    return new AppError(msg, ErrorCode.INTERNAL_ERROR, 500);
  }
}

export function handleServerError(error: unknown): never {
  console.error('[ServerError]:', error);

  if (error instanceof AppError) {
    throw error;
  }

  if (error instanceof Error) {
    // Check for common DB or Auth errors
    if (error.message.includes('JSON')) {
       throw AppError.validation('Dados inválidos recebidos');
    }
    throw new AppError(error.message, ErrorCode.INTERNAL_ERROR, 500);
  }

  throw AppError.internal();
}
