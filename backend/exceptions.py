class AppError(Exception):
    status_code = 400
    message = "Application error"

    def __init__(self, message=None):
        if message:
            self.message = message
        super().__init__(self.message)


class NotFoundError(AppError):
    status_code = 404


class ValidationError(AppError):
    status_code = 422


class InsufficientStockError(AppError):
    status_code = 409


class ConflictError(AppError):
    status_code = 409