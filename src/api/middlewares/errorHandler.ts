import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Erro de Validação',
      details: err.errors.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
      }))
    });
    return;
  }

  const normalizedMessage = err.message ? err.message.toLowerCase() : '';

  if (
    normalizedMessage.includes('não encontrado') ||
    normalizedMessage.includes('nao encontrado')
  ) {
    res.status(404).json({
      error: 'Recurso Não Encontrado',
      message: err.message
    });
    return;
  }

  if (
    normalizedMessage.includes('grupo') ||
    normalizedMessage.includes('mensagem') ||
    normalizedMessage.includes('membros') ||
    normalizedMessage.includes('autor') ||
    normalizedMessage.includes('assunto')
  ) {
    res.status(400).json({
      error: 'Erro de Regra de Domínio',
      message: err.message
    });
    return;
  }

  res.status(500).json({
    error: 'Erro Interno do Servidor',
    message: err.message || 'Ocorreu um erro inesperado no servidor.'
  });
}
