export class ApplicationError extends Error {
  constructor(message: string) {
    super(message);
  }
}

export class PermissionError extends ApplicationError {
  constructor(message?: string) {
    super(message ?? "권한이 없습니다.");
  }
}

export class ValidationError extends ApplicationError {
  constructor(message?: string) {
    super(message ?? "유효성 검사에 실패했습니다.");
  }
}

export class NotFoundError extends ApplicationError {
  constructor(message?: string) {
    super(message ?? "찾을 수 없습니다.");
  }
}
